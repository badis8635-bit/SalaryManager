import { useEffect, useState } from 'react'
import { getWorkers } from '../api/workers'
import { generatePayslip, getWorkerPayslips, markAsPaid, cancelPayslip } from '../api/payslips'
import { generatePayslipPDF } from '../utils/generatePayslipPDF'

const statusStyle = (s) => {
  const st = s.toUpperCase()
  return {
    display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px',
    ...(st === 'PAID'      ? { background: 'rgba(71,255,156,0.12)', color: 'var(--success)', border: '1px solid rgba(71,255,156,0.3)' } :
        st === 'PENDING'   ? { background: 'rgba(232,255,71,0.10)', color: 'var(--accent)',  border: '1px solid rgba(232,255,71,0.3)' } :
                             { background: 'rgba(255,71,71,0.10)',  color: 'var(--danger)',  border: '1px solid rgba(255,71,71,0.3)' })
  }
}

const btnSmall = (color = 'var(--muted)', borderColor = 'var(--border)') => ({
  padding: '5px 12px',
  background: 'transparent',
  border: `1px solid ${borderColor}`,
  borderRadius: '4px',
  color,
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: 'DM Mono, monospace',
})

export default function Payslips() {
  const [workers, setWorkers]       = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [payslips, setPayslips]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [msg, setMsg]               = useState('')
  const [form, setForm]             = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), bonus: '0' })
  const [showGen, setShowGen]       = useState(false)

  useEffect(() => { getWorkers().then(r => setWorkers(r.data)) }, [])

  async function loadPayslips(wid) {
    setLoading(true)
    try {
      const res = await getWorkerPayslips(wid)
      setPayslips(res.data)
    } catch { setPayslips([]) }
    finally { setLoading(false) }
  }

  function handleSelect(e) {
    const id = e.target.value
    setSelectedId(id)
    const w = workers.find(w => String(w.id) === id)
    setSelectedWorker(w || null)
    if (id) loadPayslips(id)
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError('')
    try {
      await generatePayslip({ worker_id: parseInt(selectedId), month: parseInt(form.month), year: parseInt(form.year), bonus: parseFloat(form.bonus) })
      setMsg('Fiche générée ✓'); setShowGen(false); loadPayslips(selectedId)
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handlePay(id) {
    setError('')
    try { await markAsPaid(id); setMsg('Marqué payé ✓'); loadPayslips(selectedId) }
    catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleCancel(id) {
    if (!confirm('Annuler cette fiche ?')) return
    setError('')
    try { await cancelPayslip(id); setMsg('Fiche annulée'); loadPayslips(selectedId) }
    catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  function handleExportPDF(p) {
    if (!selectedWorker) return
    generatePayslipPDF(p, selectedWorker)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '6px', color: 'var(--text)',
    fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none'
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="syne" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Fiches de paie</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Génération, validation, historique</p>
        </div>
        {selectedId && (
          <button onClick={() => setShowGen(!showGen)} style={{ padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {showGen ? '✕ Annuler' : '+ Générer'}
          </button>
        )}
      </div>

      {msg   && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(71,255,156,0.08)', border: '1px solid rgba(71,255,156,0.2)', borderRadius: '6px', color: 'var(--success)', fontSize: '13px' }}>{msg}</div>}
      {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,71,71,0.1)', border: '1px solid rgba(255,71,71,0.3)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

      {/* Worker selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Employé</label>
        <select value={selectedId} onChange={handleSelect} style={{ ...inputStyle, maxWidth: '360px', cursor: 'pointer' }}>
          <option value="">-- Choisir --</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.first_name} {w.last_name}</option>)}
        </select>
      </div>

      {/* Generate form */}
      {showGen && (
        <form onSubmit={handleGenerate} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', marginBottom: '6px' }}>Mois</label>
            <input style={inputStyle} type="number" min="1" max="12" value={form.month} onChange={e => setForm({...form, month: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', marginBottom: '6px' }}>Année</label>
            <input style={inputStyle} type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', marginBottom: '6px' }}>Prime (€)</label>
            <input style={inputStyle} type="number" step="0.01" value={form.bonus} onChange={e => setForm({...form, bonus: e.target.value})} />
          </div>
          <button type="submit" style={{ gridColumn: '1 / -1', padding: '11px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            Générer la fiche
          </button>
        </form>
      )}

      {/* Payslips list */}
      {loading ? <p style={{ color: 'var(--muted)' }}>Chargement...</p> : payslips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payslips
            .sort((a, b) => b.period_year - a.period_year || b.period_month - a.period_month)
            .map(p => (
              <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'center', minWidth: '48px' }}>
                    <div className="syne" style={{ fontWeight: 800, fontSize: '18px', lineHeight: 1 }}>{String(p.period_month).padStart(2, '0')}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '11px' }}>{p.period_year}</div>
                  </div>
                  <div style={{ width: '1px', height: '36px', background: 'var(--border)' }} />
                  <div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                      <span>Brut <strong>{p.gross_salary} €</strong></span>
                      <span style={{ color: 'var(--muted)' }}>ONSS <strong style={{ color: 'var(--text)' }}>{p.onss_employee} €</strong></span>
                      <span style={{ color: 'var(--muted)' }}>Précompte <strong style={{ color: 'var(--text)' }}>{p.precompte} €</strong></span>
                      {parseFloat(p.bonus) > 0 && <span style={{ color: 'var(--accent2)' }}>Prime +{p.bonus} €</span>}
                    </div>
                    <div style={{ marginTop: '4px', color: 'var(--accent)', fontSize: '15px', fontWeight: 600 }}>
                      Net : {p.net_salary} €
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={statusStyle(p.status)}>{p.status.toLowerCase()}</span>
                  {p.status.toUpperCase() === 'PENDING' && (
                    <>
                      <button onClick={() => handlePay(p.id)} style={btnSmall('var(--success)', 'rgba(71,255,156,0.3)')}>Payer</button>
                      <button onClick={() => handleCancel(p.id)} style={btnSmall('var(--danger)', 'rgba(255,71,71,0.3)')}>Annuler</button>
                    </>
                  )}
                  <button onClick={() => handleExportPDF(p)} style={btnSmall('var(--accent2)', 'rgba(71,200,255,0.3)')}>
                    ↓ PDF
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}