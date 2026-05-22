import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/workers',   label: 'Employés',        icon: '◈' },
  { to: '/contracts', label: 'Contrats',         icon: '◎' },
  { to: '/payslips',  label: 'Fiches de paie',   icon: '◉' },
  { to: '/period',    label: 'Période salariale', icon: '◫' },
]

export default function Layout() {
  const { doLogout } = useAuth()
  const navigate     = useNavigate()

  function handleLogout() {
    doLogout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0', position: 'fixed',
        top: 0, bottom: 0, left: 0, zIndex: 10
      }}>
        {/* Brand */}
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 2s infinite' }} />
            <span className="syne" style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)' }}>SalaryManager</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {nav.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '6px',
              color: isActive ? '#0f0f0f' : 'var(--muted)',
              background: isActive ? 'var(--accent)' : 'transparent',
              textDecoration: 'none', fontWeight: isActive ? 500 : 400,
              transition: 'all 0.15s', fontSize: '13px'
            })}>
              <span style={{ fontSize: '16px' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px 12px',
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--muted)', cursor: 'pointer',
            fontFamily: 'DM Mono, monospace', fontSize: '12px',
            letterSpacing: '0.05em', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            ⎋ Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '220px', flex: 1, padding: '32px', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}