import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/auth'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { doLogin }             = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(email, password)
          console.log('res:', res)           // ← ajoute ça
          console.log('res.data:', res.data)
      doLogin(res.data.access_token, res.data.refresh_token)
      navigate('/workers')
    } catch (err) {
        console.log('err:', err)
      setError(err.response?.data?.detail || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Accent line top */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: 'var(--accent)' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>

        {/* Logo / title */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Salary Manager</span>
          </div>
          <h1 className="syne" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>
            Connexion<br />
            <span style={{ color: 'var(--accent)' }}>Admin</span>
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@exemple.com"
              required
              style={{
                width: '100%', padding: '12px 16px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%', padding: '12px 16px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
                fontSize: '14px', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(255,71,71,0.1)', border: '1px solid rgba(255,71,71,0.3)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px', padding: '14px',
              background: loading ? 'var(--surface2)' : 'var(--accent)',
              border: 'none', borderRadius: '6px',
              color: loading ? 'var(--muted)' : '#0f0f0f',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.02em'
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter →'}
          </button>
        </form>
      </div>
    </div>
  )
}