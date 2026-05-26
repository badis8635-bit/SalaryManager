import { useState } from 'react'
import { generatePeriod, getPeriodSummary, getPendingPayslips } from '../api/payslips'

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']

const Stat = ({ label, value, sub, highlight }) => (
  <div style={{ background:'var(--surface)', border:`1px solid ${highlight ? 'rgba(42,92,69,0.25)' : 'var(--border)'}`, borderRadius:'8px', padding:'16px 18px' }}>
    <div style={{ fontSize:'11.5px', color:'var(--muted)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:'8px' }}>{label}</div>
    <div className="serif" style={{ fontSize:'26px', color: highlight ? 'var(--accent)' : 'var(--text)', letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:'11.5px', color:'var(--muted)', marginTop:'5px' }}>{sub}</div>}
  </div>
)

const inputStyle = {
  padding:'9px 12px', background:'var(--surface)', border:'1px solid var(--border)',
  borderRadius:'6px', color:'var(--text)', fontFamily:'Geist, sans-serif', fontSize:'13.5px', outline:'none',
  transition:'border-color 0.15s',
}

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
      setSummary(s.data); setPending(p.data)
    } catch { setError('Aucune donnée pour cette période') }
    finally { setLoading(false) }
  }

  async function handleGenerate() {
    if (!confirm(`Générer les fiches de ${MONTHS[month-1]} ${year} pour tous les employés actifs ?`)) return
    setGenLoading(true); setError('')
    try {
      const res = await generatePeriod(parseInt(month), parseInt(year))
      setMsg(`${res.data.length} fiche(s) générée(s)`)
      loadSummary()
    } catch(err) { setError(err.response?.data?.detail || 'Erreur') }
    finally { setGenLoading(false) }
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom:'32px' }}>
        <h1 className="serif" style={{ fontSize:'32px', letterSpacing:'-0.02em', marginBottom:'2px' }}>Période salariale</h1>
        <p style={{ color:'var(--muted)', fontSize:'13px' }}>Génération de masse et résumé financier</p>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', gap:'10px', alignItems:'flex-end', marginBottom:'24px', flexWrap:'wrap' }}>
        <div>
          <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--text2)', marginBottom:'5px' }}>Mois</label>
          <select value={month} onChange={e=>setMonth(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
            {MONTHS.map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--text2)', marginBottom:'5px' }}>Année</label>
          <input style={inputStyle} type="number" value={year} onChange={e=>setYear(e.target.value)}
            onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
        </div>
        <button onClick={loadSummary} style={{ padding:'9px 18px', background:'var(--surface)', border:'1px solid var(--border2)', borderRadius:'6px', color:'var(--text)', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor:'pointer' }}>
          Voir le résumé
        </button>
        <button onClick={handleGenerate} disabled={genLoading} style={{ padding:'9px 18px', background:'var(--text)', border:'none', borderRadius:'6px', color:'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor: genLoading ? 'wait' : 'pointer', opacity: genLoading ? 0.6 : 1 }}>
          {genLoading ? 'Génération...' : 'Générer pour tous'}
        </button>
      </div>

      {msg   && <div style={{ marginBottom:'20px', padding:'10px 14px', background:'var(--paid-l)', border:'1px solid rgba(26,77,53,0.2)', borderRadius:'6px', color:'var(--paid)', fontSize:'13px' }}>{msg}</div>}
      {error && <div style={{ marginBottom:'20px', padding:'10px 14px', background:'var(--danger-l)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:'6px', color:'var(--danger)', fontSize:'13px' }}>{error}</div>}
      {loading && <p style={{ color:'var(--muted)' }}>Chargement...</p>}

      {summary && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px, 1fr))', gap:'12px', marginBottom:'32px' }}>
            <Stat label="Période"          value={`${MONTHS[summary.period.split('/')[0]-1]} ${summary.period.split('/')[1]}`} />
            <Stat label="Employés"         value={summary.total_workers} />
            <Stat label="Masse salariale"  value={`${Number(summary.total_gross).toFixed(2)} €`} highlight />
            <Stat label="Net total"        value={`${Number(summary.total_net).toFixed(2)} €`} />
            <Stat label="Coût employeur"   value={`${Number(summary.total_cost).toFixed(2)} €`} sub="brut + ONSS employeur" />
            <Stat label="Primes versées"   value={`${Number(summary.total_bonus).toFixed(2)} €`} />
            <Stat label="Fiches payées"    value={`${summary.paid_count} / ${summary.total_workers}`} />
            <Stat label="En attente"       value={summary.pending_count} />
          </div>

          {/* Pending table */}
          {pending.length > 0 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
                <h2 className="serif" style={{ fontSize:'20px', letterSpacing:'-0.02em' }}>Fiches en attente</h2>
                <span style={{ padding:'2px 9px', background:'var(--warn-l)', color:'var(--warn)', border:'1px solid rgba(138,108,26,0.2)', borderRadius:'4px', fontSize:'12px', fontWeight:500 }}>
                  {pending.length}
                </span>
              </div>
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'var(--bg)', borderBottom:'1px solid var(--border)' }}>
                      {['ID','Employé','Période','Net','Statut'].map(h => (
                        <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'var(--muted)', fontSize:'11.5px', letterSpacing:'0.04em', textTransform:'uppercase', fontWeight:500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i<pending.length-1 ? '1px solid var(--border)' : 'none', transition:'background 0.1s' }}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:'12.5px' }} className="mono">#{p.id}</td>
                        <td style={{ padding:'12px 16px', fontSize:'13.5px' }}>Employé #{p.worker_id}</td>
                        <td style={{ padding:'12px 16px', color:'var(--text2)', fontSize:'13px' }}>{MONTHS[p.period_month-1]} {p.period_year}</td>
                        <td style={{ padding:'12px 16px', fontWeight:600, color:'var(--accent)' }}>{p.net_salary} €</td>
                        <td style={{ padding:'12px 16px' }}>
                          <span style={{ padding:'2px 9px', background:'var(--warn-l)', color:'var(--warn)', border:'1px solid rgba(138,108,26,0.2)', borderRadius:'4px', fontSize:'11.5px', fontWeight:500 }}>
                            En attente
                          </span>
                        </td>
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