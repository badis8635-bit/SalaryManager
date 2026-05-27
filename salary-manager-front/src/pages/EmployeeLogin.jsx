import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function EmployeeLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/workers/login', { email, password })
      localStorage.setItem('employee_token',      res.data.access_token)
      localStorage.setItem('employee_worker_id',  res.data.worker_id)
      localStorage.setItem('employee_first_name', res.data.first_name)
      localStorage.setItem('employee_last_name',  res.data.last_name)
      navigate('/employee/portal')
    } catch(err) {
      setError(err.response?.data?.detail || 'Identifiants incorrects')
    } finally { setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '6px', color: 'var(--text)',
    fontFamily: 'Geist, sans-serif', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'stretch' }}>
      {/* Left panel */}
      <div style={{ width: '40%', background: '#1a1916', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px' }}>
        <div className="serif" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em' }}>
          Salary Manager
        </div>
        <div>
          <div className="serif" style={{ fontSize: '38px', color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            Espace<br /><em style={{ color: 'rgba(255,255,255,0.45)' }}>Employé</em>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', lineHeight: 1.7, maxWidth: '260px' }}>
            Consultez vos fiches de paie et exportez-les en PDF.
          </p>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em', marginBottom: '8px' }}>
            ACCÈS ADMIN
          </div>
          <a href="/login" style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1px' }}>
            Connexion administrateur →
          </a>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: '360px' }}>
          <h1 className="serif" style={{ fontSize: '28px', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Connexion
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '32px' }}>
            Accès à votre espace personnel
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text2)', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text2)', marginBottom: '6px' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--danger-l)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: '4px', padding: '12px',
              background: loading ? 'var(--surface2)' : 'var(--text)',
              border: 'none', borderRadius: '6px',
              color: loading ? 'var(--muted)' : 'white',
              fontFamily: 'Geist, sans-serif', fontWeight: 500, fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
            }}>
              {loading ? 'Connexion...' : 'Accéder à mes fiches'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}