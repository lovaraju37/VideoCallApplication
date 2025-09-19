const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export async function register({ username, password, displayName }) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, displayName })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Register failed');
  return res.json(); // { token, username, displayName }
}

export async function login({ username, password }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json(); // { token, username, displayName }
}

export function saveAuth(auth) {
  localStorage.setItem('auth', JSON.stringify(auth));
}

export function loadAuth() {
  const raw = localStorage.getItem('auth');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem('auth');
}
