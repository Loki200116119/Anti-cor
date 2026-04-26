import React from 'react';

interface HeroProps {
  setActive: (active: string) => void;
}

function Hero({ setActive }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div>
          <div className="eyebrow">✨ Professional GovTech MVP</div>
          <h1>Korrupsiyaga qarshi kurashishni o'rganing, xabar bering va kuzating.</h1>
          <p>CleanSignal fuqarolar va yoshlarni korrupsiya risklarini tushunish, dalil bilan xavfsiz report yuborish va real progressni kuzatishga jalb qiladi.</p>
          <div className="hero-actions">
            <button onClick={() => setActive('report')}>Xabar yuborish</button>
            <button onClick={() => setActive('learn')} className="ghost">Reward qoidalari</button>
          </div>
        </div>
        <div className="hero-card">
          <div className="card-head">
            <b>Live AI preview</b>
            <span>Human review required</span>
          </div>
          <div className="score-ring">81</div>
          <div className="mini-grid">
            <span>Risk score</span>
            <b>81/100</b>
            <span>Urgency</span>
            <b>High</b>
            <span>Reward</span>
            <b>Possible</b>
          </div>
        </div>
      </div>
      <div className="trust-row">
        <span>🔒 Anonymous reporting</span>
        <span>📎 Evidence safety</span>
        <span>🤖 AI assists</span>
        <span>👤 Humans decide</span>
        <span>⏱️ Transparent tracking</span>
      </div>
    </section>
  );
}

export default Hero;