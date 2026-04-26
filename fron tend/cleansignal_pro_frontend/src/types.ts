export interface Sector {
  key: string;
  label: string;
  icon: string;
  apiKey?: string;
}

export interface Region {
  region: string;
  risk_score: number;
  risk_level?: string;
  reports: number;
  top_sector: string;
  trend: string;
  avg_response_time_days: number;
  pattern: string;
}

export interface Lesson {
  title: string;
  icon: string;
  time: string;
  badge: string;
  short: string;
  points: string[];
  example: string;
  quiz: { q: string; a: string[]; correct: number }[];
}

export interface StatusStep {
  key: string;
  label: string;
  text: string;
}

export interface Report {
  category: string;
  description: string;
  location: string;
  incident_date: string;
  organization: string;
  requested: string;
  anonymous: boolean;
  danger_flag: boolean;
  file: File | null;
}

export interface LocalAiResult {
  risk_score: number;
  category: string;
  urgency: string;
  evidence_strength: string;
  completeness: number;
  reward_potential: string;
  suggestions: string[];
  next_step: string;
  ai_mode: string;
}

export interface TrackedReport {
  id?: number;
  tracking_id: string;
  status: string;
  ai_score?: number;
  category: string;
  reward_status?: string;
  messages?: { sender: string; message: string }[];
  timeline?: any[];
  ai_result?: LocalAiResult;
}

export interface Contact {
  name: string;
  email: string;
  question_type: string;
  message: string;
}

export interface SubmitState {
  loading: boolean;
  error: string;
  result: TrackedReport | null;
}