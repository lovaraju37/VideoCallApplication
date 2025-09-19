import './App.css'
import { useEffect, useState } from 'react'
import VideoCall from './components/VideoCall'
import AuthPanel from './components/AuthPanel'
import ProtectedRoute from './components/ProtectedRoute'
import { loadAuth } from './services/auth'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'

function App() {
  const [auth, setAuth] = useState(null)
  useEffect(() => { setAuth(loadAuth()) }, [])

  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthPage onAuthed={(a)=>{ setAuth(a); }} />} />
        <Route element={<ProtectedRoute />}> 
          <Route path="/call" element={<VideoCall initialName={auth?.displayName || auth?.username} />} />
        </Route>
      </Routes>
    </div>
  )
}

function Dashboard() {
  const nav = useNavigate()
  const auth = loadAuth()

  // If user is already logged in, show different options
  if (auth?.token) {
    return (
      <div>
        <div className="app-header">
          <div className="brand">LiveCall</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="meta">Welcome, {auth.displayName || auth.username}!</span>
            <button className="danger" onClick={() => {
              localStorage.removeItem('auth');
              window.location.reload();
            }}>Logout</button>
          </div>
        </div>
        <div className="panel" style={{padding:16}}>
          <h2>Ready to start a call?</h2>
          <p className="meta">You're logged in and ready to join or create video calls.</p>
          <div style={{display:'flex', gap:8}}>
            <button className="primary btn-gradient" onClick={()=>nav('/call')}>Start Video Call</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="app-header"><div className="brand">LiveCall</div></div>
      <div className="panel" style={{padding:16}}>
        <h2>Welcome to LiveCall</h2>
        <p className="meta">A lightweight, real‑time video call portal built with React, Vite and Spring Boot (WebRTC + WebSocket signaling).</p>
        <ul style={{textAlign:'left', lineHeight:1.8}}>
          <li>Join secure rooms and start calls instantly</li>
          <li>Screen sharing, mute/unmute, camera on/off</li>
          <li>Low-latency P2P powered by WebRTC</li>
        </ul>
        <div style={{display:'flex', gap:8}}>
          <Link className="primary btn-gradient" to="/auth">Get Started</Link>
          <button className="primary" onClick={()=>nav('/auth')}>Register / Login</button>
        </div>
      </div>
    </div>
  )
}

function AuthPage({ onAuthed }) {
  const nav = useNavigate()
  return (
    <div>
      <div className="app-header"><div className="brand">LiveCall</div></div>
      <AuthPanel onAuthed={(a)=>{ onAuthed?.(a); nav('/call'); }} />
      <div className="panel" style={{padding:12}}>
        <div className="meta">Only authenticated users can access calls. After login or registration, you'll be redirected to the call page.</div>
        <div style={{paddingTop:8}}>
          <Link to="/">Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}

export default App
