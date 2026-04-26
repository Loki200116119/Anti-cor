import { Region, LocalAiResult, TrackedReport } from './types';
import { sectors, riskClass } from './constants';

export function normalizeRisk(level: string | undefined, score: number): string {
  if (level) return level;
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
}

export function sectorLabel(key: string): string {
  const sector = sectors.find(s => s.key === key || s.apiKey === key);
  return sector?.label || key || 'Ta\'lim';
}

export function localAnalyze(report: Partial<{
  category: string;
  description: string;
  location: string;
  organization: string;
  incident_date: string;
  has_evidence: boolean;
  danger_flag: boolean;
}>): LocalAiResult {
  const text = `${report.description || ''} ${report.category || ''}`.toLowerCase();
  let score = 22;
  const suggestions: string[] = [];
  if ((report.description || '').length > 120) score += 22; else suggestions.push('Tavsifga aniq vaqt, joy va nima so\'ralganini qo\'shing.');
  if (report.location) score += 14; else suggestions.push('Joylashuvni qo\'shing.');
  if (report.organization) score += 14; else suggestions.push('Tashkilot nomini kiriting.');
  if (report.incident_date) score += 8;
  if (report.has_evidence) score += 22; else suggestions.push('Agar xavfsiz bo\'lsa, dalil fayl qo\'shing.');
  if (/(pora|pul|tender|otkat|to\'lov|tolov|sovg|tanish)/i.test(text)) score += 10;
  score = Math.min(score, 96);
  return {
    risk_score: score,
    category: report.category || '',
    urgency: report.danger_flag || score >= 80 ? 'High' : score >= 55 ? 'Medium' : 'Low',
    evidence_strength: report.has_evidence ? (score >= 70 ? 'High' : 'Medium') : 'Low',
    completeness: Math.min(100, score + (report.has_evidence ? 3 : -8)),
    reward_potential: score >= 70 && report.has_evidence ? 'possible' : 'not_eligible_yet',
    suggestions,
    next_step: 'Moderator review',
    ai_mode: 'frontend_fallback',
  };
}

export function saveLocalReport(report: TrackedReport): void {
  const reports = JSON.parse(localStorage.getItem('cs_reports') || '[]');
  localStorage.setItem('cs_reports', JSON.stringify([report, ...reports.filter(r => r.tracking_id !== report.tracking_id)]));
}

export function getLocalReports(): TrackedReport[] {
  try { return JSON.parse(localStorage.getItem('cs_reports') || '[]'); } catch { return []; }
}

export function statusIndex(status: string): number {
  const steps = ['SUBMITTED', 'AI_CHECKED', 'MODERATOR_REVIEWING', 'MORE_EVIDENCE_NEEDED', 'SENT_TO_AGENCY', 'AGENCY_DEADLINE_STARTED', 'CONFIRMED', 'REWARD_REVIEW', 'CLOSED'];
  const index = steps.indexOf(status);
  return index >= 0 ? index : 1;
}