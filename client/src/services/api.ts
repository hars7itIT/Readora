const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
export async function fetchRaw(url: string): Promise<{ text: string; contentType: string }> {
  const response = await fetch(`${API_BASE}/api/fetch?url=${encodeURIComponent(url)}`);
  const body = await response.text();
  if (!response.ok) throw new Error(readApiError(body, `Fetch failed (${response.status})`));
  return { text: body, contentType: response.headers.get('content-type') || '' };
}
export async function getPopular() {
  const r = await fetch(`${API_BASE}/api/discovery/popular`);
  if (!r.ok) throw new Error('Discovery service is unavailable.');
  return (await r.json()).feeds as { url: string; title: string; count: number }[];
}
export async function getRecommendations(feeds: string[]) {
  const r = await fetch(`${API_BASE}/api/discovery/recommendations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feeds }) });
  if (!r.ok) throw new Error('Could not load recommendations.');
  return (await r.json()).feeds as { url: string; title: string; count: number; reason: string }[];
}
export async function shareSubscriptions(feeds: string[]) {
  const r = await fetch(`${API_BASE}/api/discovery/subscriptions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feeds }) });
  if (!r.ok) throw new Error(readApiError(await r.text(), 'Could not share subscriptions.'));
  return r.json();
}
function readApiError(text: string, fallback: string) { try { return JSON.parse(text).error || fallback; } catch { return fallback; } }
