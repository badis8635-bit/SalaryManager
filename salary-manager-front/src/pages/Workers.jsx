import { useEffect, useState } from 'react'
import { getWorkers, createWorker, activateWorker, deactivateWorker, deleteWorker } from '../api/workers'

const WORKER_TYPES = ['employee', 'freelance', 'etudiant']

const badge = (active) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '11px',
  background: active ? 'rgba(71,255,156,0.12)' : 'rgba(107,107,107,0.15)',
  color: active ? 'var(--success)' : 'var(--muted)',
  border: `1px solid ${active ? 'rgba(71,255,156,0.3)' : 'var(--border)'}`,
})

export default function Workers() {
  const [workers, setWorkers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ email: '', first_name: '', last_name: '', worker_type: 'employee' })
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState('all')

  async function load() {
    try {
      const res = await getWorkers()
      setWorkers(res.data)
    } catch { setError('Erreur chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createWorker(form)
      setShowForm(false)
      setForm({ email: '', first_name: '', last_name: '', worker_type: 'employee' })
      load()
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function toggleActive(w) {
    try {
      w.is_active ? await deactivateWorker(w.id) : await activateWorker(w.id)
      load()
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet employé ?')) return
    try { await deleteWorker(id); load() }
    catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  const filtered = workers.filter(w =>
    filter === 'all' ? true : filter === 'active' ? w.is_active : !w.is_active
  )

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '6px', color: 'var(--text)', fontFamily: 'DM Mono, monospace',
    fontSize: '13px', outline: 'none'
  }

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="syne" style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Employés</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{workers.length} total · {workers.filter(w=>w.is_active).length} actifs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '10px 20px', background: 'var(--accent)', border: 'none',
          borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif',
          fontWeight: 700, fontSize: '13px', cursor: 'pointer'
        }}>
          {showForm ? '✕ Annuler' : '+ Nouvel employé'}
        </button>
      </div>

      {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(255,71,71,0.1)', border: '1px solid rgba(255,71,71,0.3)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input style={inputStyle} placeholder="Prénom" value={form.first_name} onChange={e=>setForm({...form, first_name: e.target.value})} required />
          <input style={inputStyle} placeholder="Nom" value={form.last_name} onChange={e=>setForm({...form, last_name: e.target.value})} required />
          <input style={inputStyle} placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
          <select style={{...inputStyle, cursor: 'pointer'}} value={form.worker_type} onChange={e=>setForm({...form, worker_type: e.target.value})}>
            {WORKER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" style={{ gridColumn: '1 / -1', padding: '11px', background: 'var(--accent)', border: 'none', borderRadius: '6px', color: '#0f0f0f', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            Créer l'employé
          </button>
        </form>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {['all','active','inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '6px', border: '1px solid',
            borderColor: filter === f ? 'var(--accent)' : 'var(--border)',
            background: filter === f ? 'rgba(232,255,71,0.08)' : 'transparent',
            color: filter === f ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Mono, monospace'
          }}>
            {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Inactifs'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: 'var(--muted)' }}>Chargement...</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['Nom', 'Email', 'Type', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{w.first_name} {w.last_name}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)' }}>{w.email}</td>
                  <td style={{ padding: '14px 16px' }}><span style={{ color: 'var(--accent2)', fontSize: '12px' }}>{w.worker_type}</span></td>
                  <td style={{ padding: '14px 16px' }}><span style={badge(w.is_active)}>{w.is_active ? 'actif' : 'inactif'}</span></td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => toggleActive(w)} style={{ padding: '4px 10px', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--muted)', cursor: 'pointer', fontSize: '11px', fontFamily: 'DM Mono, monospace' }}>
                        {w.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => handleDelete(w.id)} style={{ padding: '4px 10px', border: '1px solid rgba(255,71,71,0.3)', borderRadius: '4px', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '11px', fontFamily: 'DM Mono, monospace' }}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)' }}>Aucun employé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}