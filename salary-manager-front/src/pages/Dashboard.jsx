import { useEffect, useState } from 'react'
import { getWorkers } from '../api/workers'
import { getPendingPayslips } from '../api/payslips'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

// ── Composants UI ────────────────────────────────────────────────────────────

const KPI = ({ label, value, sub, highlight, danger }) => (
  <div style={{
    background: 'var(--surface)', border: `1px solid ${highlight ? 'rgba(42,92,69,0.25)' : danger ? 'rgba(192,57,43,0.2)' : 'var(--border)'}`,
    borderRadius: '8px', padding: '18px 20px',
  }}>
    <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>{label}</div>
    <div className="serif" style={{ fontSize: '28px', color: highlight ? 'var(--accent)' : danger ? 'var(--danger)' : 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '5px' }}>{sub}</div>}
  </div>
)

const ChartCard = ({ title, sub, children }) => (
  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{title}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label, unit = '€' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px', fontSize: '12.5px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          <span>{p.name}</span>
          <strong>{typeof p.value === 'number' ? `${p.value.toFixed(2)} ${unit}` : p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Génération de données mock à partir des vraies données ────────────────────

function buildMonthlyData(payslips) {
  const map = {}
  payslips.forEach(p => {
    const key = `${p.period_year}-${String(p.period_month).padStart(2,'0')}`
    if (!map[key]) map[key] = { key, month: MONTHS_SHORT[p.period_month-1], year: p.period_year, brut: 0, net: 0, cout: 0, primes: 0, count: 0 }
    map[key].brut   += Number(p.gross_salary)
    map[key].net    += Number(p.net_salary)
    map[key].cout   += Number(p.gross_salary) + Number(p.onss_employer)
    map[key].primes += Number(p.bonus || 0)
    map[key].count  += 1
  })
  return Object.values(map)
    .sort((a,b) => a.key.localeCompare(b.key))
    .slice(-12)
    .map(d => ({ ...d, brut: Math.round(d.brut*100)/100, net: Math.round(d.net*100)/100, cout: Math.round(d.cout*100)/100, primes: Math.round(d.primes*100)/100 }))
}

function buildContractDistrib(workers) {
  const map = {}
  workers.forEach(w => { map[w.worker_type] = (map[w.worker_type] || 0) + 1 })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

function buildStatusDistrib(payslips) {
  const map = {}
  payslips.forEach(p => { const s = p.status.toLowerCase(); map[s] = (map[s] || 0) + 1 })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

const PIE_COLORS_CONTRACT = ['#2a5c45', '#6b9e87', '#b8d4c8', '#d4e8e0']
const PIE_COLORS_STATUS   = ['#8a6c1a', '#2a5c45', '#c0392b']

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [workers, setWorkers]     = useState([])
  const [payslips, setPayslips]   = useState([])
  const [pending, setPending]     = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [wRes, pRes] = await Promise.all([
          getWorkers(),
          getPendingPayslips(),
        ])
        setWorkers(wRes.data)
        setPending(pRes.data)

        // Charger les fiches de tous les workers actifs
        const { getWorkerPayslips } = await import('../api/payslips')
        const activeWorkers = wRes.data.filter(w => w.is_active)
        const allPayslips = []
        await Promise.all(activeWorkers.map(async w => {
          try {
            const r = await getWorkerPayslips(w.id)
            allPayslips.push(...r.data)
          } catch {}
        }))
        setPayslips(allPayslips)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Chargement du tableau de bord...</p>
    </div>
  )

  // ── Calculs ────────────────────────────────────────────────────────────────
  const activeWorkers   = workers.filter(w => w.is_active)
  const inactiveWorkers = workers.filter(w => !w.is_active)
  const paidPayslips    = payslips.filter(p => p.status.toUpperCase() === 'PAID')

  const totalMasse = payslips.reduce((s, p) => s + Number(p.gross_salary), 0)
  const totalNet   = payslips.reduce((s, p) => s + Number(p.net_salary), 0)
  const totalCout  = payslips.reduce((s, p) => s + Number(p.gross_salary) + Number(p.onss_employer), 0)
  const totalPrimes= payslips.reduce((s, p) => s + Number(p.bonus || 0), 0)

  const monthlyData    = buildMonthlyData(payslips)
  const contractDistrib= buildContractDistrib(workers)
  const statusDistrib  = buildStatusDistrib(payslips)

  // Mois courant
  const now = new Date()
  const currentMonthPayslips = payslips.filter(p => p.period_month === now.getMonth()+1 && p.period_year === now.getFullYear())
  const masseMoisCourant = currentMonthPayslips.reduce((s,p) => s + Number(p.gross_salary), 0)

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="serif" style={{ fontSize: '32px', letterSpacing: '-0.02em', marginBottom: '2px' }}>Tableau de bord</h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Vue d'ensemble RH — toutes périodes confondues</p>
      </div>

      {/* KPIs row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
        <KPI label="Employés actifs"    value={activeWorkers.length}   sub={`${inactiveWorkers.length} inactif(s)`} />
        <KPI label="Masse salariale"    value={`${totalMasse.toFixed(0)} €`} sub="cumul toutes périodes" highlight />
        <KPI label="Coût total employeur" value={`${totalCout.toFixed(0)} €`} sub="brut + ONSS employeur" />
        <KPI label="Fiches en attente"  value={pending.length} danger={pending.length > 0} sub="à valider" />
      </div>

      {/* KPIs row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        <KPI label="Net total versé"    value={`${totalNet.toFixed(0)} €`} />
        <KPI label="Primes versées"     value={`${totalPrimes.toFixed(0)} €`} />
        <KPI label="Fiches payées"      value={paidPayslips.length} sub={`sur ${payslips.length} générées`} />
        <KPI label="Masse mois courant" value={`${masseMoisCourant.toFixed(0)} €`} sub={`${MONTHS_SHORT[now.getMonth()]} ${now.getFullYear()}`} highlight={masseMoisCourant > 0} />
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Évolution masse salariale */}
        <ChartCard title="Évolution de la masse salariale" sub="12 derniers mois">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradBrut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2a5c45" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2a5c45" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6b9e87" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6b9e87" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Area type="monotone" dataKey="brut" name="Brut" stroke="#2a5c45" strokeWidth={2} fill="url(#gradBrut)" dot={false} />
                <Area type="monotone" dataKey="net"  name="Net"  stroke="#6b9e87" strokeWidth={2} fill="url(#gradNet)"  dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--muted)', fontSize: '13px', padding: '32px 0', textAlign: 'center' }}>Aucune donnée</p>}
        </ChartCard>

        {/* Répartition contrats */}
        <ChartCard title="Types de contrats" sub="Répartition des employés">
          {contractDistrib.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={contractDistrib} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {contractDistrib.map((_, i) => <Cell key={i} fill={PIE_COLORS_CONTRACT[i % PIE_COLORS_CONTRACT.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} employé(s)`, n]} contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--muted)', fontSize: '13px', padding: '32px 0', textAlign: 'center' }}>Aucune donnée</p>}
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Coût vs net par mois */}
        <ChartCard title="Coût employeur vs Net versé" sub="Comparaison mensuelle">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="cout" name="Coût employeur" fill="#1a1916" radius={[3,3,0,0]} />
                <Bar dataKey="net"  name="Net versé"      fill="#b8d4c8" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{ color: 'var(--muted)', fontSize: '13px', padding: '32px 0', textAlign: 'center' }}>Aucune donnée</p>}
        </ChartCard>

        {/* Primes + statut */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ChartCard title="Statut des fiches" sub="Toutes périodes">
            {statusDistrib.length > 0 ? (
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={statusDistrib} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip formatter={(v) => [`${v} fiche(s)`, '']} contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                  <Bar dataKey="value" name="Fiches" radius={[0,3,3,0]}>
                    {statusDistrib.map((d, i) => {
                      const colors = { paid: '#2a5c45', pending: '#8a6c1a', cancelled: '#c0392b' }
                      return <Cell key={i} fill={colors[d.name] || '#9a958e'} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--muted)', fontSize: '12px' }}>Aucune donnée</p>}
          </ChartCard>

          <ChartCard title="Primes versées" sub="Par mois">
            {monthlyData.filter(d => d.primes > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="primes" name="Primes" fill="#8a6c1a" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--muted)', fontSize: '12px', padding: '16px 0', textAlign: 'center' }}>Aucune prime enregistrée</p>}
          </ChartCard>
        </div>
      </div>

      {/* Pending payslips alert */}
      {pending.length > 0 && (
        <div style={{ background: 'var(--warn-l)', border: '1px solid rgba(138,108,26,0.25)', borderRadius: '8px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--warn)', marginBottom: '2px' }}>
                {pending.length} fiche(s) en attente de paiement
              </p>
              <p style={{ fontSize: '12.5px', color: 'var(--text2)' }}>
                Total net à verser : <strong>{pending.reduce((s,p) => s + Number(p.net_salary), 0).toFixed(2)} €</strong>
              </p>
            </div>
            <a href="/payslips" style={{ padding: '8px 16px', background: 'var(--warn)', border: 'none', borderRadius: '6px', color: 'white', fontFamily: 'Geist, sans-serif', fontWeight: 500, fontSize: '13px', cursor: 'pointer', textDecoration: 'none' }}>
              Voir les fiches →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}