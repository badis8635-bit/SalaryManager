import { useEffect, useState } from 'react'
import { getWorkers, createWorker, activateWorker, deactivateWorker, deleteWorker } from '../api/workers'

const WORKER_TYPES = ['employee', 'freelance', 'etudiant']

const Tag = ({ label, variant = 'default' }) => {
  const styles = {
    active:   { bg: 'var(--paid-l)',   color: 'var(--paid)',   border: 'rgba(26,77,53,0.2)' },
    inactive: { bg: 'var(--surface2)', color: 'var(--muted)',  border: 'var(--border)' },
    default:  { bg: 'var(--surface2)', color: 'var(--text2)',  border: 'var(--border)' },
  }
  const s = styles[variant] || styles.default
  return (
    <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '4px', fontSize: '11.5px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 500 }}>
      {label}
    </span>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px',
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '6px', color: 'var(--text)',
  fontFamily: 'Geist, sans-serif', fontSize: '13.5px', outline: 'none',
  transition: 'border-color 0.15s',
}

export default function Workers() {
  const [workers, setWorkers]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ email: '', first_name: '', last_name: '', worker_type: 'employee' })
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState('all')

  async function load() {
    try { const res = await getWorkers(); setWorkers(res.data) }
    catch { setError('Erreur de chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault(); setError('')
    try {
      await createWorker(form)
      setShowForm(false)
      setForm({ email: '', first_name: '', last_name: '', worker_type: 'employee' })
      load()
    } catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function toggleActive(w) {
    try { w.is_active ? await deactivateWorker(w.id) : await activateWorker(w.id); load() }
    catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cet employé ?')) return
    try { await deleteWorker(id); load() }
    catch (err) { setError(err.response?.data?.detail || 'Erreur') }
  }

  const filtered = workers.filter(w =>
    filter === 'all' ? true : filter === 'active' ? w.is_active : !w.is_active
  )

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 className="serif" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '2px' }}>Employés</h1>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
            {workers.filter(w=>w.is_active).length} actifs sur {workers.length}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '9px 18px', background: showForm ? 'var(--surface2)' : 'var(--text)',
          border: '1px solid', borderColor: showForm ? 'var(--border)' : 'var(--text)',
          borderRadius: '6px', color: showForm ? 'var(--text2)' : 'white',
          fontFamily: 'Geist, sans-serif', fontWeight: 500, fontSize: '13.5px', cursor: 'pointer',
          transition: 'all 0.15s',
        }}>
          {showForm ? 'Annuler' : '+ Nouvel employé'}
        </button>
      </div>

      {error && <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'var(--danger-l)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: '6px', color: 'var(--danger)', fontSize: '13px' }}>{error}</div>}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '16px', color: 'var(--text2)' }}>Nouvel employé</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input style={inputStyle} placeholder="Prénom" value={form.first_name} onChange={e=>setForm({...form, first_name: e.target.value})} required
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} placeholder="Nom" value={form.last_name} onChange={e=>setForm({...form, last_name: e.target.value})} required
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <input style={inputStyle} placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required
              onFocus={e=>e.target.style.borderColor='var(--accent)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
            <select style={{...inputStyle, cursor:'pointer'}} value={form.worker_type} onChange={e=>setForm({...form, worker_type: e.target.value})}>
              {WORKER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button type="submit" style={{ gridColumn:'1/-1', padding:'10px', background:'var(--text)', border:'none', borderRadius:'6px', color:'white', fontFamily:'Geist,sans-serif', fontWeight:500, fontSize:'13.5px', cursor:'pointer' }}>
              Créer l'employé
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'16px' }}>
        {[['all','Tous'],['active','Actifs'],['inactive','Inactifs']].map(([val,label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding:'5px 14px', borderRadius:'5px', cursor:'pointer',
            border:'1px solid', fontSize:'12.5px', fontFamily:'Geist,sans-serif',
            borderColor: filter===val ? 'var(--border2)' : 'var(--border)',
            background: filter===val ? 'var(--surface)' : 'transparent',
            color: filter===val ? 'var(--text)' : 'var(--muted)',
            fontWeight: filter===val ? 500 : 400,
          }}>{label}</button>
        ))}
      </div>

      {/* Table */}
      {loading ? <p style={{ color:'var(--muted)' }}>Chargement...</p> : (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg)' }}>
                {['Nom','Email','Type','Statut','Actions'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', color:'var(--muted)', fontSize:'11.5px', letterSpacing:'0.04em', textTransform:'uppercase', fontWeight:500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} style={{ borderBottom: i<filtered.length-1 ? '1px solid var(--border)' : 'none', transition:'background 0.1s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'13px 16px', fontWeight:500, fontSize:'14px' }}>{w.first_name} {w.last_name}</td>
                  <td style={{ padding:'13px 16px', color:'var(--text2)', fontSize:'13px' }}>{w.email}</td>
                  <td style={{ padding:'13px 16px' }}><Tag label={w.worker_type} /></td>
                  <td style={{ padding:'13px 16px' }}><Tag label={w.is_active ? 'actif' : 'inactif'} variant={w.is_active ? 'active' : 'inactive'} /></td>
                  <td style={{ padding:'13px 16px' }}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => toggleActive(w)} style={{ padding:'4px 10px', border:'1px solid var(--border)', borderRadius:'4px', background:'transparent', color:'var(--text2)', cursor:'pointer', fontSize:'12px', fontFamily:'Geist,sans-serif', transition:'all 0.1s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.background='var(--surface2)'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='transparent'}}>
                        {w.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button onClick={() => handleDelete(w.id)} style={{ padding:'4px 10px', border:'1px solid rgba(192,57,43,0.25)', borderRadius:'4px', background:'transparent', color:'var(--danger)', cursor:'pointer', fontSize:'12px', fontFamily:'Geist,sans-serif' }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'var(--muted)', fontSize:'13px' }}>Aucun employé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}