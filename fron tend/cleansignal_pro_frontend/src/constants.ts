import { Sector, Region, Lesson, StatusStep } from './types';

export const sectors: Sector[] = [
  { key: 'education', label: 'Ta\'lim', icon: '🎓' },
  { key: 'medicine', label: 'Tibbiyot', icon: '🏥' },
  { key: 'construction', label: 'Qurilish', icon: '🏗️' },
  { key: 'sport', label: 'Sport', icon: '⚽' },
  { key: 'publicServices', apiKey: 'public', label: 'Davlat xizmatlari', icon: '🏛️' },
  { key: 'transport', label: 'Transport', icon: '🚌' },
  { key: 'procurement', label: 'Davlat xaridlari', icon: '📦' },
];

export const fallbackRegions: Region[] = [
  { region: 'Tashkent', risk_score: 82, risk_level: 'Critical', reports: 142, top_sector: 'education', trend: '+28%', avg_response_time_days: 11, pattern: 'Imtihon va qabul jarayonida norasmiy to\'lovlar' },
  { region: 'Fergana', risk_score: 74, risk_level: 'High', reports: 118, top_sector: 'medicine', trend: '+19%', avg_response_time_days: 13, pattern: 'Bepul tibbiy xizmat uchun qo\'shimcha to\'lov so\'rash' },
  { region: 'Samarkand', risk_score: 67, risk_level: 'High', reports: 96, top_sector: 'construction', trend: '+12%', avg_response_time_days: 10, pattern: 'Ruxsatnoma va qurilish hujjatlarida tezlashtirish to\'lovlari' },
  { region: 'Andijan', risk_score: 59, risk_level: 'Medium', reports: 88, top_sector: 'publicServices', trend: '+8%', avg_response_time_days: 12, pattern: 'Davlat xizmatlarida navbatni tezlashtirish so\'rovlari' },
  { region: 'Namangan', risk_score: 54, risk_level: 'Medium', reports: 73, top_sector: 'transport', trend: '+6%', avg_response_time_days: 9, pattern: 'Litsenziya va yo\'nalish ruxsatnomalari' },
  { region: 'Bukhara', risk_score: 47, risk_level: 'Medium', reports: 61, top_sector: 'procurement', trend: '-2%', avg_response_time_days: 8, pattern: 'Bir xil yetkazib beruvchi takrorlanishi' },
  { region: 'Khorezm', risk_score: 36, risk_level: 'Low', reports: 39, top_sector: 'sport', trend: '-5%', avg_response_time_days: 7, pattern: 'Tanlov va saralashda tanish-bilishchilik xavfi' },
  { region: 'Karakalpakstan', risk_score: 41, risk_level: 'Medium', reports: 35, top_sector: 'publicServices', trend: '+3%', avg_response_time_days: 6, pattern: 'Hujjatlarni ko\'rib chiqishdagi kechikishlar' },
  { region: 'Kashkadarya', risk_score: 71, risk_level: 'High', reports: 84, top_sector: 'construction', trend: '+16%', avg_response_time_days: 14, pattern: 'Tender shartlari bitta kompaniyaga mos yozilgani haqidagi signallar' },
  { region: 'Surkhandarya', risk_score: 45, risk_level: 'Medium', reports: 42, top_sector: 'medicine', trend: '+4%', avg_response_time_days: 10, pattern: 'Dori va xizmat uchun norasmiy to\'lovlar' },
  { region: 'Jizzakh', risk_score: 33, risk_level: 'Low', reports: 28, top_sector: 'education', trend: '-1%', avg_response_time_days: 6, pattern: 'Kirish imtihoniga oid savollar' },
  { region: 'Sirdarya', risk_score: 30, risk_level: 'Low', reports: 22, top_sector: 'transport', trend: '+2%', avg_response_time_days: 5, pattern: 'Ruxsatnoma jarayonidagi noaniqliklar' },
  { region: 'Navoi', risk_score: 49, risk_level: 'Medium', reports: 48, top_sector: 'procurement', trend: '+7%', avg_response_time_days: 9, pattern: 'Xarid narxlari va muddatlaridagi noaniqlik' },
];

export const lessons: Lesson[] = [
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

export const statusSteps: StatusStep[] = [
  { key: 'SUBMITTED', label: 'Submitted', text: 'Report xavfsiz qabul qilindi.' },
  { key: 'AI_CHECKED', label: 'AI checked', text: 'AI struktura, risk va to\'liqlikni baholadi.' },
  { key: 'MODERATOR_REVIEWING', label: 'Moderator review', text: 'Moderator faktlarni tekshirmoqda.' },
  { key: 'MORE_EVIDENCE_NEEDED', label: 'More info needed', text: 'Qo\'shimcha dalil yoki aniqlik kerak.' },
  { key: 'SENT_TO_AGENCY', label: 'Sent to agency', text: 'Mas\'ul organga yuborildi.' },
  { key: 'AGENCY_DEADLINE_STARTED', label: 'Response deadline', text: 'Agentlik javob muddati boshlandi.' },
  { key: 'CONFIRMED', label: 'Confirmed / Not', text: 'Natija rasmiy ko\'rib chiqildi.' },
  { key: 'REWARD_REVIEW', label: 'Reward review', text: 'Mukofot imkoniyati tekshirilmoqda.' },
  { key: 'CLOSED', label: 'Closed', text: 'Case yopildi.' },
];

export const riskClass: Record<string, string> = { Low: 'risk-low', Medium: 'risk-medium', High: 'risk-high', Critical: 'risk-critical' };