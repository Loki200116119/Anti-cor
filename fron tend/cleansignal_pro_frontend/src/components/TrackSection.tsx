import React from 'react';
import SectionTitle from './SectionTitle';
import { TrackedReport } from '../types';
import { sectorLabel, statusIndex } from '../utils';
import { statusSteps } from '../constants';

interface TrackSectionProps {
  trackId: string;
  setTrackId: (id: string) => void;
  tracked: TrackedReport | null;
  trackError: string;
  findReport: () => void;
  setActive: (active: string) => void;
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="info">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function TrackSection({ trackId, setTrackId, tracked, trackError, findReport, setActive }: TrackSectionProps) {
  const ai = tracked?.ai_result || {};
  const current = statusIndex(tracked?.status || '');

  return (
    <section>
      <SectionTitle icon="⏱️" eyebrow="Track My Report" title="Foydalanuvchi ignored bo'lib qolmaydi" subtitle="Tracking ID orqali status, deadline, moderator messages, reward status va next step ko'rinadi." />
      <div className="track-search">
        <input
          value={trackId}
          onChange={e => setTrackId(e.target.value)}
          placeholder="CS-2026-000123"
        />
        <button onClick={findReport}>Find report</button>
        <button className="ghost-btn" onClick={() => setActive('report')}>New report</button>
      </div>
      {trackError && <div className="warn">{trackError}</div>}
      {tracked ? (
        <div className="track-layout">
          <aside className="track-card">
            <h3>{tracked.tracking_id}</h3>
            <Info label="Risk score" value={`${ai.risk_score ?? tracked.ai_score ?? 0}/100`} />
            <Info label="Category" value={sectorLabel(ai.category || tracked.category)} />
            <Info label="Urgency" value={ai.urgency || 'Medium'} />
            <Info label="Evidence strength" value={ai.evidence_strength || 'Low'} />
            <Info label="Completeness" value={`${ai.completeness || 0}%`} />
            <Info label="Reward status" value={tracked.reward_status || ai.reward_potential || 'not eligible'} />
            <div className="deadline">
              <b>Deadlines</b>
              <p>Moderator review: 2–3 days</p>
              <p>Agency response: 15 working days</p>
            </div>
            <div className="impact">
              <b>Impact card</b>
              <p>You submitted: 1 report</p>
              <p>Under review: {current < 8 ? 1 : 0}</p>
              <p>Potential impact: {Number(ai.risk_score || 0) >= 70 ? 'High' : 'Medium'}</p>
            </div>
          </aside>
          <div className="timeline">
            {statusSteps.map((s, i) => (
              <div key={s.key} className={i <= current ? 'on' : ''}>
                <span>{i < current ? '✓' : i === current ? '⏱' : i + 1}</span>
                <div>
                  <b>{s.label}</b>
                  <p>{i === current ? 'Current step: ' : ''}{s.text}</p>
                </div>
              </div>
            ))}
            <div className="messages">
              <b>Moderator messages</b>
              {(tracked.messages?.length ? tracked.messages : [{ sender: 'System', message: 'Your report is under moderator review. Estimated time: 2–3 days.' }]).map((m, i) => (
                <p key={i}>
                  <strong>{m.sender}:</strong> {m.message}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="empty">Tracking ID kiriting yoki report yuboring.</div>
      )}
    </section>
  );
}

export default TrackSection;