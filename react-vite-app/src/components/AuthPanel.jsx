import { useState } from 'react';
import { login, register, saveAuth, loadAuth, clearAuth } from '../services/auth';

export default function AuthPanel({ onAuthed }) {
  const existing = loadAuth();
  const [mode, setMode] = useState(existing ? 'account' : 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true); setError('');
      const res = await login({ username, password });
      saveAuth(res);
      onAuthed(res);
      setMode('account');
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    try {
      setLoading(true); setError('');
      const res = await register({ username, password, displayName });
      saveAuth(res);
      onAuthed(res);
      setMode('account');
    } catch (e) {
      setError(e.message || 'Register failed');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { clearAuth(); onAuthed(null); setMode('login'); };

  if (mode === 'account' && existing) {
    return (
      <div className="panel" style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 14 }}>Signed in as <b>{existing.displayName || existing.username}</b></div>
          <div className="meta">You can now join or create a room.</div>
        </div>
        <button className="danger" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="panel" style={{ padding: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button className={`primary ${mode==='login' ? 'btn-gradient' : ''}`} onClick={() => setMode('login')}>Login</button>
        <button className={`primary ${mode==='register' ? 'btn-gradient' : ''}`} onClick={() => setMode('register')}>Register</button>
      </div>

      {mode === 'login' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="room-input" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="room-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div style={{ color:'#ff6b6b' }}>{error}</div>}
          <div>
            <button className="primary btn-gradient" disabled={loading || !username || !password} onClick={handleLogin}>{loading? '...' : 'Login'}</button>
          </div>
        </div>
      )}

      {mode === 'register' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <input className="room-input" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
          <input className="room-input" placeholder="Display name (optional)" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
          <input className="room-input" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div style={{ color:'#ff6b6b' }}>{error}</div>}
          <div>
            <button className="primary btn-gradient" disabled={loading || !username || !password} onClick={handleRegister}>{loading? '...' : 'Create account'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
