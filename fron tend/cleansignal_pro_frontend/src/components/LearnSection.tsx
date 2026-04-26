import React, { useState } from 'react';
import SectionTitle from './SectionTitle';
import { Lesson } from '../types';
import { lessons } from '../constants';

interface LearnSectionProps {
  selectedLesson: number;
  setSelectedLesson: (index: number) => void;
  completed: Record<number, boolean>;
  progress: number;
  answers: Record<string, number>;
  setAnswers: (answers: Record<string, number>) => void;
  quizScore: number | null;
  setQuizScore: (score: number | null) => void;
  checkQuiz: () => void;
}

function RewardGuide() {
  const blocks = [
    ['Valuable report', ['specific', 'detailed', 'real situation', 'includes context']],
    ['Accepted evidence', ['photo', 'video', 'audio', 'document', 'screenshots']],
    ['Process', ['Submit', 'AI check', 'Moderator', 'Agency', 'Result', 'Reward review']],
    ['Reward conditions', ['useful information', 'not fake', 'helps investigation', 'case outcome matters']],
    ['Rejection reasons', ['vague', 'no facts', 'emotional accusations', 'fake evidence', 'spam']],
  ];
  return (
    <div className="reward">
      <h3>🔥 Reward system — eng muhim qism</h3>
      <div className="reward-grid">
        {blocks.map(([title, items]) => (
          <div key={title}>
            <b>{title}</b>
            {(items as string[]).map(i => <p key={i}>✓ {i}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function LearnSection({ selectedLesson, setSelectedLesson, completed, progress, answers, setAnswers, quizScore, setQuizScore, checkQuiz }: LearnSectionProps) {
  const lesson = lessons[selectedLesson];

  return (
    <section>
      <SectionTitle icon="📚" eyebrow="Learn & Earn" title="Interaktiv mini darslar va reward guide" subtitle="Har bir dars qisqa tushuntirish, key points, example va 3 savolli quizdan iborat." />
      <div className="learn-layout">
        <aside>
          <div className="progress-card">
            <b>Learning progress</b>
            <strong>{progress}%</strong>
            <div className="progress">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>Badges: Beginner → Responsible Reporter → Verified Contributor</p>
          </div>
          {lessons.map((l, i) => (
            <button
              key={l.title}
              onClick={() => { setSelectedLesson(i); setQuizScore(null); }}
              className={`lesson-tab ${selectedLesson === i ? 'active' : ''}`}
            >
              <span>{l.icon}</span>
              <div>
                <b>{l.title}</b>
                <small>{l.time} · {l.badge}</small>
              </div>
              {completed[i] && <em>✓</em>}
            </button>
          ))}
        </aside>
        <div className="lesson-panel">
          <div className="lesson-head">
            <span>{lesson.icon}</span>
            <div>
              <h3>{lesson.title}</h3>
              <p>{lesson.short}</p>
            </div>
          </div>
          <div className="lesson-box">
            <h4>Key points</h4>
            {lesson.points.map(p => <p key={p}>✓ {p}</p>)}
          </div>
          <div className="lesson-box">
            <h4>Example</h4>
            <p>{lesson.example}</p>
          </div>
          <div className="quiz-box">
            <h4>Mini quiz</h4>
            {lesson.quiz.map((q, qi) => (
              <div key={q.q} className="question">
                <b>{qi + 1}. {q.q}</b>
                {q.a.map((a, ai) => (
                  <button
                    key={a}
                    onClick={() => setAnswers({ ...answers, [`${selectedLesson}-${qi}`]: ai })}
                    className={answers[`${selectedLesson}-${qi}`] === ai ? 'picked' : ''}
                  >
                    {a}
                  </button>
                ))}
              </div>
            ))}
            <button onClick={checkQuiz} className="full">Check quiz</button>
            {quizScore !== null && (
              <div className={quizScore >= 60 ? 'success' : 'warn'}>
                Natija: {quizScore}% {quizScore >= 60 ? '— lesson completed.' : '— retry needed.'}
              </div>
            )}
          </div>
        </div>
      </div>
      <RewardGuide />
    </section>
  );
}

export default LearnSection;