import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/dashboard', label: 'Tableau de bord',   icon: '▪' },
  { to: '/workers',   label: 'Employés',           icon: '▫' },
  { to: '/contracts', label: 'Contrats',            icon: '▫' },
  { to: '/payslips',  label: 'Fiches de paie',      icon: '▫' },
  { to: '/period',    label: 'Période salariale',   icon: '▫' },
]

export default function Layout() {
  const { doLogout } = useAuth()
  const navigate     = useNavigate()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: '232px', flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 10,
      }}>
        {/* Brand */}
        <div style={{ padding: '28px 24px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="serif" style={{ fontSize: '20px', color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Salary<br /><em>Manager</em>
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Administration RH
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {nav.map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '6px',
              color: isActive ? 'var(--accent)' : 'var(--text2)',
              background: isActive ? 'var(--accent-l)' : 'transparent',
              textDecoration: 'none',
              fontSize: '13.5px',
              fontWeight: isActive ? 500 : 400,
              transition: 'all 0.12s',
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
            })}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={() => { doLogout(); navigate('/login') }}
            style={{
              width: '100%', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: '8px',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '6px', color: 'var(--muted)', cursor: 'pointer',
              fontSize: '12.5px', fontFamily: 'Geist, sans-serif',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-l)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)';  e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
          >
            ↪ Déconnexion
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: '232px', flex: 1, padding: '40px 48px', minWidth: 0, maxWidth: '1200px' }}>
        <Outlet />
      </main>
    </div>
  )
}