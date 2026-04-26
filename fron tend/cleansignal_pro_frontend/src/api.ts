const API_URL: string = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface RequestOptions extends RequestInit {}

async function request(path: string, options: RequestOptions = {}): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, options);
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = data?.detail || data?.message || `HTTP ${res.status}`;
    throw new Error(Array.isArray(message) ? message.map(m => m.msg || JSON.stringify(m)).join(', ') : message);
  }
  return data;
}

export async function healthCheck(): Promise<any> {
  return request('/health');
}

export async function getStats(): Promise<any> {
  return request('/stats');
}

export async function createReport(data: any): Promise<any> {
  return request('/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function uploadEvidence(reportId: string | number, file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  return request(`/reports/${reportId}/evidence`, {
    method: 'POST',
    body: form,
  });
}

export async function trackReport(trackingId: string): Promise<any> {
  return request(`/reports/track/${encodeURIComponent(trackingId.trim())}`);
}

export async function sendContact(payload: any): Promise<any> {
  return request('/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export { API_URL };
