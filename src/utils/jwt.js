
// Token giả: base64(JSON.stringify({ userId, role, exp }))
export function createToken({ userId, role, ttlSec = 3600 }) {
  const payload = { userId, role, exp: Date.now() + ttlSec * 1000 };
  return btoa(JSON.stringify(payload));
}
export function decodeToken(token) {
  try { return JSON.parse(atob(token)); } catch { return null; }
}
export function isTokenValid(token) {
  const p = decodeToken(token);
  return !!p && p.exp > Date.now();
}
