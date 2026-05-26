import { useEffect, useState } from 'react'
import { getWorkers } from '../api/workers'
import { getContract, getContractCost, createContract, updateSalary, updateTaxRates, terminateContract } from '../api/contracts'

const CONTRACT_TYPES = ['employee', 'freelance', 'etudiant']

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)',
  fontFamily: 'Geist, sans-serif', fontSize: '13.5px', outline: 'none',
  transition: 'border-color 0.15s',
}

const Row = ({ label, value, highlight }) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
    <span style={{ color:'var(--muted)', fontSize:'12.5px' }}>{label}</span>
    <span style={{ fontWeight: highlight ? 600 : 400, color: highlight ? 'var(--accent)' : 'var(--text)', fontSize:'13.5px' }}>{value}</span>
  </div>
)

const Card = ({ children, title, danger }) => (
  <div style={{ background:'var(--surface)', border:`1px solid ${danger ? 'rgba(192,57,43,0.2)' : 'var(--border)'}`, borderRadius:'8px', padding:'20px' }}>
    {title && <p style={{ fontSize:'12px', fontWeight:600, color: danger ? 'var(--danger)' : 'var(--muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'14px' }}>{title}</p>}
    {children}
  </div>
)

export default function Contracts() {
  const [workers, setWorkers]       = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [contract, setContract]     = useState(null)
  const [cost, setCost]             = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError]           = useState('')
  const [msg, setMsg]               = useState('')
  const [form, setForm]             = useState({ contract_type:'employee', gross_salary:'', start_date:'', end_date:'', onss_employee_rate:'13.07', onss_employer_rate:'27.00', precompte_rate:'26.75' })
  const [newSalary, setNewSalary]   = useState('')
  const [endDate, setEndDate]       = useState('')

  useEffect(() => { getWorkers().then(r => setWorkers(r.data)) }, [])

  async function loadContract(wid) {
    setContract(null); setCost(null); setError('')
    try {
      const [c, co] = await Promise.all([getContract(wid), getContractCost(wid)])
      setContract(c.data); setCost(co.data)
    } catch { /* pas de contrat */ }
  }

  function handleSelect(e) { setSelectedId(e.target.value); if(e.target.value) loadContract(e.target.value) }

  async function handleCreate(e) {
    e.preventDefault(); setError('')
    try {
      await createContract({ ...form, worker_id:parseInt(selectedId), gross_salary:parseFloat(form.gross_salary), onss_employee_rate:parseFloat(form.onss_employee_rate), onss_employer_rate:parseFloat(form.onss_employer_rate), precompte_rate:parseFloat(form.precompte_rate) })
      setShowCreate(false); setMsg('Contrat créé'); loadContract(selectedId)
    } catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleUpdateSalary() {
    if (!newSalary) return
    try { await updateSalary(selectedId, parseFloat(newSalary)); setMsg('Salaire mis à jour'); setNewSalary(''); loadContract(selectedId) }
    catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleTerminate() {
    if (!endDate) return
    try { await terminateContract(selectedId, endDate); setMsg('Contrat résilié'); loadContract(selectedId) }
    catch(err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  return (
    <div className="fade-up">
      <div style={{ marginBottom:'32px' }}>
        <h1 className="serif" style={{ fontSize:'32px', letterSpacing:'-0.02em', marginBottom:'2px' }}>Contrats</h1>
        <p style={{ color:'var(--muted)', fontSize:'13px' }}>Salaire brut, taux ONSS, précompte professionnel</p>
      </div>

      <div style={{ marginBottom:'24px' }}>
        <label style={{ display:'block', fontSize:'12px', fontWeight:500, color:'var(--text2)', marginBottom:'6px' }}>Sélectionner un employé</label>
        <select value={selectedId} onChange={handleSelect} style={{ ...inputStyle, maxWidth:'360px', cursor:'pointer' }}>
          <option value="">— Choisir —</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.first_name} {w.last_name}</option>)}
        </select>
      </div>

      {msg   && <div style={{ marginBottom:'16px', padding:'10px 14px', background:'var(--paid-l)', border:'1px solid rgba(26,77,53,0.2)', borderRadius:'6px', color:'var(--paid)', fontSize:'13px' }}>{msg}</div>}
      {error && <div style={{ marginBottom:'16px', padding:'10px 14px', background:'var(--danger-l)', border:'1px solid rgba(192,57,43,0.2)', borderRadius:'6px', color:'var(--danger)', fontSize:'13px' }}>{error}</div>}

      {selectedId && !contract && !showCreate && (
        <div style={{ padding:'32px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', textAlign:'center' }}>
          <p style={{ color:'var(--muted)', marginBottom:'16px', fontSize:'13.5px' }}>Aucun contrat pour cet employé.</p>
          <button onClick={() => setShowCreate(true)} style={{ padding:'9px 18px', background:'var(--text)', border:'none', borderRadius:'6px', color:'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor:'pointer' }}>
            Créer un contrat
          </button>
        </div>
      )}

      {showCreate && (
        <Card title="Nouveau contrat">
          <form onSubmit={handleCreate} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <select style={{...inputStyle,cursor:'pointer'}} value={form.contract_type} onChange={e=>setForm({...form,contract_type:e.target.value})}>
              {CONTRACT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
            </select>
            <input style={inputStyle} type="number" placeholder="Salaire brut (€)" value={form.gross_salary} onChange={e=>setForm({...form,gross_salary:e.target.value})} required
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} required
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} type="date" placeholder="Date fin" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} type="number" step="0.01" placeholder="ONSS employé %" value={form.onss_employee_rate} onChange={e=>setForm({...form,onss_employee_rate:e.target.value})}
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} type="number" step="0.01" placeholder="ONSS employeur %" value={form.onss_employer_rate} onChange={e=>setForm({...form,onss_employer_rate:e.target.value})}
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} type="number" step="0.01" placeholder="Précompte %" value={form.precompte_rate} onChange={e=>setForm({...form,precompte_rate:e.target.value})}
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <div style={{ gridColumn:'1/-1', display:'flex', gap:'8px' }}>
              <button type="submit" style={{ flex:1, padding:'10px', background:'var(--text)', border:'none', borderRadius:'6px', color:'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor:'pointer' }}>Créer</button>
              <button type="button" onClick={()=>setShowCreate(false)} style={{ padding:'10px 16px', background:'transparent', border:'1px solid var(--border)', borderRadius:'6px', color:'var(--text2)', fontFamily:'Geist,sans-serif', fontSize:'13.5px', cursor:'pointer' }}>Annuler</button>
            </div>
          </form>
        </Card>
      )}

      {contract && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
          <Card title="Contrat actuel">
            <Row label="Type"           value={contract.contract_type} />
            <Row label="Salaire brut"   value={`${contract.gross_salary} €`} highlight />
            <Row label="Date de début"  value={contract.start_date} />
            <Row label="Date de fin"    value={contract.end_date || '—'} />
            <Row label="ONSS employé"   value={`${contract.onss_employee_rate} %`} />
            <Row label="ONSS employeur" value={`${contract.onss_employer_rate} %`} />
            <Row label="Précompte"      value={`${contract.precompte_rate} %`} />
          </Card>

          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {cost && (
              <Card title="Coût employeur">
                <Row label="Salaire brut"  value={`${cost.gross_salary} €`} />
                <Row label="ONSS employeur" value={`${cost.onss_employer} €`} />
                <Row label="Coût total"    value={`${cost.total_employer_cost} €`} highlight />
              </Card>
            )}

            <Card title="Modifier le salaire">
              <div style={{ display:'flex', gap:'8px' }}>
                <input style={{...inputStyle,flex:1}} type="number" placeholder="Nouveau brut (€)" value={newSalary} onChange={e=>setNewSalary(e.target.value)}
                  onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
                <button onClick={handleUpdateSalary} style={{ padding:'9px 16px', background:'var(--accent)', border:'none', borderRadius:'6px', color:'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap' }}>
                  Appliquer
                </button>
              </div>
            </Card>

            {contract.contract_type !== 'employee' && (
              <Card title="Résilier le contrat" danger>
                <div style={{ display:'flex', gap:'8px' }}>
                  <input style={{...inputStyle,flex:1}} type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                    onFocus={e=>e.target.style.borderColor='var(--danger)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
                  <button onClick={handleTerminate} style={{ padding:'9px 16px', background:'transparent', border:'1px solid rgba(192,57,43,0.4)', borderRadius:'6px', color:'var(--danger)', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13px', cursor:'pointer', whiteSpace:'nowrap' }}>
                    Résilier
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}