import React, { useEffect, useMemo, useState } from 'react';
import { API_URL, createReport, getStats, healthCheck, sendContact, trackReport, uploadEvidence } from './api';
import { Region, Report, LocalAiResult, SubmitState, TrackedReport, Contact } from './types';
import { fallbackRegions, sectors, statusSteps } from './constants';
import { normalizeRisk, sectorLabel, localAnalyze, getLocalReports, statusIndex } from './utils';
import Header from './components/Header';
import Hero from './components/Hero';
import MapSection from './components/MapSection';
import LearnSection from './components/LearnSection';
import ReportSection from './components/ReportSection';
import TrackSection from './components/TrackSection';
import ContactSection from './components/ContactSection';

function App() {
  const [active, setActive] = useState('map');
  const [apiOnline, setApiOnline] = useState('checking');
  const [stats, setStats] = useState(null);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('Tashkent');
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [completed, setCompleted] = useState(() => JSON.parse(localStorage.getItem('cs_lessons') || '{}'));
  const [answers, setAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [report, setReport] = useState<Report>({
    category: 'education',
    description: '',
    location: '',
    region: '',
    incident_date: '',
    organization: '',
    requested: '',
    anonymous: true,
    danger_flag: false,
    file: null
  });
  const [submitState, setSubmitState] = useState<SubmitState>({ loading: false, error: '', result: null });
  const [trackId, setTrackId] = useState('');
  const [tracked, setTracked] = useState<TrackedReport | null>(null);
  const [trackError, setTrackError] = useState('');
  const [contact, setContact] = useState<Contact>({ name: '', email: '', question_type: 'report question', message: '' });

  useEffect(() => {
    healthCheck().then(() => setApiOnline('online')).catch(() => setApiOnline('offline'));
    getStats().then(setStats).catch(() => setStats(null));
  }, []);

  const regions: Region[] = stats?.regions?.length ? stats.regions : fallbackRegions;
  const pickedRegion = regions.find(r => r.region === selectedRegion) || regions[0];
  const filteredRegions = useMemo(() => {
    if (selectedSector === 'all') return regions;
    return [...regions].sort((a, b) => (b.top_sector === selectedSector ? 1 : 0) - (a.top_sector === selectedSector ? 1 : 0) || b.risk_score - a.risk_score);
  }, [regions, selectedSector]);

  const localAi: LocalAiResult = useMemo(() => localAnalyze({
    category: report.category,
    description: `${report.description} ${report.requested}`,
    location: report.location,
    organization: report.organization,
    incident_date: report.incident_date,
    has_evidence: Boolean(report.file),
    danger_flag: report.danger_flag,
  }), [report]);

  const writingSuggestion = useMemo(() => {
    if (!report.description || report.description.length < 35) return 'Please add where, when, what happened, and what was requested.';
    if (/poraxo'r|poraxor|jinoyatchi|poraxor|o'g'ri|ogri|ahmoq/i.test(report.description)) return 'Try to describe facts calmly. Avoid insults or unsupported accusations.';
    if (!report.location) return 'Good start. Add location so moderators can route the report correctly.';
    if (!report.organization) return 'Add the organization name if you know it.';
    return 'Good structure. Evidence can improve verification and reward review.';
  }, [report]);

  const progress = Math.round((Object.values(completed).filter(Boolean).length / 6) * 100);

  async function submitReport() {
    setSubmitState({ loading: true, error: '', result: null });
    const payload = {
      category: sectors.find(s => s.key === report.category)?.apiKey || report.category,
      description: `${report.description}\n\nRequested/offered: ${report.requested || 'Not specified'}`,
      location: report.location,
      region: report.region || report.location || 'Tashkent',
      organization: report.organization,
      incident_date: report.incident_date || null,
      anonymous: report.anonymous,
      danger_flag: report.danger_flag,
      has_evidence: Boolean(report.file),
    };
    try {
      let created = await createReport(payload);
      if (report.file && created?.report?.id) {
        try {
          created.report = await uploadEvidence(created.report.id, report.file);
        } catch (uploadError: any) {
          console.warn('Evidence upload failed:', uploadError.message);
          setSubmitState(prev => ({ ...prev, error: `Report submitted but evidence upload failed: ${uploadError.message}` }));
        }
      }
      const ai = created.ai_result || created.report?.ai_result || localAnalyze(payload);
      const normalized: TrackedReport = {
        ...created.report,
        tracking_id: created.tracking_id || created.report?.tracking_id,
        ai_result: ai,
        status: created.status || created.report?.status || 'AI_CHECKED'
      };
      setSubmitState({ loading: false, error: '', result: normalized });
      setTrackId(normalized.tracking_id || '');
      setTracked(normalized);
      setActive('track');
      getStats().then(setStats).catch(() => {});
    } catch (error: any) {
      const fallback: TrackedReport = {
        id: Date.now(),
        tracking_id: `CS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
        ...payload,
        status: 'AI_CHECKED',
        ai_score: localAi.risk_score,
        ai_result: localAi,
        reward_status: localAi.reward_potential,
        created_at: new Date().toISOString(),
        messages: [{ sender: 'System', message: 'Backend offline: report saved locally for demo.' }],
        timeline: statusSteps.slice(0, 2).map(s => ({ status: s.key, title: s.label, description: s.text, created_at: new Date().toISOString() })),
      };
      setSubmitState({ loading: false, error: `Backend ishlamadi, local demo mode: ${error.message}`, result: fallback });
      setTrackId(fallback.tracking_id);
      setTracked(fallback);
      setActive('track');
    }
  }

  async function findReport() {
    setTrackError('');
    setTracked(null);
    try {
      const data = await trackReport(trackId);
      setTracked(data);
    } catch (error) {
      const local = getLocalReports().find(r => r.tracking_id?.toLowerCase() === trackId.trim().toLowerCase());
      if (local) setTracked(local); else setTrackError('Report topilmadi. Tracking ID ni tekshiring.');
    }
  }

  function checkQuiz() {
    const lessons = [
      {
        title: 'Korrupsiya nima?', icon: '⚠️', time: '3 min', badge: 'Beginner',
        short: 'Vakolat yoki jamoat resursidan shaxsiy manfaat uchun foydalanish.',
        points: ['Korrupsiya faqat pora emas', 'Tanish-bilishchilik ham risk bo\'lishi mumkin', 'Report faktlarga asoslanishi kerak'],
        example: 'Davlat xodimi bepul xizmatni bajarish uchun norasmiy to\'lov so\'rasa, bu korrupsiya riski bo\'lishi mumkin.',
        quiz: [
          { q: 'Korrupsiya faqat pul olishmi?', a: ['Ha', 'Yo\'q', 'Faqat sovg\'a'], correct: 1 },
          { q: 'Report uchun nima muhim?', a: ['Fakt, vaqt, joy', 'Faqat emotsiya', 'Faqat ism'], correct: 0 },
          { q: 'AI yakuniy hukm chiqaradimi?', a: ['Ha', 'Yo\'q', 'Har doim'], correct: 1 },
        ],
      },
      {
        title: 'Nega korrupsiya zarar?', icon: '📉', time: '4 min', badge: 'Beginner',
        short: 'Budjet, adolat, xizmat sifati va davlatga ishonchga zarar yetkazadi.',
        points: ['Xizmat sifati pasayadi', 'Halol odamlar imkoniyatdan chetda qoladi', 'Budjet mablag\'i samarasiz sarflanadi'],
        example: 'Qurilishdagi korrupsiya sifatsiz maktab yoki yo\'l qurilishiga olib kelishi mumkin.',
        quiz: [
          { q: 'Korrupsiya kimga zarar?', a: ['Faqat davlatga', 'Jamiyatga', 'Hech kimga'], correct: 1 },
          { q: 'Kichik pora odatga aylansa?', a: ['Muammo kengayadi', 'Yaxshi bo\'ladi', 'Farqi yo\'q'], correct: 0 },
          { q: 'Dalilli signal nima beradi?', a: ['Riskni erta ko\'rsatadi', 'Spamni oshiradi', 'Faqat badge beradi'], correct: 0 },
        ],
      },
      {
        title: 'Qanday aniqlash?', icon: '🔎', time: '4 min', badge: 'Responsible Reporter',
        short: 'Norasmiy to\'lov, tanish orqali hal qilish, manfaatlar to\'qnashuvini tanish.',
        points: ['"Tezlashtirib beraman" kabi so\'zlar risk', 'Tender shartlari juda tor bo\'lsa risk', 'Bepul xizmat uchun pul so\'ralsa risk'],
        example: 'Tender talablari faqat bitta kompaniya mahsulotiga mos yozilgan bo\'lsa, bu signal bo\'lishi mumkin.',
        quiz: [
          { q: 'Bepul xizmat uchun pul so\'rash riskmi?', a: ['Ha', 'Yo\'q', 'Faqat kichik summa bo\'lsa yo\'q'], correct: 0 },
          { q: 'Manfaatlar to\'qnashuvi nima?', a: ['Qarindoshiga adolatsiz imkon berish', 'Navbatda turish', 'Ariza yozish'], correct: 0 },
          { q: 'Risk ko\'rsangiz nima qilasiz?', a: ['Fakt bilan report', 'Haqorat', 'Isbotsiz post'], correct: 0 },
        ],
      },
      {
        title: 'Xavfsiz report qilish', icon: '🛡️', time: '5 min', badge: 'Responsible Reporter',
        short: 'Faktlarga tayaning, o\'zingizni xavfga qo\'ymang, provokatsiya qilmang.',
        points: ['Anonim rejimdan foydalanish mumkin', 'Noqonuniy dalil yig\'mang', 'Nozik ma\'lumotlarni ochiq tarqatmang'],
        example: '"Falon sanada, falon joyda, falon xizmat uchun norasmiy to\'lov so\'raldi" kabi yozish foydaliroq.',
        quiz: [
          { q: 'Noqonuniy provokatsiya mumkinmi?', a: ['Ha', 'Yo\'q', 'Ba\'zida'], correct: 1 },
          { q: 'Report qanday bo\'lishi kerak?', a: ['Aniq va xolis', 'Haqoratli', 'Mish-mish'], correct: 0 },
          { q: 'Xavf bo\'lsa?', a: ['Anonim va ehtiyotkorlik', 'Ochiq e\'lon', 'Provokatsiya'], correct: 0 },
        ],
      },
      {
        title: 'Dalil yo\'riqnomasi', icon: '📄', time: '4 min', badge: 'Evidence Builder',
        short: 'Foto, video, audio, hujjat, screenshot va rasmiy havolalar tekshiruvga yordam beradi.',
        points: ['Asl faylni saqlang', 'Sana va manba ko\'rinsin', 'Soxta yoki montaj dalil yubormang'],
        example: 'Tender ID, lot raqami, g\'olib kompaniya va rasmiy havola kuchli dalil bo\'lishi mumkin.',
        quiz: [
          { q: 'Qaysi dalil foydali?', a: ['Hujjat va screenshot', 'Emotsiya', 'Begona rasm'], correct: 0 },
          { q: 'Faylni montaj qilish kerakmi?', a: ['Yo\'q', 'Ha', 'Har doim'], correct: 0 },
          { q: 'Dalil yakuniy hukmmi?', a: ['Yo\'q, tekshiruvga yordam', 'Ha', 'Har doim'], correct: 0 },
        ],
      },
      {
        title: 'Reward system', icon: '🎁', time: '5 min', badge: 'Verified Contributor',
        short: 'Foydali, dalilli va real tekshiruvga yordam bergan ma\'lumot reward reviewga o\'tadi.',
        points: ['Report foydali bo\'lishi kerak', 'Yolg\'on bo\'lmasligi kerak', 'Case outcome muhim'],
        example: 'Xabar asosida rasmiy tekshiruv boshlansa yoki xavfli pattern aniqlansa, reward review mumkin.',
        quiz: [
          { q: 'Reward nimaga beriladi?', a: ['Foydali ma\'lumotga', 'Ko\'p spamga', 'Haqoratga'], correct: 0 },
          { q: 'Yolg\'on report reward oladimi?', a: ['Yo\'q', 'Ha', 'Ba\'zida'], correct: 0 },
          { q: 'Reward qachon ko\'riladi?', a: ['Tekshiruvdan keyin', 'Darhol', 'Formani ochganda'], correct: 0 },
        ],
      },
    ];
    const lesson = lessons[selectedLesson];
    let correct = 0;
    lesson.quiz.forEach((q, i) => { if (answers[`${selectedLesson}-${i}`] === q.correct) correct += 1; });
    const score = Math.round((correct / lesson.quiz.length) * 100);
    setQuizScore(score);
    if (score >= 60) {
      const next = { ...completed, [selectedLesson]: true };
      setCompleted(next);
      localStorage.setItem('cs_lessons', JSON.stringify(next));
    }
  }

  const nav = [
    ['map', 'Corruption Map', '📍'],
    ['learn', 'Learn & Earn', '📚'],
    ['report', 'Send Report', '⬆️'],
    ['track', 'Track My Report', '⏱️'],
    ['contact', 'Contact & FAQ', '☎️']
  ];

  return (
    <main className="app">
      <Header nav={nav} active={active} setActive={setActive} apiOnline={apiOnline} />
      <Hero setActive={setActive} />
      <div className="container">
        {active === 'map' && (
          <MapSection
            stats={stats}
            regions={filteredRegions}
            pickedRegion={pickedRegion}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedSector={selectedSector}
            setSelectedSector={setSelectedSector}
            setActive={setActive}
          />
        )}
        {active === 'learn' && (
          <LearnSection
            selectedLesson={selectedLesson}
            setSelectedLesson={setSelectedLesson}
            completed={completed}
            progress={progress}
            answers={answers}
            setAnswers={setAnswers}
            quizScore={quizScore}
            setQuizScore={setQuizScore}
            checkQuiz={checkQuiz}
          />
        )}
        {active === 'report' && (
          <ReportSection
            report={report}
            setReport={setReport}
            localAi={localAi}
            writingSuggestion={writingSuggestion}
            submitState={submitState}
            submitReport={submitReport}
          />
        )}
        {active === 'track' && (
          <TrackSection
            trackId={trackId}
            setTrackId={setTrackId}
            tracked={tracked}
            trackError={trackError}
            findReport={findReport}
            setActive={setActive}
          />
        )}
        {active === 'contact' && (
          <ContactSection
            contact={contact}
            setContact={setContact}
          />
        )}
      </div>
      <footer className="footer">
        <b>CleanSignal</b>
        <span>AI assists analysis. Final decisions are made by human reviewers.</span>
      </footer>
    </main>
  );
}

export default App;