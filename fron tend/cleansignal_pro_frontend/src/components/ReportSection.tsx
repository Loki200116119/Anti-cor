import React, { useState } from 'react';
import SectionTitle from './SectionTitle';
import { Report, LocalAiResult, SubmitState } from '../types';
import { sectors } from '../constants';
import { sectorLabel } from '../utils';

interface ReportSectionProps {
  report: Report;
  setReport: (report: Partial<Report>) => void;
  localAi: LocalAiResult;
  writingSuggestion: string;
  submitState: SubmitState;
  submitReport: () => void;
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!value)} className={value ? 'yes' : ''}>
        <i />
      </button>
    </label>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="info">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function ReportSection({ report, setReport, localAi, writingSuggestion, submitState, submitReport }: ReportSectionProps) {
  const [step, setStep] = useState(0);
  const steps = ['Category', 'Description', 'Region & location & time', 'Organization', 'Evidence', 'Safety', 'Review'];

  const set = (k: keyof Report, v: any) => setReport({ ...report, [k]: v });

  // Form validation
  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: return !!report.category;
      case 1: return report.description.trim().length > 10;
      case 2: return !!report.region.trim();
      case 3: return !!report.organization.trim();
      case 4: return true; // Evidence is optional
      case 5: return true; // Safety is optional
      case 6: return true; // Review
      default: return false;
    }
  };

  const canProceed = validateStep(step);

  return (
    <section>
      <SectionTitle icon="⬆️" eyebrow="Send Report" title="Smart UX bilan step-based report form" subtitle="Userni yo'naltiradi: nima bo'ldi, qayerda, qachon, qaysi tashkilot, dalil, anonimlik va safety." />
      <div className="report-layout">
        <aside className="stepper">
          {steps.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`${i === step ? 'active' : ''} ${i < step ? 'done' : ''} ${!validateStep(i) && i > step ? 'invalid' : ''}`}
            >
              <span>{i + 1}</span>
              {s}
            </button>
          ))}
        </aside>
        <div className="form-panel">
          {step === 0 && (
            <div>
              <h3>Category</h3>
              <div className="category-grid">
                {sectors.map(s => (
                  <button
                    key={s.key}
                    onClick={() => set('category', s.apiKey || s.key)}
                    className={report.category === (s.apiKey || s.key) ? 'active' : ''}
                  >
                    {s.icon}
                    <b>{s.label}</b>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <h3>What happened?</h3>
              <textarea
                value={report.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Masalan: Tender talablari faqat bitta kompaniya uchun yozilgandek ko'rinadi..."
              />
              <div className="assistant">
                <b>🤖 AI Writing Assistant</b>
                <p>{writingSuggestion}</p>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3>Location & time</h3>
              <select
                value={report.region}
                onChange={e => set('region', e.target.value)}
              >
                <option value="">Select region</option>
                {[
                  'Tashkent', 'Fergana', 'Samarkand', 'Andijan', 'Namangan', 'Bukhara',
                  'Khorezm', 'Karakalpakstan', 'Kashkadarya', 'Surkhandarya', 'Jizzakh', 'Sirdarya', 'Navoi'
                ].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input
                value={report.location}
                onChange={e => set('location', e.target.value)}
                placeholder="Specific location (optional)"
              />
              <input
                type="date"
                value={report.incident_date}
                onChange={e => set('incident_date', e.target.value)}
              />
            </div>
          )}
          {step === 3 && (
            <div>
              <h3>Organization</h3>
              <input
                value={report.organization}
                onChange={e => set('organization', e.target.value)}
                placeholder="Which organization?"
              />
              <input
                value={report.requested}
                onChange={e => set('requested', e.target.value)}
                placeholder="What was requested or offered?"
              />
            </div>
          )}
          {step === 4 && (
            <div>
              <h3>Evidence upload</h3>
              <label className="drop">
                <input
                  type="file"
                  onChange={e => set('file', e.target.files?.[0] || null)}
                />
                <span>📎 Drag & drop / click to upload</span>
                <small>photo, video, audio, document, screenshots. Do not risk your safety to collect evidence.</small>
              </label>
              {report.file && <div className="success">Selected: {report.file.name}</div>}
            </div>
          )}
          {step === 5 && (
            <div>
              <h3>Safety</h3>
              <Toggle
                label="Anonymous?"
                value={report.anonymous}
                onChange={v => set('anonymous', v)}
              />
              <Toggle
                label="Are you in danger?"
                value={report.danger_flag}
                onChange={v => set('danger_flag', v)}
              />
              <div className="warn">
                ⚠ Do not risk your safety to collect evidence. AI assists analysis; final decisions are made by human reviewers.
              </div>
            </div>
          )}
          {step === 6 && (
            <div>
              <h3>Review</h3>
              <Info label="Category" value={sectorLabel(report.category)} />
              <Info label="Region" value={report.region || '—'} />
              <Info label="Location" value={report.location || '—'} />
              <Info label="When" value={report.incident_date || '—'} />
              <Info label="Organization" value={report.organization || '—'} />
              <Info label="Evidence" value={report.file ? report.file.name : 'No file'} />
              <div className="local-ai">
                <b>Local AI preview</b>
                <span>Risk {localAi.risk_score}/100 · {localAi.urgency} · completeness {localAi.completeness}%</span>
              </div>
            </div>
          )}
          <div className="form-actions">
            <button disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(step + 1)} disabled={!canProceed}>Next</button>
            ) : (
              <button onClick={submitReport} disabled={submitState.loading || !canProceed}>
                {submitState.loading ? 'Sending...' : 'Submit safely'}
              </button>
            )}
          </div>
          {submitState.error && <div className="warn">{submitState.error}</div>}
        </div>
      </div>
    </section>
  );
}

export default ReportSection;