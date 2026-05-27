import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { generatePayslipPDF } from '../utils/generatePayslipPDF'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const statusCfg = (s) => {
  const st = s.toUpperCase()
  if (st === 'PAID')      return { bg: 'var(--paid-l)',   color: 'var(--paid)',   border: 'rgba(26,77,53,0.2)',   label: 'Payé' }
  if (st === 'CANCELLED') return { bg: 'var(--danger-l)', color: 'var(--danger)', border: 'rgba(192,57,43,0.2)', label: 'Annulé' }
  return                         { bg: 'var(--warn-l)',   color: 'var(--warn)',   border: 'rgba(138,108,26,0.2)', label: 'En attente' }
}

export default function EmployeePortal() {
  const [payslips, setPayslips] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const navigate                = useNavigate()

  const workerId   = localStorage.getItem('employee_worker_id')
  const firstName  = localStorage.getItem('employee_first_name')
  const lastName   = localStorage.getItem('employee_last_name')
  const token      = localStorage.getItem('employee_token')

  const worker = { id: parseInt(workerId), first_name: firstName, last_name: lastName, email: '', worker_type: '' }

  useEffect(() => {
    if (!token || !workerId) { navigate('/employee/login'); return }
    async function load() {
      try {
        const res = await axios.get(`http://localhost:8000/payslips/worker/${workerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPayslips(res.data)
      } catch(err) {
        if (err.response?.status === 401) { handleLogout(); return }
        setError('Erreur de chargement')
      } finally { setLoading(false) }
    }
    load()
  }, [])

  function handleLogout() {
    localStorage.removeItem('employee_token')
    localStorage.removeItem('employee_worker_id')
    localStorage.removeItem('employee_first_name')
    localStorage.removeItem('employee_last_name')
    navigate('/employee/login')
  }

  // Calculs résumé
  const paidPayslips = payslips.filter(p => p.status.toUpperCase() === 'PAID')
  const totalNet     = paidPayslips.reduce((s, p) => s + Number(p.net_salary), 0)
  const totalPrimes  = payslips.reduce((s, p) => s + Number(p.bonus || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 40px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="serif" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>Salary<em>Manager</em></span>
            <span style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>Espace employé</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text2)' }}>{firstName} {lastName}</span>
            <button onClick={handleLogout} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Geist, sans-serif', transition: 'all 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px' }}>
        <div className="fade-up">

          {/* Title */}
          <div style={{ marginBottom: '32px' }}>
            <h1 className="serif" style={{ fontSize: '30px', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Bonjour, {firstName}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Voici vos fiches de paie</p>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'Fiches disponibles', value: payslips.length },
              { label: 'Net total perçu',    value: `${totalNet.toFixed(2)} €`, highlight: true },
              { label: 'Primes reçues',      value: `${totalPrimes.toFixed(2)} €` },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ background: 'var(--surface)', border: `1px solid ${highlight ? 'rgba(42,92,69,0.25)' : 'var(--border)'}`, borderRadius: '8px', padding: '16px 18px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{label}</div>
                <div className="serif" style={{ fontSize: '24px', color: highlight ? 'var(--accent)' : 'var(--text)', letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'var(--danger-l)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

          {/* Payslips */}
          {loading ? (
            <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement...</p>
          ) : payslips.length === 0 ? (
            <div style={{ padding: '48px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px' }}>Aucune fiche de paie disponible.</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                Historique — {payslips.length} fiche(s)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                {payslips
                  .sort((a, b) => b.period_year - a.period_year || b.period_month - a.period_month)
                  .map(p => {
                    const sc = statusCfg(p.status)
                    return (
                      <div key={p.id} style={{ background: 'var(--surface)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}>

                        {/* Période */}
                        <div style={{ minWidth: '52px', textAlign: 'center' }}>
                          <div className="serif" style={{ fontSize: '20px', lineHeight: 1 }}>{String(p.period_month).padStart(2,'0')}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.period_year}</div>
                        </div>
                        <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />

                        {/* Montants */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                            {MONTHS[p.period_month - 1]} {p.period_year}
                          </div>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', marginTop: '3px', flexWrap: 'wrap' }}>
                            <span style={{ color: 'var(--text2)' }}>Brut <strong style={{ color: 'var(--text)' }}>{p.gross_salary} €</strong></span>
                            <span style={{ color: 'var(--text2)' }}>ONSS <strong style={{ color: 'var(--text)' }}>{p.onss_employee} €</strong></span>
                            <span style={{ color: 'var(--text2)' }}>Précompte <strong style={{ color: 'var(--text)' }}>{p.precompte} €</strong></span>
                            {parseFloat(p.bonus) > 0 && <span style={{ color: 'var(--accent)' }}>Prime +{p.bonus} €</span>}
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent)', marginTop: '4px' }}>
                            Net : {p.net_salary} €
                          </div>
                        </div>

                        {/* Statut + PDF */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 500, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                            {sc.label}
                          </span>
                          <button
                            onClick={() => generatePayslipPDF(p, worker)}
                            style={{ padding: '5px 12px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: '12px', fontFamily: 'Geist, sans-serif', transition: 'all 0.12s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text2)' }}
                          >
                            ↓ PDF
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}