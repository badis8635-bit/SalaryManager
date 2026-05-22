import { useEffect, useState } from 'react'
import { getWorkers } from '../api/workers'
import { getContract, getContractCost, createContract, updateSalary, updateTaxRates, terminateContract } from '../api/contracts'

const CONTRACT_TYPES = ['employee', 'freelance', 'etudiant']

const Row = ({ label, value, accent }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{label}</span>
    <span style={{ fontWeight: 500, color: accent ? 'var(--accent)' : 'var(--text)' }}>{value}</span>
  </div>
)

export default function Contracts() {
  const [workers, setWorkers]         = useState([])
  const [selectedId, setSelectedId]   = useState('')
  const [contract, setContract]       = useState(null)
  const [cost, setCost]               = useState(null)
  const [showCreate, setShowCreate]   = useState(false)
  const [error, setError]             = useState('')
  const [msg, setMsg]                 = useState('')

  const [form, setForm] = useState({
    contract_type: 'employee', gross_salary: '', start_date: '',
    end_date: '', onss_employee_rate: '13.07', onss_employer_rate: '27.00', precompte_rate: '26.75'
  })
  const [newSalary, setNewSalary]     = useState('')
  const [endDate, setEndDate]         = useState('')

  useEffect(() => { getWorkers().then(r => setWorkers(r.data)) }, [])

  async function loadContract(wid) {
    setContract(null); setCost(null); setError('')
    try {
      const [c, co] = await Promise.all([getContract(wid), getContractCost(wid)])
      setContract(c.data)
      setCost(co.data)
    } catch { setContract(null) }
  }

  function handleSelect(e) {
    setSelectedId(e.target.value)
    if (e.target.value) loadContract(e.target.value)
  }

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createContract({ ...form, worker_id: parseInt(selectedId), gross_salary: parseFloat(form.gross_salary), onss_employee_rate: parseFloat(form.onss_employee_rate), onss_employer_rate: parseFloat(form.onss_employer_rate), precompte_rate: parseFloat(form.precompte_rate) })
      setShowCreate(false); setMsg('Contrat créé ✓'); loadContract(selectedId)
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleUpdateSalary() {
    try {
      await updateSalary(selectedId, parseFloat(newSalary))
      setMsg('Salaire mis à jour ✓'); setNewSalary(''); loadContract(selectedId)
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleTerminate() {
    if (!endDate) return
    try {
      await terminateContract(selectedId, endDate)
      setMsg('Contrat terminé ✓'); loadContract(selectedId)
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  const inputStyle = { width: '100%', padding: '9px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace', fontSize: '13px', outline: 'none' }

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 className="syne" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Contrats</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Salaire, taux ONSS, précompte</p>
      </div>

      {/* Worker selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Sélectionner un employé</label>
        <select value={selectedId} onChange={handleSelect} style={{ ...inputStyle, maxWidth: '360px', cursor: 'pointer' }}>
          <option value="">-- Choisir --</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.first_name} {w.last_name}</option>)}
        </select>
      </div>

      {msg && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(71,255,156,0.08)', border: '1px solid rgba(71,255,156,0.2)', borderRadius: '6px', color: 'var(--success)', fontSize: '13px' }}>{msg}</div>}
      {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,71,71,0.1)', border: '1px solid rgba(255,71,71,0.3)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

      {selectedId && !contract && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: 'var(--muted)', marginBottom: '12px', fontSize: '13px' }}>Aucun contrat pour cet employé.</p>
          <button onClick={() => setShowCreate(true)} style={{ padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>+ Créer un contrat</button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.contract_type} onChange={e=>setForm({...form, contract_type: e.target.value})}>
            {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input style={inputStyle} type="number" placeholder="Salaire brut (€)" value={form.gross_salary} onChange={e=>setForm({...form, gross_salary: e.target.value})} required />
          <input style={inputStyle} type="date" placeholder="Date début" value={form.start_date} onChange={e=>setForm({...form, start_date: e.target.value})} required />
          <input style={inputStyle} type="date" placeholder="Date fin (optionnel)" value={form.end_date} onChange={e=>setForm({...form, end_date: e.target.value})} />
          <input style={inputStyle} type="number" step="0.01" placeholder="ONSS employé %" value={form.onss_employee_rate} onChange={e=>setForm({...form, onss_employee_rate: e.target.value})} />
          <input style={inputStyle} type="number" step="0.01" placeholder="ONSS employeur %" value={form.onss_employer_rate} onChange={e=>setForm({...form, onss_employer_rate: e.target.value})} />
          <input style={inputStyle} type="number" step="0.01" placeholder="Précompte %" value={form.precompte_rate} onChange={e=>setForm({...form, precompte_rate: e.target.value})} />
          <button type="submit" style={{ padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>Créer</button>
        </form>
      )}

      {contract && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Contract detail */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
            <h3 className="syne" style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Contrat actuel</h3>
            <Row label="Type" value={contract.contract_type} />
            <Row label="Salaire brut" value={`${contract.gross_salary} €`} accent />
            <Row label="Date début" value={contract.start_date} />
            <Row label="Date fin" value={contract.end_date || '—'} />
            <Row label="ONSS employé" value={`${contract.onss_employee_rate} %`} />
            <Row label="ONSS employeur" value={`${contract.onss_employer_rate} %`} />
            <Row label="Précompte" value={`${contract.precompte_rate} %`} />
          </div>

          {/* Cost + actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cost && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
                <h3 className="syne" style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px' }}>Coût employeur</h3>
                <Row label="Salaire brut" value={`${cost.gross_salary} €`} />
                <Row label="ONSS employeur" value={`${cost.onss_employer} €`} />
                <Row label="Coût total" value={`${cost.total_employer_cost} €`} accent />
              </div>
            )}

            {/* Update salary */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
              <h3 className="syne" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px' }}>Modifier le salaire</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input style={{ ...inputStyle, flex: 1 }} type="number" placeholder="Nouveau brut (€)" value={newSalary} onChange={e => setNewSalary(e.target.value)} />
                <button onClick={handleUpdateSalary} style={{ padding: '9px 16px', background: 'var(--accent2)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Appliquer</button>
              </div>
            </div>

            {/* Terminate */}
            {contract.contract_type !== 'employee' && (
              <div style={{ background: 'var(--surface)', border: '1px solid rgba(255,71,71,0.2)', borderRadius: '8px', padding: '20px' }}>
                <h3 className="syne" style={{ fontWeight: 700, marginBottom: '12px', fontSize: '15px', color: 'var(--danger)' }}>Résilier le contrat</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input style={{ ...inputStyle, flex: 1 }} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  <button onClick={handleTerminate} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--danger)', borderRadius: '6px', color: 'var(--danger)', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Résilier</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}