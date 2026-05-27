import { useState } from 'react'
import axios from 'axios'

export default function SetPasswordModal({ worker, onClose }) {
  const [password, setPassword] = useState('')
  const [msg, setMsg]           = useState('')
  const [error, setError]       = useState('')

  const token = localStorage.getItem('access_token')

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setMsg('')
    try {
      await axios.patch(
        `http://localhost:8000/workers/${worker.id}/set-password`,
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsg('Mot de passe défini ✓')
      setPassword('')
    } catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="fade-up" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '28px', width: '380px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 className="serif" style={{ fontSize: '20px', letterSpacing: '-0.02em', marginBottom: '4px' }}>Accès employé</h3>
          <p style={{ color: 'var(--muted)', fontSize: '12.5px' }}>Définir le mot de passe de <strong>{worker.first_name} {worker.last_name}</strong></p>
        </div>

        {msg   && <div style={{ marginBottom: '12px', padding: '9px 12px', background: 'var(--paid-l)', border: '1px solid rgba(26,77,53,0.2)', borderRadius: '6px', color: 'var(--paid)', fontSize: '13px' }}>{msg}</div>}
        {error && <div style={{ marginBottom: '12px', padding: '9px 12px', background: 'var(--danger-l)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text2)', marginBottom: '5px' }}>
              Nouveau mot de passe
            </label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 caractères" required
              style={{ width: '100%', padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'Geist, sans-serif', fontSize: '13.5px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" style={{ flex: 1, padding: '9px', background: 'var(--text)', border: 'none', borderRadius: '6px', color: 'white', fontFamily: 'Geist, sans-serif', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer' }}>
              Définir
            </button>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', fontFamily: 'Geist, sans-serif', fontSize: '13.5px', cursor: 'pointer' }}>
              Fermer
            </button>
          </div>
        </form>

        <div style={{ marginTop: '16px', padding: '10px 12px', background: 'var(--bg)', borderRadius: '6px', fontSize: '12px', color: 'var(--muted)' }}>
          L'employé pourra se connecter sur{' '}
          <a href="/employee/login" target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            /employee/login
          </a>
        </div>
      </div>
    </div>
  )
}