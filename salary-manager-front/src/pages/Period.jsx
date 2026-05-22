import { useState } from 'react'
import { generatePeriod, getPeriodSummary, getPendingPayslips } from '../api/payslips'

const Stat = ({ label, value, accent, sub }) => (
  <div style={{ background: 'var(--surface)', border: `1px solid ${accent ? 'rgba(232,255,71,0.25)' : 'var(--border)'}`, borderRadius: '8px', padding: '16px 20px' }}>
    <div style={{ color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
    <div className="syne" style={{ fontSize: '24px', fontWeight: 800, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</div>
    {sub && <div style={{ color: 'var(--muted)', fontSize: '12px', marginTop: '4px' }}>{sub}</div>}
  </div>
)

export default function Period() {
  const [month, setMonth]     = useState(new Date().getMonth() + 1)
  const [year, setYear]       = useState(new Date().getFullYear())
  const [summary, setSummary] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError]     = useState('')
  const [msg, setMsg]         = useState('')

  async function loadSummary() {
    setLoading(true); setError(''); setSummary(null)
    try {
      const [s, p] = await Promise.all([getPeriodSummary(year, month), getPendingPayslips()])
      setSummary(s.data)
      setPending(p.data)
    } catch { setError('Aucune donnée pour cette période') }
    finally { setLoading(false) }
  }

  async function handleGenerate() {
    if (!confirm(`Générer les fiches pour ${month}/${year} pour tous les employés actifs ?`)) return
    setGenLoading(true); setError('')
    try {
      const res = await generatePeriod(parseInt(month), parseInt(year))
      setMsg(`${res.data.length} fiche(s) générée(s) ✓`)
      loadSummary()
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
    finally { setGenLoading(false) }
  }

  const inputStyle = { padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none' }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 className="syne" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Période salariale</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Génération de masse et résumé financier</p>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Mois</label>
          <select value={month} onChange={e=>setMonth(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>Année</label>
          <input style={inputStyle} type="number" value={year} onChange={e=>setYear(e.target.value)} />
        </div>
        <button onClick={loadSummary} style={{ padding: '9px 20px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
          Voir le résumé
        </button>
        <button onClick={handleGenerate} disabled={genLoading} style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          {genLoading ? 'Génération...' : '⚡ Générer pour tous'}
        </button>
      </div>

      {msg   && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(71,255,156,0.08)', border: '1px solid rgba(71,255,156,0.2)', borderRadius: '6px', color: 'var(--success)', fontSize: '13px' }}>{msg}</div>}
      {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,71,71,0.1)', border: '1px solid rgba(255,71,71,0.3)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

      {loading && <p style={{ color: 'var(--muted)' }}>Chargement...</p>}

      {summary && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '32px' }}>
            <Stat label="Période"         value={summary.period} />
            <Stat label="Employés"        value={summary.total_workers} />
            <Stat label="Masse salariale" value={`${summary.total_gross} €`} accent />
            <Stat label="Net total"       value={`${summary.total_net} €`} />
            <Stat label="Coût employeur"  value={`${summary.total_cost} €`} sub="brut + ONSS employeur" />
            <Stat label="Primes"          value={`${summary.total_bonus} €`} />
            <Stat label="Payées"          value={summary.paid_count}    sub={`/ ${summary.total_workers}`} />
            <Stat label="En attente"      value={summary.pending_count} />
          </div>

          {/* Pending list */}
          {pending.length > 0 && (
            <div>
              <h3 className="syne" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '16px' }}>
                Fiches en attente <span style={{ color: 'var(--accent)', fontSize: '14px' }}>({pending.length})</span>
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      {['ID', 'Worker', 'Période', 'Net', 'Statut'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < pending.length-1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--muted)' }}>#{p.id}</td>
                        <td style={{ padding: '12px 16px' }}>Worker #{p.worker_id}</td>
                        <td style={{ padding: '12px 16px' }}>{String(p.period_month).padStart(2,'0')}/{p.period_year}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 600 }}>{p.net_salary} €</td>
                        <td style={{ padding: '12px 16px' }}><span style={{ color: 'var(--accent)', fontSize: '12px' }}>pending</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}