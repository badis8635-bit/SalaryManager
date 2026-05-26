import { useEffect, useState } from 'react'
import { getWorkers } from '../api/workers'
import { generatePayslip, getWorkerPayslips, markAsPaid, cancelPayslip } from '../api/payslips'
import { generatePayslipPDF } from '../utils/generatePayslipPDF'

const statusCfg = (s) => {
  const st = s.toUpperCase()
  if (st === 'PAID')      return { bg:'var(--paid-l)',    color:'var(--paid)',    border:'rgba(26,77,53,0.2)',      label:'Payé' }
  if (st === 'CANCELLED') return { bg:'var(--danger-l)',  color:'var(--danger)',  border:'rgba(192,57,43,0.2)',     label:'Annulé' }
  return                         { bg:'var(--warn-l)',    color:'var(--warn)',    border:'rgba(138,108,26,0.2)',    label:'En attente' }
}

const inputStyle = {
  width:'100%', padding:'9px 12px',
  background:'var(--surface)', border:'1px solid var(--border)',
  borderRadius:'6px', color:'var(--text)',
  fontFamily:'Geist, sans-serif', fontSize:'13.5px', outline:'none',
  transition:'border-color 0.15s',
}

export default function Payslips() {
  const [workers, setWorkers]             = useState([])
  const [selectedId, setSelectedId]       = useState('')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [payslips, setPayslips]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [msg, setMsg]                     = useState('')
  const [form, setForm]                   = useState({ month: new Date().getMonth()+1, year: new Date().getFullYear(), bonus:'0' })
  const [showGen, setShowGen]             = useState(false)

  useEffect(() => { getWorkers().then(r => setWorkers(r.data)) }, [])

  async function loadPayslips(wid) {
    setLoading(true)
    try { const res = await getWorkerPayslips(wid); setPayslips(res.data) }
    catch { setPayslips([]) }
    finally { setLoading(false) }
  }

  function handleSelect(e) {
    const id = e.target.value
    setSelectedId(id)
    setSelectedWorker(workers.find(w => String(w.id) === id) || null)
    if (id) loadPayslips(id)
  }

  async function handleGenerate(e) {
    e.preventDefault(); setError('')
    try {
      await generatePayslip({ worker_id:parseInt(selectedId), month:parseInt(form.month), year:parseInt(form.year), bonus:parseFloat(form.bonus) })
      setMsg('Fiche générée'); setShowGen(false); loadPayslips(selectedId)
    } catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handlePay(id) {
    setError('')
    try { await markAsPaid(id); setMsg('Fiche marquée payée'); loadPayslips(selectedId) }
    catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleCancel(id) {
    if (!confirm('Annuler cette fiche ?')) return; setError('')
    try { await cancelPayslip(id); setMsg('Fiche annulée'); loadPayslips(selectedId) }
    catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  return (
    <div className="fade-up">
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'32px' }}>
        <div>
          <h1 className="serif" style={{ fontSize:'32px', letterSpacing:'-0.02em', marginBottom:'2px' }}>Fiches de paie</h1>
          <p style={{ color:'var(--muted)', fontSize:'13px' }}>Génération, validation, historique</p>
        </div>
        {selectedId && (
          <button onClick={() => setShowGen(!showGen)} style={{ padding:'9px 18px', background: showGen ? 'var(--surface2)' : 'var(--text)', border:'1px solid', borderColor: showGen ? 'var(--border)' : 'var(--text)', borderRadius:'6px', color: showGen ? 'var(--text2)' : 'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor:'pointer' }}>
            {showGen ? 'Annuler' : '+ Générer une fiche'}
          </button>
        )}
      </div>

      {msg   && <div style={{ marginBottom:'16px', padding:'10px 14px', background:'var(--paid-l)', border:'1px solid rgba(26,77,53,0.2)', borderRadius:'6px', color:'var(--paid)', fontSize:'13px' }}>{msg}</div>}
      {error && <div style={{ marginBottom:'16px', padding:'10px 14px', background:'var(--danger-l)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:'6px', color:'var(--danger)', fontSize:'13px' }}>{error}</div>}

      {/* Selector */}
      <div style={{ marginBottom:'24px' }}>
        <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--text2)', marginBottom:'6px' }}>Employé</label>
        <select value={selectedId} onChange={handleSelect} style={{ ...inputStyle, maxWidth:'360px', cursor:'pointer' }}>
          <option value="">— Choisir —</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.first_name} {w.last_name}</option>)}
        </select>
      </div>

      {/* Generate form */}
      {showGen && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', marginBottom:'24px' }}>
          <p style={{ fontSize:'12px', fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>Nouvelle fiche</p>
          <form onSubmit={handleGenerate} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'10px', alignItems:'end' }}>
            <div>
              <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'5px' }}>Mois</label>
              <input style={inputStyle} type="number" min="1" max="12" value={form.month} onChange={e=>setForm({...form,month:e.target.value})}
                onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'5px' }}>Année</label>
              <input style={inputStyle} type="number" value={form.year} onChange={e=>setForm({...form,year:e.target.value})}
                onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'12px', color:'var(--muted)', marginBottom:'5px' }}>Prime (€)</label>
              <input style={inputStyle} type="number" step="0.01" value={form.bonus} onChange={e=>setForm({...form,bonus:e.target.value})}
                onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            </div>
            <button type="submit" style={{ padding:'9px 18px', background:'var(--text)', border:'none', borderRadius:'6px', color:'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor:'pointer', whiteSpace:'nowrap' }}>
              Générer
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? <p style={{ color:'var(--muted)' }}>Chargement...</p> : payslips.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1px', background:'var(--border)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
          {payslips.sort((a,b) => b.period_year-a.period_year || b.period_month-a.period_month).map(p => {
            const sc = statusCfg(p.status)
            return (
              <div key={p.id} style={{ background:'var(--surface)', padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', transition:'background 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--surface)'}>
                {/* Period */}
                <div style={{ minWidth:'52px', textAlign:'center' }}>
                  <div className="serif" style={{ fontSize:'22px', lineHeight:1, color:'var(--text)' }}>{String(p.period_month).padStart(2,'0')}</div>
                  <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'1px' }}>{p.period_year}</div>
                </div>
                <div style={{ width:'1px', height:'32px', background:'var(--border)' }} />
                {/* Amounts */}
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:'20px', fontSize:'13px', color:'var(--text2)', flexWrap:'wrap' }}>
                    <span>Brut <strong style={{ color:'var(--text)' }}>{p.gross_salary} €</strong></span>
                    <span>ONSS <strong style={{ color:'var(--text)' }}>{p.onss_employee} €</strong></span>
                    <span>Précompte <strong style={{ color:'var(--text)' }}>{p.precompte} €</strong></span>
                    {parseFloat(p.bonus) > 0 && <span style={{ color:'var(--accent)' }}>Prime +{p.bonus} €</span>}
                  </div>
                  <div style={{ marginTop:'5px', fontSize:'15px', fontWeight:600, color:'var(--accent)' }}>
                    Net : {p.net_salary} €
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                  <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:'4px', fontSize:'11.5px', fontWeight:500, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                    {sc.label}
                  </span>
                  {p.status.toUpperCase() === 'PENDING' && <>
                    <button onClick={() => handlePay(p.id)} style={{ padding:'5px 12px', border:'1px solid rgba(26,77,53,0.3)', borderRadius:'4px', background:'var(--paid-l)', color:'var(--paid)', cursor:'pointer', fontSize:'12px', fontFamily:'Geist,sans-serif', fontWeight:500 }}>Payer</button>
                    <button onClick={() => handleCancel(p.id)} style={{ padding:'5px 12px', border:'1px solid rgba(192,57,43,0.25)', borderRadius:'4px', background:'transparent', color:'var(--danger)', cursor:'pointer', fontSize:'12px', fontFamily:'Geist,sans-serif' }}>Annuler</button>
                  </>}
                  <button onClick={() => selectedWorker && generatePayslipPDF(p, selectedWorker)} style={{ padding:'5px 12px', border:'1px solid var(--border)', borderRadius:'4px', background:'transparent', color:'var(--text2)', cursor:'pointer', fontSize:'12px', fontFamily:'Geist,sans-serif' }}>
                    ↓ PDF
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!loading && selectedId && payslips.length === 0 && (
        <div style={{ padding:'40px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', textAlign:'center', color:'var(--muted)', fontSize:'13.5px' }}>
          Aucune fiche de paie pour cet employé.
        </div>
      )}
    </div>
  )
}