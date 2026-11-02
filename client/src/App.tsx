import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'

type Screen =
  | 'Dashboard'
  | 'Capital & Partners'
  | 'Leads'
  | 'Loans'
  | 'Scheduled EMIs'
  | 'Expenses'
  | 'Profit & Loss'
  | 'Transactions'

type IconName =
  | 'grid' | 'wallet' | 'userWallet' | 'leads' | 'loans' | 'calendar'
  | 'expense' | 'chart' | 'transaction' | 'bell' | 'search' | 'plus'
  | 'arrowUp' | 'arrowDown' | 'chevron' | 'download' | 'filter' | 'logout'
  | 'menu' | 'close' | 'check' | 'upload' | 'arrowRight' | 'arrowLeft'
  | 'home' | 'cards' | 'activity' | 'dots' | 'palette' | 'transfer' | 'request' | 'bills' | 'exchange' | 'eye' | 'eyeOff' | 'smartphone' | 'payments'
  | 'bolt' | 'phone' | 'mail' | 'user' | 'building' | 'rupee' | 'calculator' | 'receipt' | 'fileText' | 'checkCircle' | 'clock' | 'chevronDown' | 'chevronUp'

const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  wallet: <><path d="M3 6h16v14H3z"/><path d="M3 8V5a2 2 0 0 1 2-2h12"/><path d="M15 12h6v5h-6a2.5 2.5 0 0 1 0-5Z"/></>,
  userWallet: <><circle cx="9" cy="7" r="3"/><path d="M3 18a6 6 0 0 1 12 0"/><path d="M15 11h6v9h-6"/></>,
  leads: <><circle cx="8" cy="8" r="4"/><path d="M2 21a6 6 0 0 1 12 0M17 8v6M14 11h6"/></>,
  loans: <><path d="M3 6h18v14H3zM7 10h10M7 15h6"/><path d="M7 3v3M17 3v3"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 18h2"/></>,
  expense: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2Z"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  transaction: <><path d="M4 7h16M4 17h16M8 3 4 7l4 4M16 13l4 4-4 4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  arrowUp: <path d="m7 14 5-5 5 5"/>,
  arrowDown: <path d="m7 10 5 5 5-5"/>,
  chevron: <path d="m9 18 6-6-6-6"/>,
  download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5"/><path d="M4 19h16"/></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z"/>,
  logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M18 12H8"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="m5 5 14 14M19 5 5 19"/>,
  check: <path d="m5 12 4 4L19 6"/>,
  upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5"/>,
  arrowLeft: <path d="M19 12H5m5 5-5-5 5-5"/>,
  home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  cards: <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  dots: <><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/></>,
  palette: <><path d="M12 2C6.49 2 2 6.49 2 12c0 5.51 4.49 10 10 10a2.5 2.5 0 0 0 2.5-2.5c0-.64-.24-1.23-.64-1.68-.42-.46-.68-1.07-.68-1.74 0-1.38 1.12-2.5 2.5-2.5h1.9c3.04 0 5.42-2.46 5.42-5.5C22.5 6.07 17.75 2 12 2Z"/><circle cx="8" cy="10" r="1.5" fill="currentColor"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/><circle cx="16" cy="10" r="1.5" fill="currentColor"/></>,
  transfer: <path d="M7 17L17 7M17 7H7M17 7V17"/>,
  request: <path d="M17 7L7 17M7 17H17M7 17V7"/>,
  bills: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  exchange: <><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></>,
  eye: <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/></>,
  smartphone: <><rect x="5" y="2" width="14" height="20" rx="3" ry="3"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  payments: <><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2Z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></>,
  bolt: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
  mail: <><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></>,
  building: <><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></>,
  rupee: <path d="M6 3h12M6 8h12M6 13l7.5 8M6 8a4.5 4.5 0 0 0 9 0M6 3v10"/>,
  calculator: <><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/></>,
  receipt: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
  fileText: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  chevronDown: <polyline points="6 9 12 15 18 9"/>,
  chevronUp: <polyline points="18 15 12 9 6 15"/>,
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

function MStatsGrid({ stats }: { stats: { label: string; value: string; sub?: string; tone?: 'green' | 'red' | 'blue' | 'amber' }[] }) {
  return (
    <div className="m-stats-grid">
      {stats.map((s, i) => (
        <div key={i} className={`m-stat-card ${s.tone ? `tone-${s.tone}` : ''}`}>
          <div className="m-stat-label">{s.label}</div>
          <div className="m-stat-val">{s.value}</div>
          {s.sub && <div className="m-stat-sub">{s.sub}</div>}
        </div>
      ))}
    </div>
  )
}

function MSearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="m-search-wrap">
      <div className="m-search-icon">
        <Icon name="search" size={16}/>
      </div>
      <input
        type="text"
        className="m-search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

const navItems: { name: Screen; icon: IconName }[] = [
  { name: 'Dashboard', icon: 'grid' },
  { name: 'Capital & Partners', icon: 'wallet' },
  { name: 'Leads', icon: 'leads' },
  { name: 'Loans', icon: 'loans' },
  { name: 'Scheduled EMIs', icon: 'calendar' },
  { name: 'Expenses', icon: 'expense' },
  { name: 'Profit & Loss', icon: 'chart' },
  { name: 'Transactions', icon: 'transaction' },
]

type FinancerTeam = {
  id: string
  financer_id: string
  name: string
  role: string
  phone: string
  email: string
  status: string
}

type Financer = {
  id: string
  name: string
  role: string
  theme: 'violet' | 'amber' | 'cyan'
  capital_invested: number
  phone?: string
  email?: string
  status?: string
  teams: FinancerTeam[]
  leadsCount?: number
}

type UserRole = {
  type: 'admin' | 'financer' | 'team'
  id: string
  name: string
  financerId?: string
  financerName?: string
  teamId?: string
  teamName?: string
}

type Partner = {
  id: string
  name: string
  role: string
  theme: 'violet' | 'amber' | 'cyan'
  capitalInvested: number
  sharePct: number
  grossShare: number
  expenseShare: number
  netProfitShare: number
  roiPct: number
  status: string
}

type PnlSummary = {
  grossRevenue: number
  interestEarned: number
  processingFees: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalCapitalInvested: number
  distribution: Partner[]
}

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(value || 0))

function Badge({ status }: { status: string }) {
  const type = ['Paid', 'Completed', 'Approved', 'Active', 'Qualified', 'Converted', 'Profitable'].includes(status)
    ? 'success'
    : ['Overdue', 'Rejected', 'Deficit'].includes(status) ? 'danger'
    : ['Partial', 'Pending', 'Follow-up', 'Disbursal due', 'New'].includes(status) ? 'warning' : 'neutral'
  return <span className={`badge badge-${type}`}><span className="badge-dot"/>{status}</span>
}

function Button({ children, variant = 'primary', icon, onClick, type = 'button', disabled = false }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; icon?: IconName; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return <button type={type} disabled={disabled} className={`button button-${variant}`} onClick={onClick}>{icon && <Icon name={icon} size={16}/>} {children}</button>
}

function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow: string; actions?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>{actions && <div className="header-actions">{actions}</div>}</div>
}

function Metric({ label, value, note, trend, tone = 'default' }: { label: string; value: string; note?: string; trend?: string; tone?: 'default' | 'green' | 'red' | 'blue' }) {
  return <div className={`metric metric-${tone}`}>
    <div className="metric-top"><span>{label}</span>{trend && <span className={`trend ${trend.startsWith('+') ? 'up' : 'down'}`}><Icon name={trend.startsWith('+') ? 'arrowUp' : 'arrowDown'} size={13}/>{trend}</span>}</div>
    <strong>{value}</strong>{note && <small>{note}</small>}
  </div>
}

function DataTable({ headers, rows, action }: { headers: string[]; rows: string[][]; action?: (row: string[], index: number) => ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}{action && <th>Action</th>}</tr></thead>
    <tbody>
      {rows.length === 0 ? (
        <tr><td colSpan={headers.length + (action ? 1 : 0)} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>No records found.</td></tr>
      ) : (
        rows.map((row, i) => <tr key={`${row[0]}-${i}`}>{row.map((cell, j) => <td key={j}>{j === row.length - 1 ? <Badge status={cell}/> : cell}</td>)}{action && <td>{action(row, i)}</td>}</tr>)
      )}
    </tbody>
  </table></div>
}

function SearchFilter({ placeholder = 'Search records...', value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
  return <div className="toolbar">
    <label className="search-field"><Icon name="search" size={17}/><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/></label>
    <Button variant="secondary" icon="filter">Filters</Button>
  </div>
}

function LineChart() {
  return <div className="chart-area">
    <div className="chart-y"><span>₹12L</span><span>₹8L</span><span>₹4L</span><span>₹0</span></div>
    <svg viewBox="0 0 600 180" preserveAspectRatio="none" aria-label="Cash flow chart">
      <defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop className="chart-gradient-start" offset="0%" stopOpacity=".22"/><stop className="chart-gradient-end" offset="100%" stopOpacity="0"/></linearGradient></defs>
      <path className="gridline" d="M0 20H600M0 70H600M0 120H600M0 170H600"/>
      <path className="chart-fill" d="M0 150 C50 130 70 138 110 105 S180 125 225 80 S290 104 340 65 S410 85 460 45 S530 55 600 25 V180 H0Z"/>
      <path className="chart-line" d="M0 150 C50 130 70 138 110 105 S180 125 225 80 S290 104 340 65 S410 85 460 45 S530 55 600 25"/>
      <path className="chart-line secondary" d="M0 115 C60 100 90 125 145 110 S230 140 290 115 S370 118 430 85 S520 102 600 78"/>
    </svg>
    <div className="chart-x"><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span></div>
  </div>
}

function Donut({ utilization = 72, deployed = '₹31.5L', available = '₹14.3L' }: { utilization?: number; deployed?: string; available?: string }) {
  return <div className="donut-layout">
    <div className="donut"><div><strong>{Math.round(utilization)}%</strong><span>Utilized</span></div></div>
    <div className="legend">
      <div><i className="legend-green"/><span>Deployed in Loans</span><strong>{deployed}</strong></div>
      <div><i className="legend-navy"/><span>Available Capital</span><strong>{available}</strong></div>
      <div><i className="legend-gray"/><span>Statutory Reserve</span><strong>₹2.0L</strong></div>
    </div>
  </div>
}

function SectionCard({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}

// -------------------------------------------------------------
// 1. DASHBOARD (SINGLE-USER UNIFIED ENTERPRISE OVERVIEW)
// -------------------------------------------------------------

function Dashboard({
  navigate,
  masterWallet,
  emis,
  loans,
  expenses,
  pnl
}: {
  navigate: (s: Screen) => void
  masterWallet: { total_capital: number; available_balance: number; allocated_capital: number }
  emis: string[][]
  loans: string[][]
  expenses: string[][]
  pnl: PnlSummary
}) {
  const activeLoans = loans.filter(l => l[7] === 'Active').length
  const upcomingEmis = emis.filter(e => e[6] === 'Upcoming' || e[6] === 'Overdue')
  const totalExp = pnl.totalExpenses || expenses.reduce((sum, e) => sum + (Number(e[4].replace(/[^0-9]/g, '')) || 0), 0)

  return (
    <>
      <PageHeader
        title="Capital & Loan Dashboard"
        eyebrow={`Enterprise Overview · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
        actions={
          <div className="header-actions">
            <Button icon="plus" onClick={() => navigate('Loans')}>New loan</Button>
            <Button icon="download" variant="secondary" onClick={() => window.print()}>Export report</Button>
          </div>
        }
      />
      <div className="metrics-grid">
        <Metric label="Total Capital Pool" value={money(masterWallet.total_capital)} note="Total investor capital" trend="+8.2%"/>
        <Metric label="Central Available Balance" value={money(masterWallet.available_balance)} note="Liquid ready to deploy" tone="green"/>
        <Metric label="Deployed in Loans" value={money(masterWallet.allocated_capital)} note={`${activeLoans} active sanctioned loans`} tone="blue"/>
        <Metric label="Gross Revenue" value={money(pnl.grossRevenue)} note="Interest + processing fees" trend="+14.2%" tone="green"/>
        <Metric label="Operating Expenses" value={money(totalExp)} note="Debited directly from central pool" trend="-2.1%" tone="red"/>
        <Metric label="Net Distributable Profit" value={money(pnl.netProfit)} note={`${pnl.profitMargin}% enterprise margin`} trend="+18.6%" tone="green"/>
        <Metric label="Capital Partners" value={String(pnl.distribution.length)} note="Sharing P&L pro-rata"/>
        <Metric label="Enterprise ROI" value={`${(pnl.distribution[0]?.roiPct || 7.74)}%`} note="Annualized return" tone="green"/>
      </div>
      <div className="dashboard-grid">
        <SectionCard title="Capital Flow" subtitle="Disbursements vs EMI collections over 6 months" className="wide" action={<div className="chart-legend"><span><i className="dot green"/>Inflow (EMI Repayments)</span><span><i className="dot navy"/>Outflow (Disbursements)</span></div>}><LineChart/></SectionCard>
        <SectionCard title="Capital Utilization" subtitle="Portfolio deployment vs liquid reserve"><Donut utilization={Math.min(95, Math.round((masterWallet.allocated_capital / (masterWallet.total_capital || 1)) * 100))} deployed={money(masterWallet.allocated_capital)} available={money(masterWallet.available_balance)}/></SectionCard>
        <SectionCard title="Capital Profitability" subtitle="Net profit distributed across partners"><div className="profit-stat"><strong>{money(pnl.netProfit)}</strong><span>+18.6% vs last period</span></div><div className="bar-chart">{[42,55,48,68,73,86].map((h,i)=><div key={i}><span style={{height:`${h}%`}}/><small>{['Oct','Nov','Dec','Jan','Feb','Mar'][i]}</small></div>)}</div></SectionCard>
        <SectionCard title="Upcoming EMI Collections" subtitle="Installments ready to credit central balance" className="wide" action={<button className="text-button" onClick={()=>navigate('Scheduled EMIs')}>View all EMIs <Icon name="arrowRight" size={15}/></button>}>
          <div className="emi-list">
            {upcomingEmis.slice(0, 4).map((r, i) => (
              <div className="emi-row" key={`${r[2]}-${i}`}>
                <div className="date-tile">
                  <strong>{r[0].slice(0, 2)}</strong>
                  <span>{r[0].slice(3, 6).toUpperCase()}</span>
                </div>
                <div className="emi-name">
                  <strong>{r[1]}</strong>
                  <span>{r[2]} · Installment #{i + 1}</span>
                </div>
                <strong>{r[5]}</strong>
                <Badge status={r[6]}/>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  )
}

// -------------------------------------------------------------
// 2. CAPITAL & PARTNERS (CENTRALIZED BALANCE & INVESTORS)
// -------------------------------------------------------------

function CapitalAndPartners({
  masterWallet,
  partners,
  financers,
  transactions,
  openAddCapital,
  openAddFinancer,
  openAddTeam,
  onDeleteTeam
}: {
  masterWallet: { total_capital: number; available_balance: number; allocated_capital: number }
  partners: Partner[]
  financers: Financer[]
  transactions: string[][]
  openAddCapital: () => void
  openAddFinancer: () => void
  openAddTeam: (financerId: string, financerName: string) => void
  onDeleteTeam: (teamId: string, teamName: string) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query) return transactions
    return transactions.filter(t => t.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [transactions, query])

  return (
    <>
      {/* Mobile Master Wallet Hero */}
      <div className="m-wallet-hero">
        <div className="m-wallet-label">CENTRALIZED MASTER POOL</div>
        <div className="m-wallet-bal">{money(masterWallet.available_balance)}</div>
        <div className="m-wallet-sub">Liquid funds available for immediate loan disbursals</div>
        <div className="m-wallet-stats-row">
          <div>
            <span style={{ fontSize: '9px', opacity: 0.75, display: 'block', textTransform: 'uppercase' }}>Total Capital</span>
            <strong style={{ fontSize: '14px', fontFamily: 'Manrope' }}>{money(masterWallet.total_capital)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '9px', opacity: 0.75, display: 'block', textTransform: 'uppercase' }}>Deployed In Loans</span>
            <strong style={{ fontSize: '14px', fontFamily: 'Manrope' }}>{money(masterWallet.allocated_capital)}</strong>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="m-action-bar" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <button
          type="button"
          className="m-action-btn primary"
          onClick={openAddFinancer}
        >
          <Icon name="plus" size={16}/> Add Financer
        </button>
        <button
          type="button"
          className="m-action-btn secondary"
          onClick={openAddCapital}
        >
          <Icon name="plus" size={16}/> Invest Capital
        </button>
      </div>

      {/* Chain Reaction Hierarchy Notice */}
      <div className="m-notice-box" style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
        <Icon name="bolt" size={16}/>
        <div>
          <strong>Chain Reaction Hierarchy:</strong> Admin adds Financers, and each Financer can manage their Sub-Teams. Leads added link to their assigned Sub-Team or directly to the Financer.
        </div>
      </div>

      {/* Financers & Sub-Teams List */}
      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="userWallet" size={16}/> Financers & Teams (Chain Reaction)
          <span className="m-count-badge">{financers.length}</span>
        </h4>
      </div>

      {financers.map(f => {
        const teamCount = f.teams?.length || 0
        return (
          <div className="m-partner-card" key={f.id}>
            <div className="m-partner-head">
              <div className="m-partner-avatar" style={{ background: f.theme === 'amber' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : f.theme === 'cyan' ? 'linear-gradient(135deg, #06b6d4, #0891b2)' : 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                {f.name.split(' ').map(x => x[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{f.name}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{f.role || 'Financer / Capital Partner'}</div>
              </div>
              <Badge status={f.status || 'Active'}/>
            </div>

            <div className="m-card-grid">
              <div className="m-grid-cell">
                <span className="m-grid-label">Capital Invested</span>
                <span className="m-grid-value highlight">{money(f.capital_invested || 0)}</span>
              </div>
              <div className="m-grid-cell">
                <span className="m-grid-label">Sub-Teams & Agents</span>
                <span className="m-grid-value highlight" style={{ color: teamCount > 0 ? '#2563eb' : '#d97706' }}>
                  {teamCount > 0 ? `${teamCount} Sub-Teams` : '0 Teams (Direct)'}
                </span>
              </div>
              <div className="m-grid-cell">
                <span className="m-grid-label">Assigned Leads</span>
                <span className="m-grid-value success">{f.leadsCount || 0} Leads</span>
              </div>
              <div className="m-grid-cell">
                <span className="m-grid-label">Chain Attribution Mode</span>
                <span className="m-grid-value" style={{ fontSize: '11px', color: teamCount > 0 ? '#16a34a' : '#d97706' }}>
                  {teamCount > 0 ? 'Tier 2 (Via Teams)' : 'Tier 1 (Financer Direct)'}
                </span>
              </div>
            </div>

            {/* Sub-Teams list under this Financer */}
            <div className="m-team-sublist">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sub-Teams & Agents ({teamCount})
                </span>
                <button
                  type="button"
                  className="m-add-subteam-btn"
                  onClick={() => openAddTeam(f.id, f.name)}
                >
                  <Icon name="plus" size={13}/> Add Team / Agent
                </button>
              </div>

              {teamCount > 0 ? (
                f.teams.map(t => (
                  <div className="m-team-item" key={t.id}>
                    <div className="m-team-item-left">
                      <div className="m-team-badge-icon">👥</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          {t.role} {t.phone ? `· ${t.phone}` : ''}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteTeam(t.id, t.name)}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#ef4444',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                      title="Remove Sub-Team"
                    >
                      ✕
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '11px', color: '#92400e', background: '#fef3c7', padding: '8px 10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                  ⚡ <strong>Direct Financer Attribution:</strong> No sub-teams added yet. Any lead assigned to {f.name} will belong directly to them!
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Partners Equity List */}
      <div className="m-section-header" style={{ marginTop: '20px' }}>
        <h4 className="m-section-title">
          <Icon name="chart" size={16}/> Central Capital Partners & Equity
          <span className="m-count-badge">{partners.length}</span>
        </h4>
      </div>

      {partners.map(p => (
        <div className="m-partner-card" key={p.id}>
          <div className="m-partner-head">
            <div className="m-partner-avatar">{p.name.split(' ').map(x => x[0]).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{p.role}</div>
            </div>
            <Badge status={p.status || 'Active'}/>
          </div>
          <div className="m-card-grid">
            <div className="m-grid-cell">
              <span className="m-grid-label">Capital Invested</span>
              <span className="m-grid-value highlight">{money(p.capitalInvested)}</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Pool Equity Share</span>
              <span className="m-grid-value highlight" style={{ color: 'var(--green)' }}>{p.sharePct}%</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Net Profit Share</span>
              <span className="m-grid-value success">+{money(p.netProfitShare)}</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Annual ROI</span>
              <span className="m-grid-value success">{p.roiPct}%</span>
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginBottom: '3px' }}>
              <span>Pro-rata Equity Share</span>
              <span>{p.sharePct}%</span>
            </div>
            <div className="progress"><span style={{ width: `${Math.min(100, p.sharePct)}%` }}/></div>
          </div>
        </div>
      ))}

      {/* Central Capital History */}
      <div className="m-section-header" style={{ marginTop: '20px' }}>
        <h4 className="m-section-title">
          <Icon name="transaction" size={16}/> Capital History & Flow
          <span className="m-count-badge">{filtered.length}</span>
        </h4>
      </div>

      <MSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search capital transactions..."
      />

      {filtered.slice(0, 8).map((t, idx) => {
        const isCredit = t[4] === 'Credit' || t[4] === 'Capital' || t[4] === 'EMI'
        return (
          <div className="m-card" key={`${t[0]}-${idx}`}>
            <div className="m-card-head">
              <div>
                <div className="m-card-title">{t[2]}</div>
                <div className="m-card-subtitle">{t[0]} · {t[1]}</div>
              </div>
              <span className={`badge ${isCredit ? 'badge-success' : 'badge-danger'}`}>
                {t[4]}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{t[3]}</span>
              <strong style={{ fontSize: '15px', color: isCredit ? '#16a34a' : '#ef4444', fontFamily: 'Manrope' }}>
                {isCredit ? '+' : '-'}{t[5]}
              </strong>
            </div>
          </div>
        )
      })}
    </>
  )
}

// -------------------------------------------------------------
// 3. LEADS (ADD LEAD & CONVERT TO LOAN)
// -------------------------------------------------------------

function Leads({
  leads,
  financers,
  openAdd,
  convert
}: {
  leads: string[][]
  financers: Financer[]
  openAdd: () => void
  convert: (id: string, name: string) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedFinancerFilter, setSelectedFinancerFilter] = useState('all')

  const filtered = useMemo(() => {
    let res = leads
    if (selectedFinancerFilter !== 'all') {
      res = res.filter(r => (r[8] && r[8] === selectedFinancerFilter) || (r[7] && r[7].toLowerCase().includes(selectedFinancerFilter.toLowerCase())))
    }
    if (query) {
      res = res.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
    }
    return res
  }, [leads, selectedFinancerFilter, query])

  const qualifiedCount = leads.filter(l => l[6] === 'Qualified').length
  const followUpCount = leads.filter(l => l[6] === 'Follow-up').length
  const convertedCount = leads.filter(l => l[6] === 'Converted').length

  return (
    <>
      <div className="m-action-bar">
        <button
          type="button"
          className="m-action-btn primary"
          onClick={openAdd}
        >
          <Icon name="plus" size={16}/> Add Customer Lead
        </button>
      </div>

      <MStatsGrid
        stats={[
          { label: 'Total Leads', value: String(leads.length), sub: 'Live pipeline' },
          { label: 'Qualified Leads', value: String(qualifiedCount), sub: 'Ready to convert', tone: 'green' },
          { label: 'Converted to Loans', value: String(convertedCount), sub: 'Loans sanctioned', tone: 'blue' },
          { label: 'Follow-ups Due', value: String(followUpCount), sub: 'Needs callback', tone: 'red' }
        ]}
      />

      <div className="m-notice-box">
        <Icon name="bolt" size={16}/>
        <div>
          <strong>Chain Reaction Attribution:</strong> Leads link down the chain: <strong>Admin ➔ Financer ➔ Sub-Team</strong>. If a financer has no team, the lead attributes directly to that financer.
        </div>
      </div>

      {/* Financer Chain Filter Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
        <button
          type="button"
          onClick={() => setSelectedFinancerFilter('all')}
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            border: selectedFinancerFilter === 'all' ? '1.5px solid var(--accent)' : '1px solid #e2e8f0',
            background: selectedFinancerFilter === 'all' ? 'var(--accent)' : '#ffffff',
            color: selectedFinancerFilter === 'all' ? '#ffffff' : '#475569'
          }}
        >
          All Leads ({leads.length})
        </button>
        {financers.map(f => {
          const count = leads.filter(l => (l[8] && l[8] === f.name) || (l[7] && l[7].includes(f.name))).length
          const isActive = selectedFinancerFilter === f.name
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedFinancerFilter(isActive ? 'all' : f.name)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: isActive ? '1.5px solid #4f46e5' : '1px solid #e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1e40af' : '#475569'
              }}
            >
              💼 {f.name} ({count})
            </button>
          )
        })}
      </div>

      <MSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search customer, business, phone or chain..."
      />

      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="leads" size={16}/> Customer Leads Pipeline
          <span className="m-count-badge">{filtered.length}</span>
        </h4>
      </div>

      {filtered.length === 0 ? (
        <div className="m-empty-card">
          No customer leads found matching your search.
        </div>
      ) : (
        filtered.map((lead, idx) => {
          const isConverted = lead[6] === 'Converted'
          const attribution = lead[7] || 'Admin Direct'
          return (
            <div className="m-card" key={`${lead[0]}-${idx}`}>
              <div className="m-card-head">
                <div>
                  <div className="m-card-title">{lead[1]}</div>
                  <div className="m-card-subtitle">{lead[0]} · {lead[5] || 'Direct'}</div>
                </div>
                <Badge status={lead[6]}/>
              </div>

              {/* Chain Reaction Attribution Pill */}
              <div className="m-chain-pill">
                <span>🔗 Chain:</span> <strong>{attribution}</strong>
              </div>

              <div className="m-card-grid">
                <div className="m-grid-cell">
                  <span className="m-grid-label">Contact Person</span>
                  <span className="m-grid-value">{lead[2]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Phone</span>
                  <span className="m-grid-value">{lead[3]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Funding Required</span>
                  <span className="m-grid-value highlight">{lead[4]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Acquisition Source</span>
                  <span className="m-grid-value">{lead[5] || 'Referral'}</span>
                </div>
              </div>

              <div className="m-card-actions">
                {!isConverted ? (
                  <button
                    type="button"
                    className="m-touch-btn convert"
                    onClick={() => convert(lead[0], lead[1])}
                  >
                    <Icon name="bolt" size={14}/> Convert to Loan Proposal →
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px', fontWeight: 700, padding: '6px 0' }}>
                    <Icon name="checkCircle" size={16}/> Converted into Active Loan
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
    </>
  )
}

// -------------------------------------------------------------
// 4. FUNDING CALCULATOR ENGINE & LOANS
// -------------------------------------------------------------

export interface EmiItem {
  id: string
  due_date: string
  customer: string
  loan_id: string
  principal: number
  interest: number
  amount: number
  status: string
  paid_date?: string
  utr?: string
  payment_method?: string
  proof_file?: string
  installment_num?: number
  total_return?: number
  balance?: number
  cumulative_paid?: number
}

function cleanNumberInput(val: string): string {
  if (val === '') return ''
  let cleaned = val.replace(/[^0-9.]/g, '')
  if (cleaned.length > 1 && cleaned.startsWith('0') && !cleaned.startsWith('0.')) {
    cleaned = cleaned.replace(/^0+/, '')
    if (cleaned === '') cleaned = '0'
  }
  return cleaned
}

function formatLakh(amount: number): string {
  if (!amount || amount <= 0) return '₹0'
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '')
    return `₹${cr} Cr`
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2).replace(/\.00$/, '')
    return `₹${lk} Lakh`
  }
  return money(amount)
}

function formatFullDate(dateStr: string): string {
  if (!dateStr) return 'Not selected'
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} • ${days[d.getDay()]} (${daysShort[d.getDay()]})`
}

function FundingEngine({
  leads,
  preselectedLeadId,
  isModal,
  onSuccess,
  onCancel
}: {
  leads: string[][]
  preselectedLeadId?: string
  isModal?: boolean
  onSuccess: (msg: string) => void
  onCancel?: () => void
}) {
  const unconvertedLeads = useMemo(() => leads.filter(l => l[6] !== 'Converted'), [leads])
  const [selectedLeadId, setSelectedLeadId] = useState(preselectedLeadId || '')

  const [calcBusiness, setCalcBusiness] = useState('')
  const [calcCustomer, setCalcCustomer] = useState('')
  const [loanApproved, setLoanApproved] = useState('1000000')
  const [rateMultiplier, setRateMultiplier] = useState('130')
  const [tenureDays, setTenureDays] = useState('105')
  const [cycleDays, setCycleDays] = useState('15')
  const [pfPercent, setPfPercent] = useState('5')
  const [startDate, setStartDate] = useState('2026-11-02')
  const [advanceMode, setAdvanceMode] = useState<'None' | 'By Net In-Hand' | 'Full 1 EMI' | 'Half EMI' | 'By Advance' | 'By Days'>('By Net In-Hand')
  const [netInHandTarget, setNetInHandTarget] = useState('800000')
  const [advanceCustom, setAdvanceCustom] = useState('150000')
  const [advanceDays, setAdvanceDays] = useState('15')
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Populate lead details if preselected or changed
  useEffect(() => {
    if (selectedLeadId) {
      const found = leads.find(l => l[0] === selectedLeadId)
      if (found) {
        setCalcBusiness(found[1])
        setCalcCustomer(found[2])
        const rawAmt = found[4].replace(/[^0-9]/g, '')
        if (rawAmt) {
          setLoanApproved(rawAmt)
          const num = Number(rawAmt)
          if (num > 0) {
            setNetInHandTarget(String(Math.round(num * 0.8)))
          }
        }
      }
    }
  }, [selectedLeadId, leads])

  // Calculation Math matching Jain Financial Services Engine
  const principalNum = Math.max(0, Number(loanApproved) || 0)
  const multiplierNum = Math.max(100, Number(rateMultiplier) || 130)
  const daysNum = Math.max(1, Number(tenureDays) || 105)
  const freqNum = Math.max(1, Number(cycleDays) || 15)

  const totalReturn = Math.round(principalNum * (multiplierNum / 100))
  const baseEmisCount = Math.max(1, Math.round(daysNum / freqNum))
  const baseEmiAmount = Math.round(totalReturn / baseEmisCount)
  const pfAmount = Math.round(principalNum * (Number(pfPercent) / 100))

  let advanceAmount = 0
  let deductedEmis = 0
  let payableEmis = baseEmisCount

  if (advanceMode === 'None') {
    advanceAmount = 0
    deductedEmis = 0
    payableEmis = baseEmisCount
  } else if (advanceMode === 'By Net In-Hand') {
    const desiredNet = Number(netInHandTarget) || 0
    advanceAmount = Math.max(0, principalNum - pfAmount - desiredNet)
    deductedEmis = 1
    payableEmis = Math.max(1, baseEmisCount - 1)
  } else if (advanceMode === 'Full 1 EMI') {
    advanceAmount = baseEmiAmount
    deductedEmis = 1
    payableEmis = Math.max(1, baseEmisCount - 1)
  } else if (advanceMode === 'Half EMI') {
    advanceAmount = Math.round(baseEmiAmount * 0.5)
    deductedEmis = 0.5
    payableEmis = baseEmisCount
  } else if (advanceMode === 'By Advance') {
    advanceAmount = Math.max(0, Number(advanceCustom) || 0)
    deductedEmis = 1
    payableEmis = Math.max(1, baseEmisCount - 1)
  } else if (advanceMode === 'By Days') {
    advanceAmount = Math.round((totalReturn / daysNum) * (Number(advanceDays) || 15))
    deductedEmis = 1
    payableEmis = Math.max(1, baseEmisCount - 1)
  }

  const netInHand = Math.max(0, principalNum - pfAmount - advanceAmount)
  const remainingRepayment = totalReturn - advanceAmount
  const adjustedPerEmi = Math.round(remainingRepayment / payableEmis)

  // Full payable EMI schedule
  const schedule = useMemo(() => {
    const list = []
    let cumulative = 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const parts = (startDate || '2026-11-02').split('-')
    const baseDate = parts.length === 3 ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) : new Date()

    for (let i = 1; i <= payableEmis; i++) {
      const dueTime = new Date(baseDate.getTime() + (i * freqNum * 24 * 60 * 60 * 1000))
      const dd = String(dueTime.getDate()).padStart(2, '0')
      const dStr = `${dd} ${months[dueTime.getMonth()]} ${dueTime.getFullYear()} (${daysShort[dueTime.getDay()]})`
      cumulative += adjustedPerEmi
      const isLast = i === payableEmis
      const balance = isLast ? 0 : Math.max(0, remainingRepayment - cumulative)

      list.push({
        num: i,
        dueDate: dStr,
        amount: adjustedPerEmi,
        status: 'Scheduled',
        cumulativePaid: cumulative,
        balance
      })
    }
    return list
  }, [startDate, payableEmis, freqNum, adjustedPerEmi, remainingRepayment])

  const filteredSchedule = useMemo(() => {
    if (!scheduleSearch.trim()) return schedule
    const q = scheduleSearch.toLowerCase()
    return schedule.filter(s => `${s.num} ${s.dueDate} ${s.amount}`.toLowerCase().includes(q))
  }, [schedule, scheduleSearch])

  const setDateShortcut = (type: 'today' | 'tomorrow' | '1st' | '15th') => {
    const now = new Date()
    if (type === 'today') {
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      setStartDate(`${y}-${m}-${d}`)
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(now.getTime() + 86400000)
      const y = tomorrow.getFullYear()
      const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const d = String(tomorrow.getDate()).padStart(2, '0')
      setStartDate(`${y}-${m}-${d}`)
    } else if (type === '1st') {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const y = nextMonth.getFullYear()
      const m = String(nextMonth.getMonth() + 1).padStart(2, '0')
      setStartDate(`${y}-${m}-01`)
    } else if (type === '15th') {
      const target = now.getDate() < 15
        ? new Date(now.getFullYear(), now.getMonth(), 15)
        : new Date(now.getFullYear(), now.getMonth() + 1, 15)
      const y = target.getFullYear()
      const m = String(target.getMonth() + 1).padStart(2, '0')
      setStartDate(`${y}-${m}-15`)
    }
  }

  const handleReset = () => {
    setLoanApproved('1000000')
    setRateMultiplier('130')
    setTenureDays('105')
    setCycleDays('15')
    setPfPercent('5')
    setStartDate('2026-11-02')
    setAdvanceMode('By Net In-Hand')
    setNetInHandTarget('800000')
    setAdvanceCustom('150000')
    setAdvanceDays('15')
    setScheduleSearch('')
  }

  const copyFundingSummary = () => {
    const txt = `GEET ENTERPRISE - FUNDING STATEMENT
Borrower: ${calcBusiness || 'Direct Proposal'} (${calcCustomer || 'Client'})
Sanction Amount: ${money(principalNum)} (${formatLakh(principalNum)})
Total Return: ${money(totalReturn)} @ Rate ${multiplierNum}%
Processing Fee: ${money(pfAmount)} (${pfPercent}%)
Advance Deducted: ${money(advanceAmount)}
Net In-Hand Disbursement: ${money(netInHand)}
Repayment: ${payableEmis} EMIs @ ${money(adjustedPerEmi)} per ${freqNum} days
Total Repayment Balance: ${money(remainingRepayment)}`
    navigator.clipboard.writeText(txt)
    alert('Funding Statement summary copied to clipboard!')
  }

  const submitFundingPlan = async (e: FormEvent) => {
    e.preventDefault()
    if (!calcBusiness.trim()) {
      alert('Please enter borrower business name')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId || undefined,
          business: calcBusiness.trim(),
          customer: calcCustomer.trim() || calcBusiness.trim(),
          principal: principalNum,
          rateMultiplier: multiplierNum,
          totalReturn,
          tenureDays: daysNum,
          frequencyDays: freqNum,
          processingFee: pfAmount,
          advanceDeducted: advanceAmount,
          netInHand,
          payableEmis,
          emi: adjustedPerEmi,
          startDate,
          emiSchedule: schedule
        })
      })
      const data = await res.json()
      if (data.success) {
        onSuccess(
          selectedLeadId
            ? `Lead "${calcBusiness}" successfully converted to Loan proposal with ${payableEmis} scheduled EMIs!`
            : `Loan proposal created for "${calcBusiness}" with ${payableEmis} scheduled EMIs!`
        )
      } else {
        alert(data.error || 'Failed to sanction loan')
      }
    } catch {
      alert('Failed to connect to backend server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="funding-engine">
      <div className="fe-grid">
        {/* Left Inputs Column */}
        <div className="fe-left">
          <div className="fe-header">
            <div>
              <div className="fe-title">Funding Calculator</div>
              <div className="fe-subtitle">Geet Enterprise Calculation Engine</div>
            </div>
            <button type="button" className="fe-pill" onClick={handleReset} style={{ cursor: 'pointer' }}>
              ↺ Reset
            </button>
          </div>

          <div>
            <div className="fe-label">
              <span>Select Lead to Convert into Loan (Optional)</span>
              {selectedLeadId && <span className="fe-pill green">Lead Linked</span>}
            </div>
            <select
              value={selectedLeadId}
              onChange={e => {
                const id = e.target.value
                setSelectedLeadId(id)
                const found = leads.find(l => l[0] === id)
                if (found) {
                  setCalcBusiness(found[1])
                  setCalcCustomer(found[2])
                  const raw = found[4].replace(/[^0-9]/g, '')
                  if (raw) {
                    setLoanApproved(raw)
                    const n = Number(raw)
                    if (n > 0) setNetInHandTarget(String(Math.round(n * 0.8)))
                  }
                }
              }}
            >
              <option value="">-- Direct Manual Entry (Or choose Lead to Convert) --</option>
              {unconvertedLeads.map(l => (
                <option key={l[0]} value={l[0]}>
                  Convert: {l[1]} ({l[4]} · Contact: {l[2]})
                </option>
              ))}
            </select>
          </div>

          <div className="fe-row-2col">
            <div>
              <div className="fe-label">Borrower Business</div>
              <input
                type="text"
                value={calcBusiness}
                onChange={e => setCalcBusiness(e.target.value)}
                placeholder="e.g. Bansal Steel Works"
                required
              />
            </div>
            <div>
              <div className="fe-label">Customer Contact</div>
              <input
                type="text"
                value={calcCustomer}
                onChange={e => setCalcCustomer(e.target.value)}
                placeholder="e.g. Sanjay Bansal"
              />
            </div>
          </div>

          <div>
            <div className="fe-label">
              <span>Loan Amount Approved (₹)</span>
              <span className="fe-pill">{formatLakh(principalNum)}</span>
            </div>
            <input
              type="number"
              value={loanApproved}
              onWheel={e => (e.target as HTMLElement).blur()}
              onChange={e => setLoanApproved(cleanNumberInput(e.target.value))}
              placeholder="1000000"
              required
            />
          </div>

          <div>
            <div className="fe-label">
              <span>Rate</span>
              <span className="fe-pill">Multiplier: {multiplierNum}% Total Return</span>
            </div>
            <input
              type="number"
              value={rateMultiplier}
              onWheel={e => (e.target as HTMLElement).blur()}
              onChange={e => setRateMultiplier(cleanNumberInput(e.target.value))}
              placeholder="130"
              required
            />
            <div className="fe-helper">Rate {multiplierNum} → {multiplierNum}% Total Return</div>
          </div>

          <div className="fe-row-2col">
            <div>
              <div className="fe-label">Tenure (Days)</div>
              <input
                type="number"
                value={tenureDays}
                onWheel={e => (e.target as HTMLElement).blur()}
                onChange={e => setTenureDays(cleanNumberInput(e.target.value))}
                placeholder="105"
                required
              />
            </div>
            <div>
              <div className="fe-label">
                <span>EMI Frequency (Days)</span>
                <span className="fe-pill">= {baseEmisCount} Base EMIs</span>
              </div>
              <input
                type="number"
                value={cycleDays}
                onWheel={e => (e.target as HTMLElement).blur()}
                onChange={e => setCycleDays(cleanNumberInput(e.target.value))}
                placeholder="15"
                required
              />
              <div className="fe-helper">e.g. 15 for 15-day cycle ({daysNum} days ÷ {freqNum} = {baseEmisCount} Base EMIs)</div>
            </div>
          </div>

          <div>
            <div className="fe-label">
              <span>Processing Fee (PF)</span>
              <span className="fe-pill">= {money(pfAmount)}</span>
            </div>
            <select value={pfPercent} onChange={e => setPfPercent(e.target.value)}>
              <option value="5">5% Processing Fee</option>
              <option value="2">2% Processing Fee</option>
              <option value="3">3% Processing Fee</option>
              <option value="0">No Processing Fee (0%)</option>
            </select>
          </div>

          <div>
            <div className="fe-label">
              <span>Start Date (Optional)</span>
              <button
                type="button"
                onClick={() => setStartDate('')}
                style={{ background: 'none', border: 0, color: '#f87171', fontSize: '10px', cursor: 'pointer' }}
              >
                ✕ Clear
              </button>
            </div>
            <div className="fe-date-box">
              <div>
                <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Selected Date:</span>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>{formatFullDate(startDate)}</strong>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '135px', height: '32px', fontSize: '12px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Shortcuts:</span>
              {(['today', 'tomorrow', '1st', '15th'] as const).map(sc => (
                <button
                  key={sc}
                  type="button"
                  className="fe-pill"
                  style={{ cursor: 'pointer', textTransform: 'capitalize' }}
                  onClick={() => setDateShortcut(sc)}
                >
                  {sc === 'today' ? '⚡ Today' : sc}
                </button>
              ))}
            </div>
            <div className="fe-helper">Choose the date for calendar dates (today, tomorrow, or from calendar), or leave blank</div>
          </div>

          <div>
            <div className="fe-label">
              <span>Advance EMI / Net Hand Deduction</span>
              <span className="fe-pill">{deductedEmis} EMI Removed → {payableEmis} EMIs to Pay</span>
            </div>
            <div className="fe-radio-group">
              {(['None', 'By Net In-Hand', 'Full 1 EMI', 'Half EMI', 'By Advance', 'By Days'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  className={`fe-radio-btn ${advanceMode === mode ? 'active' : ''}`}
                  onClick={() => setAdvanceMode(mode)}
                >
                  {mode === 'By Net In-Hand' ? 'By Net In-Hand (₹)' : mode === 'Half EMI' ? 'Half EMI (0.5)' : mode === 'By Advance' ? 'By Advance (₹)' : mode}
                </button>
              ))}
            </div>

            {advanceMode === 'By Net In-Hand' && (
              <div style={{ marginTop: '10px' }}>
                <div className="fe-label">
                  <span>Net In-Hand Amount to Give Client (₹)</span>
                  <span className="fe-pill">{formatLakh(Number(netInHandTarget) || 0)}</span>
                </div>
                <input
                  type="number"
                  value={netInHandTarget}
                  onWheel={e => (e.target as HTMLElement).blur()}
                  onChange={e => setNetInHandTarget(cleanNumberInput(e.target.value))}
                  placeholder="800000"
                />
                <div style={{ marginTop: '8px', background: '#f8faf8', border: '1px solid var(--line)', borderRadius: '4px', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--ink)' }}>
                    <span>Advance Deducted:</span>
                    <strong style={{ color: 'var(--green-dark)', fontWeight: 700 }}>{money(advanceAmount)}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                    Formula: Loan ({money(principalNum)}) − PF ({money(pfAmount)}) − Net Hand ({money(Number(netInHandTarget) || 0)})
                  </div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '5px' }}>
                    Repayment: 1 EMI removed → {payableEmis} EMIs @ {money(adjustedPerEmi)}/EMI
                  </div>
                </div>
              </div>
            )}

            {advanceMode === 'By Advance' && (
              <div style={{ marginTop: '10px' }}>
                <div className="fe-label">Advance Deduction Amount (₹)</div>
                <input
                  type="number"
                  value={advanceCustom}
                  onWheel={e => (e.target as HTMLElement).blur()}
                  onChange={e => setAdvanceCustom(cleanNumberInput(e.target.value))}
                  placeholder="150000"
                />
              </div>
            )}

            {advanceMode === 'By Days' && (
              <div style={{ marginTop: '10px' }}>
                <div className="fe-label">Advance Deduction Days</div>
                <input
                  type="number"
                  value={advanceDays}
                  onWheel={e => (e.target as HTMLElement).blur()}
                  onChange={e => setAdvanceDays(cleanNumberInput(e.target.value))}
                  placeholder="15"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Output & Schedule Column */}
        <div className="fe-right">
          <div className="fe-statement-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--green-soft)', color: 'var(--green-dark)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '12px' }}>
                GE
              </div>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>Funding Statement</strong>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>Geet Enterprise · Sanction Overview</span>
              </div>
            </div>
            <div className="fe-actions-strip">
              <button type="button" className="fe-pill green" onClick={() => window.print()} style={{ cursor: 'pointer' }}>
                🖨 PDF Download
              </button>
              <button type="button" className="fe-pill" onClick={() => window.print()} style={{ cursor: 'pointer' }}>
                👁 PDF Preview
              </button>
              <button type="button" className="fe-pill blue" onClick={copyFundingSummary} style={{ cursor: 'pointer' }}>
                🔗 Share PDF
              </button>
              <button type="button" className="fe-pill" onClick={() => alert('Auto-reminders enabled for all installments.')} style={{ cursor: 'pointer' }}>
                🔔 Auto-Reminder
              </button>
              <button type="button" className="fe-pill green" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Funding Statement for ${calcBusiness}: Loan Sanction: ${money(principalNum)}, Total Return: ${money(totalReturn)}, Net In-Hand: ${money(netInHand)}, ${payableEmis} EMIs of ${money(adjustedPerEmi)}`)}`, '_blank')} style={{ cursor: 'pointer' }}>
                💬 WhatsApp
              </button>
              <button type="button" className="fe-pill" onClick={copyFundingSummary} style={{ cursor: 'pointer' }}>
                📋 Copy
              </button>
            </div>
          </div>

          <div className="fe-hero-cards">
            <div className="fe-card">
              <div className="fe-card-head">
                <span>LOAN AMOUNT (SANCTION)</span>
                <span className="fe-pill">{formatLakh(principalNum)}</span>
              </div>
              <div className="fe-card-value">{money(principalNum)}</div>
            </div>
            <div className="fe-card">
              <div className="fe-card-head">
                <span>TOTAL RETURN AMOUNT</span>
                <span className="fe-pill green">Rate {multiplierNum}%</span>
              </div>
              <div className="fe-card-value" style={{ color: 'var(--green-dark)' }}>{money(totalReturn)}</div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>{formatLakh(totalReturn)}</div>
            </div>
          </div>

          <div className="fe-stat-grid">
            <div className="fe-stat-tile">
              <span>PF ({pfPercent}%)</span>
              <strong>{money(pfAmount)}</strong>
            </div>
            <div className="fe-stat-tile">
              <span>ADVANCE ({advanceMode === 'By Net In-Hand' ? 'NET HAND' : 'DEDUCT'})</span>
              <strong>{money(advanceAmount)}</strong>
            </div>
            <div className="fe-stat-tile">
              <span>PAYABLE EMIS</span>
              <strong>{payableEmis} (@ {freqNum}D)</strong>
            </div>
            <div className="fe-stat-tile">
              <span>PER INSTALMENT</span>
              <strong style={{ color: 'var(--green-dark)' }}>{money(adjustedPerEmi)}</strong>
            </div>
          </div>

          <div className="fe-split-bar">
            <div>
              <span style={{ fontSize: '10px', color: 'var(--muted)', display: 'block' }}>Advance Deduction & Repayment Split</span>
              <div className="fe-split-stats">
                <span>Active EMIs: <strong>{payableEmis} Instalments ({deductedEmis} deducted)</strong></span>
                <span>Adjusted Per EMI: <strong style={{ color: 'var(--green-dark)' }}>{money(adjustedPerEmi)}</strong></span>
                <span>Remaining Repayment: <strong>{money(remainingRepayment)}</strong></span>
              </div>
            </div>
            <span className="fe-pill">
              Mode: {advanceMode === 'By Net In-Hand' ? `Net Hand: ${money(Number(netInHandTarget) || 0)}` : advanceMode}
            </span>
          </div>

          <div className="fe-net-card">
            <div>
              <h3>NET IN-HAND DISBURSEMENT AMOUNT</h3>
              <div className="amt">{money(netInHand)}</div>
            </div>
            <div className="formula">
              Formula: Loan − PF − Advance<br/>
              {money(principalNum)} − {money(pfAmount)} − {money(advanceAmount)}
            </div>
          </div>

          <div>
            <div className="fe-schedule-head">
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>EMI Schedule ({schedule.length} Payable Instalments)</strong>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--muted)' }}>
                  Starting {startDate || 'Today'} • Every {freqNum} Days • ({deductedEmis} Advance EMI Deducted Upfront)
                </span>
              </div>
              <input
                type="text"
                value={scheduleSearch}
                onChange={e => setScheduleSearch(e.target.value)}
                placeholder="🔍 Search EMI or Date..."
                style={{ width: '170px', height: '28px', fontSize: '10px' }}
              />
            </div>

            <div className="fe-schedule-scroll">
              <table className="fe-schedule-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Due Date</th>
                    <th>Amount (₹)</th>
                    <th>Status</th>
                    <th>Cumulative Paid</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedule.map(item => (
                    <tr key={item.num}>
                      <td>{item.num}</td>
                      <td>{item.dueDate}</td>
                      <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{money(item.amount)}</td>
                      <td><span className="fe-badge-scheduled">Scheduled</span></td>
                      <td>{money(item.cumulativePaid)}</td>
                      <td>{money(item.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginTop: '6px', padding: '0 4px', flexWrap: 'wrap', gap: '4px' }}>
              <span>Showing {filteredSchedule.length} of {schedule.length} instalments</span>
              <span style={{ color: 'var(--green-dark)', fontWeight: 700 }}>Total Repayment: {money(remainingRepayment)}</span>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--line)', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--ink)', fontWeight: 700, marginBottom: '8px' }}>
              Financial Statements and Distributions
            </div>
            <div className="fe-distribution-grid">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                  <span>Disbursement Ratio</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{money(principalNum)} Total</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <span style={{ width: `${(netInHand / (principalNum || 1)) * 100}%`, background: '#10b981' }} title="Net Hand"/>
                  <span style={{ width: `${(pfAmount / (principalNum || 1)) * 100}%`, background: '#f59e0b' }} title="PF"/>
                  <span style={{ width: `${(advanceAmount / (principalNum || 1)) * 100}%`, background: '#6366f1' }} title="Advance"/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--muted)', marginTop: '3px' }}>
                  <span>Net Hand: {money(netInHand)}</span>
                  <span>Advance: {money(advanceAmount)}</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                  <span>Repayment Composition</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{money(totalReturn)}</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                  <span style={{ width: `${(principalNum / (totalReturn || 1)) * 100}%`, background: '#3b82f6' }} title="Principal"/>
                  <span style={{ width: `${((totalReturn - principalNum) / (totalReturn || 1)) * 100}%`, background: 'var(--green)' }} title="Rate Markup"/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--muted)', marginTop: '3px' }}>
                  <span>Principal: {money(principalNum)}</span>
                  <span>Markup: {money(totalReturn - principalNum)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fe-actions-bar">
            {onCancel && (
              <Button variant="secondary" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <button
              type="button"
              className="fe-submit-btn"
              onClick={submitFundingPlan}
              disabled={submitting}
            >
              {submitting
                ? 'Processing Schedule...'
                : selectedLeadId
                  ? `Convert Lead "${calcBusiness || 'Borrower'}" & Create Loan (${payableEmis} EMIs)`
                  : `Sanction Loan & Create All ${payableEmis} EMIs`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loans({
  loans,
  leads,
  openDisburse,
  openCreate,
  openConvertLead,
  onSuccessCalc
}: {
  loans: string[][]
  leads: string[][]
  openDisburse: (loanId: string) => void
  openCreate: () => void
  openConvertLead: (leadId?: string) => void
  onSuccessCalc: (msg: string) => void
}) {
  const [query, setQuery] = useState('')
  const [showCalculator, setShowCalculator] = useState(false)
  const unconvertedLeads = useMemo(() => leads.filter(l => l[6] !== 'Converted'), [leads])

  const filteredLoans = useMemo(() => {
    if (!query) return loans
    return loans.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [loans, query])

  const totalPortfolio = loans.reduce((acc, l) => acc + (Number(l[3].replace(/[^0-9]/g, '')) || 0), 0) || 4500000
  const activeCount = loans.filter(l => l[7] === 'Active').length
  const disbursalDueCount = loans.filter(l => l[7] === 'Disbursal due').length

  return (
    <>
      {/* Mobile Top Action Bar */}
      <div className="m-action-bar">
        <button
          type="button"
          className="m-action-btn primary"
          onClick={() => openConvertLead()}
        >
          <Icon name="bolt" size={16}/> Convert Lead
        </button>
        <button
          type="button"
          className="m-action-btn secondary"
          onClick={openCreate}
        >
          <Icon name="plus" size={16}/> Direct Loan
        </button>
        <button
          type="button"
          className="m-action-btn secondary"
          onClick={() => setShowCalculator(!showCalculator)}
        >
          <Icon name="calculator" size={16}/> Calc
        </button>
      </div>

      {/* 2x2 Mobile Stats Grid */}
      <MStatsGrid
        stats={[
          { label: 'Total Portfolio', value: money(totalPortfolio), sub: `${loans.length} total loans` },
          { label: 'Active Performing', value: String(activeCount), sub: 'Performing loans', tone: 'green' },
          { label: 'Disbursals Due', value: String(disbursalDueCount), sub: 'Fund release needed', tone: 'red' },
          { label: 'Ready to Convert', value: String(unconvertedLeads.length), sub: 'In acquisition pipeline', tone: 'blue' }
        ]}
      />

      {/* Collapsible Funding Calculator Engine */}
      {showCalculator && (
        <div className="m-collapse-box" style={{ marginBottom: '16px' }}>
          <div className="m-collapse-head" onClick={() => setShowCalculator(false)}>
            <div className="m-collapse-title">
              <Icon name="calculator" size={16}/> Funding Engine Calculator
            </div>
            <Icon name="close" size={16}/>
          </div>
          <div style={{ padding: '4px' }}>
            <FundingEngine leads={leads} onSuccess={msg => { onSuccessCalc(msg); setShowCalculator(false) }}/>
          </div>
        </div>
      )}

      {/* Section 1: Convert Leads into Loans */}
      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="bolt" size={16}/> Leads Ready to Convert
          <span className="m-count-badge">{unconvertedLeads.length}</span>
        </h4>
        {unconvertedLeads.length > 0 && (
          <button
            type="button"
            className="mobile-activity-link"
            onClick={() => openConvertLead()}
          >
            Modal View
          </button>
        )}
      </div>

      {unconvertedLeads.length === 0 ? (
        <div className="m-empty-card">
          <Icon name="checkCircle" size={24}/>
          <div style={{ marginTop: '6px', fontWeight: 600 }}>All leads have been converted into loans!</div>
          <div style={{ fontSize: '11px', marginTop: '2px' }}>Add new customer leads in the Leads tab.</div>
        </div>
      ) : (
        unconvertedLeads.map(lead => (
          <div className="m-card" key={lead[0]}>
            <div className="m-card-head">
              <div>
                <div className="m-card-title">{lead[1]}</div>
                <div className="m-card-subtitle">{lead[0]} · {lead[5] || 'Referral'}</div>
              </div>
              <Badge status={lead[6]}/>
            </div>
            <div className="m-card-grid">
              <div className="m-grid-cell">
                <span className="m-grid-label">Contact Person</span>
                <span className="m-grid-value">{lead[2]}</span>
              </div>
              <div className="m-grid-cell">
                <span className="m-grid-label">Phone</span>
                <span className="m-grid-value">{lead[3]}</span>
              </div>
              <div className="m-grid-cell">
                <span className="m-grid-label">Requirement</span>
                <span className="m-grid-value highlight">{lead[4]}</span>
              </div>
              <div className="m-grid-cell">
                <span className="m-grid-label">Status</span>
                <span className="m-grid-value success">{lead[6]}</span>
              </div>
            </div>
            <div className="m-card-actions">
              <button
                type="button"
                className="m-touch-btn convert"
                onClick={() => openConvertLead(lead[0])}
              >
                <Icon name="bolt" size={14}/> Convert to Loan Proposal →
              </button>
            </div>
          </div>
        ))
      )}

      {/* Section 2: Active Loans Portfolio */}
      <div className="m-section-header" style={{ marginTop: '20px' }}>
        <h4 className="m-section-title">
          <Icon name="loans" size={16}/> Customer Loans Portfolio
          <span className="m-count-badge">{filteredLoans.length}</span>
        </h4>
      </div>

      <MSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search loan ID, business or customer..."
      />

      {filteredLoans.length === 0 ? (
        <div className="m-empty-card">
          No loans match your search.
        </div>
      ) : (
        filteredLoans.map((loan, idx) => {
          const isDisbursalDue = loan[7] === 'Disbursal due'
          return (
            <div className="m-card" key={`${loan[0]}-${idx}`}>
              <div className="m-card-head">
                <div>
                  <div className="m-card-title">{loan[1]}</div>
                  <div className="m-card-subtitle">{loan[0]} · Customer: {loan[2]}</div>
                </div>
                <Badge status={loan[7]}/>
              </div>
              <div className="m-card-grid">
                <div className="m-grid-cell">
                  <span className="m-grid-label">Principal</span>
                  <span className="m-grid-value highlight">{loan[3]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Installment / EMI</span>
                  <span className="m-grid-value highlight" style={{ color: 'var(--green)' }}>{loan[6]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">ROI Rate</span>
                  <span className="m-grid-value">{loan[4]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Tenure</span>
                  <span className="m-grid-value">{loan[5]}</span>
                </div>
              </div>
              <div className="m-card-actions">
                {isDisbursalDue ? (
                  <button
                    type="button"
                    className="m-touch-btn disburse"
                    onClick={() => openDisburse(loan[0])}
                  >
                    <Icon name="transfer" size={14}/> Disburse Loan Funds Now →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="m-touch-btn secondary"
                    onClick={() => alert(`Loan details: ${loan[0]} · Business: ${loan[1]} · Status: ${loan[7]}`)}
                  >
                    <Icon name="fileText" size={14}/> View Loan Details
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </>
  )
}

// -------------------------------------------------------------
// 5. SCHEDULED EMIS (WITH BANK UTR PAYMENT SUBMISSION)
// -------------------------------------------------------------

function ScheduledEmis({
  emis,
  onOpenPay
}: {
  emis: EmiItem[]
  onOpenPay: (emi: EmiItem) => void
}) {
  const [filterTab, setFilterTab] = useState<'All' | 'Paid' | 'Upcoming' | 'Overdue'>('All')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => ({
    all: emis.length,
    paid: emis.filter(e => e.status === 'Paid').length,
    upcoming: emis.filter(e => e.status === 'Upcoming' || e.status === 'Scheduled').length,
    overdue: emis.filter(e => e.status === 'Overdue').length,
  }), [emis])

  const filtered = useMemo(() => {
    return emis.filter(e => {
      const isPaid = e.status === 'Paid'
      const isUpcoming = e.status === 'Upcoming' || e.status === 'Scheduled'
      const isOverdue = e.status === 'Overdue'

      let matchesTab = true
      if (filterTab === 'Paid') matchesTab = isPaid
      else if (filterTab === 'Upcoming') matchesTab = isUpcoming
      else if (filterTab === 'Overdue') matchesTab = isOverdue

      const matchesQuery = !query || `${e.id} ${e.customer} ${e.loan_id} ${e.due_date} ${e.utr || ''}`.toLowerCase().includes(query.toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [emis, filterTab, query])

  const totalDue = useMemo(() => emis.reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [emis])
  const totalPaid = useMemo(() => emis.filter(e => e.status === 'Paid').reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [emis])
  const totalUpcoming = useMemo(() => emis.filter(e => e.status === 'Upcoming' || e.status === 'Scheduled').reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [emis])
  const totalOverdue = useMemo(() => emis.filter(e => e.status === 'Overdue').reduce((acc, e) => acc + (Number(e.amount) || 0), 0), [emis])

  return (
    <>
      {/* 2x2 Mobile Stats Grid */}
      <MStatsGrid
        stats={[
          { label: 'Due This Period', value: money(totalDue || 842600), sub: `${emis.length} installments` },
          { label: 'Collected to Pool', value: money(totalPaid), sub: `${counts.paid} installments collected`, tone: 'green' },
          { label: 'Upcoming Collections', value: money(totalUpcoming), sub: `${counts.upcoming} pending`, tone: 'blue' },
          { label: 'Overdue Accounts', value: money(totalOverdue), sub: `${counts.overdue} overdue`, tone: 'red' }
        ]}
      />

      {/* Filter Pills */}
      <div className="m-pills-row">
        {[
          { id: 'All', label: `All · ${counts.all}` },
          { id: 'Paid', label: `Paid · ${counts.paid}` },
          { id: 'Upcoming', label: `Upcoming · ${counts.upcoming}` },
          { id: 'Overdue', label: `Overdue · ${counts.overdue}` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`m-pill-btn ${filterTab === tab.id ? 'active' : ''}`}
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <MSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search customer, loan ID or UTR..."
      />

      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="calendar" size={16}/> EMI Repayment Schedule
          <span className="m-count-badge">{filtered.length}</span>
        </h4>
      </div>

      {filtered.length === 0 ? (
        <div className="m-empty-card">
          No installments found matching this filter.
        </div>
      ) : (
        filtered.map(item => {
          const isPaid = item.status === 'Paid'
          return (
            <div className="m-card" key={item.id}>
              <div className="m-card-head">
                <div>
                  <div className="m-card-title">Instalment #{item.installment_num || 1}</div>
                  <div className="m-card-subtitle">{item.customer} · Loan: {item.loan_id}</div>
                </div>
                <Badge status={item.status}/>
              </div>
              <div className="m-card-grid">
                <div className="m-grid-cell">
                  <span className="m-grid-label">Due Date</span>
                  <span className="m-grid-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="calendar" size={13}/> {item.due_date}
                  </span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">EMI Amount</span>
                  <span className="m-grid-value highlight" style={{ color: '#2563eb' }}>{money(item.amount)}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Cumulative Paid</span>
                  <span className="m-grid-value">{money(item.cumulative_paid || item.amount)}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Remaining Balance</span>
                  <span className="m-grid-value">{money(item.balance || 0)}</span>
                </div>
              </div>
              <div className="m-card-actions">
                {isPaid ? (
                  <div style={{ width: '100%', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '8px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800 }}>✓ PAID</span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{item.paid_date}</span>
                    </div>
                    {item.utr && (
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#15803d', fontWeight: 700, marginTop: '2px' }}>
                        Bank UTR: {item.utr}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="m-touch-btn pay"
                    onClick={() => onOpenPay(item)}
                  >
                    <Icon name="payments" size={14}/> Submit Bank UTR (Mark Paid) →
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </>
  )
}

// -------------------------------------------------------------
// 6. EXPENSES (DIRECT DEBIT FROM CENTRALIZED BALANCE)
// -------------------------------------------------------------

function Expenses({
  expenses,
  availableBalance,
  openAdd,
  onApprove
}: {
  expenses: string[][]
  availableBalance: number
  openAdd: () => void
  onApprove: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query) return expenses
    return expenses.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [expenses, query])

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => {
      const raw = e[4].replace(/[^0-9]/g, '')
      return sum + (Number(raw) || 0)
    }, 0)
  }, [expenses])

  return (
    <>
      <div className="m-action-bar">
        <button
          type="button"
          className="m-action-btn primary"
          onClick={openAdd}
        >
          <Icon name="plus" size={16}/> Add Expense
        </button>
      </div>

      <MStatsGrid
        stats={[
          { label: 'Total Operating Expenses', value: money(totalSpent), sub: 'Debited from pool', tone: 'red' },
          { label: 'Central Debits', value: money(totalSpent), sub: 'Master wallet', tone: 'blue' },
          { label: 'Available Balance', value: money(availableBalance), sub: 'Remaining funds', tone: 'green' },
          { label: 'Monthly Budget', value: '₹2,00,000', sub: `${Math.round((totalSpent / 200000) * 100)}% utilized` }
        ]}
      />

      <div className="m-notice-box">
        <Icon name="checkCircle" size={16}/>
        <div>
          <strong>Direct Central Balance Debit:</strong> All operating expenses debit directly from the Master Liquid Pool. No individual user wallets are used.
        </div>
      </div>

      <MSearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search expenses..."
      />

      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="expense" size={16}/> Operating Expenses
          <span className="m-count-badge">{filtered.length}</span>
        </h4>
      </div>

      {filtered.length === 0 ? (
        <div className="m-empty-card">
          No expenses recorded.
        </div>
      ) : (
        filtered.map((exp, idx) => {
          const isPending = exp[6] === 'Pending'
          return (
            <div className="m-card" key={`${exp[0]}-${idx}`}>
              <div className="m-card-head">
                <div>
                  <div className="m-card-title">{exp[2]}</div>
                  <div className="m-card-subtitle">{exp[0]} · {exp[1]} · {exp[3]}</div>
                </div>
                <Badge status={exp[6]}/>
              </div>
              <div className="m-card-grid">
                <div className="m-grid-cell">
                  <span className="m-grid-label">Amount Debited</span>
                  <span className="m-grid-value highlight danger">−{exp[4]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Category</span>
                  <span className="m-grid-value">{exp[3]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Submitted By</span>
                  <span className="m-grid-value">{exp[5]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Fund Source</span>
                  <span className="m-grid-value">Central Balance</span>
                </div>
              </div>
              <div className="m-card-actions">
                {isPending ? (
                  <button
                    type="button"
                    className="m-touch-btn disburse"
                    onClick={() => onApprove(exp[0])}
                  >
                    <Icon name="check" size={14}/> Approve & Debit Pool
                  </button>
                ) : (
                  <button
                    type="button"
                    className="m-touch-btn secondary"
                    onClick={() => alert(`Receipt verified in server/uploads for ${exp[0]}`)}
                  >
                    <Icon name="receipt" size={14}/> View Receipt
                  </button>
                )}
              </div>
            </div>
          )
        })
      )}
    </>
  )
}

// -------------------------------------------------------------
// 7. PROFIT & LOSS (CAPITAL-BASED PARTNER DISTRIBUTION)
// -------------------------------------------------------------

function ProfitLoss({
  pnl,
  openAddCapital
}: {
  pnl: PnlSummary
  openAddCapital: () => void
}) {
  const [period, setPeriod] = useState('FY 2024–25 (Consolidated)')

  return (
    <>
      <div className="m-action-bar">
        <button
          type="button"
          className="m-action-btn primary"
          onClick={openAddCapital}
        >
          <Icon name="plus" size={16}/> Add Capital
        </button>
        <button
          type="button"
          className="m-action-btn secondary"
          onClick={() => window.print()}
        >
          <Icon name="download" size={16}/> Export
        </button>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <select
          className="period-select"
          style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 700, fontSize: '13px' }}
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option>FY 2024–25 (Consolidated)</option>
          <option>Q4 Current Quarter</option>
          <option>This Month</option>
        </select>
      </div>

      <MStatsGrid
        stats={[
          { label: 'Total Capital Invested', value: money(pnl.totalCapitalInvested), sub: 'Combined partner pool' },
          { label: 'Gross Revenue', value: money(pnl.grossRevenue), sub: '+14.2% interest & fees', tone: 'green' },
          { label: 'Operating Expenses', value: money(pnl.totalExpenses), sub: 'Central pool debits', tone: 'red' },
          { label: 'Net Profit', value: money(pnl.netProfit), sub: `${pnl.profitMargin}% enterprise margin`, tone: 'green' }
        ]}
      />

      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="chart" size={16}/> Partner Equity & P&L Distribution
          <span className="m-count-badge">{pnl.distribution.length}</span>
        </h4>
      </div>

      <div className="m-notice-box" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#475569' }}>
        <Icon name="calculator" size={16}/>
        <div>
          <strong>Dynamic Pro-Rata Formula:</strong> Partner Share % = (Partner Capital ÷ Total Capital) × 100. Distributed Net Profit = <strong>{money(pnl.netProfit)}</strong>
        </div>
      </div>

      {pnl.distribution.map(p => (
        <div className="m-partner-card" key={p.id}>
          <div className="m-partner-head">
            <div className="m-partner-avatar">{p.name.split(' ').map(x => x[0]).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{p.role}</div>
            </div>
            <Badge status={p.status}/>
          </div>
          <div className="m-card-grid">
            <div className="m-grid-cell">
              <span className="m-grid-label">Capital Invested</span>
              <span className="m-grid-value highlight">{money(p.capitalInvested)}</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Equity Share</span>
              <span className="m-grid-value highlight" style={{ color: 'var(--green)' }}>{p.sharePct}%</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Gross Earnings</span>
              <span className="m-grid-value success">+{money(p.grossShare)}</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Expense Share</span>
              <span className="m-grid-value danger">−{money(p.expenseShare)}</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Net Profit</span>
              <span className="m-grid-value highlight success">+{money(p.netProfitShare)}</span>
            </div>
            <div className="m-grid-cell">
              <span className="m-grid-label">Annual ROI</span>
              <span className="m-grid-value success">{p.roiPct}%</span>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

// -------------------------------------------------------------
// 8. TRANSACTIONS (CENTRAL FINANCIAL LEDGER)
// -------------------------------------------------------------

function Transactions({ transactions }: { transactions: string[][] }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = useMemo(() => {
    if (!query) return transactions
    return transactions.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [transactions, query])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  const exportCsv = () => {
    const data = ['Reference,Date,Description,Party / Source,Type,Amount,Status', ...filtered.map(r => r.join(','))].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
    link.download = 'geet-enterprise-ledger.csv'
    link.click()
  }

  return (
    <>
      {/* Mobile Inflow / Outflow summary */}
      <div className="m-ledger-banner">
        <div className="m-ledger-box">
          <span>TOTAL CREDITS</span>
          <strong style={{ color: '#16a34a' }}>+₹18.42L</strong>
          <small style={{ fontSize: '9px', color: '#94a3b8' }}>EMIs & Capital</small>
        </div>
        <div className="m-ledger-box">
          <span>TOTAL DEBITS</span>
          <strong style={{ color: '#ef4444' }}>-₹14.86L</strong>
          <small style={{ fontSize: '9px', color: '#94a3b8' }}>Disbursals</small>
        </div>
        <div className="m-ledger-box">
          <span>NET LIQUIDITY</span>
          <strong style={{ color: '#2563eb' }}>+₹3.56L</strong>
          <small style={{ fontSize: '9px', color: '#94a3b8' }}>Surplus</small>
        </div>
      </div>

      <div className="m-action-bar">
        <button
          type="button"
          className="m-action-btn secondary"
          onClick={exportCsv}
        >
          <Icon name="download" size={16}/> Export Ledger CSV
        </button>
      </div>

      <MSearchBar
        value={query}
        onChange={v => { setQuery(v); setPage(1) }}
        placeholder="Search reference, customer or description..."
      />

      <div className="m-section-header">
        <h4 className="m-section-title">
          <Icon name="transaction" size={16}/> Central Financial Ledger
          <span className="m-count-badge">{filtered.length}</span>
        </h4>
      </div>

      {visible.length === 0 ? (
        <div className="m-empty-card">
          No transactions found.
        </div>
      ) : (
        visible.map((t, idx) => {
          const isCredit = t[4] === 'Credit' || t[4] === 'Capital' || t[4] === 'EMI'
          return (
            <div className="m-card" key={`${t[0]}-${idx}`}>
              <div className="m-card-head">
                <div>
                  <div className="m-card-title">{t[2]}</div>
                  <div className="m-card-subtitle">{t[0]} · {t[1]}</div>
                </div>
                <Badge status={t[6] || 'Approved'}/>
              </div>
              <div className="m-card-grid">
                <div className="m-grid-cell">
                  <span className="m-grid-label">Party / Source</span>
                  <span className="m-grid-value">{t[3]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Type</span>
                  <span className="m-grid-value">{t[4]}</span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Amount</span>
                  <span className={`m-grid-value highlight ${isCredit ? 'success' : 'danger'}`}>
                    {isCredit ? '+' : '-'}{t[5]}
                  </span>
                </div>
                <div className="m-grid-cell">
                  <span className="m-grid-label">Status</span>
                  <span className="m-grid-value">{t[6]}</span>
                </div>
              </div>
            </div>
          )
        })
      )}

      {totalPages > 1 && (
        <div className="m-pagination">
          <button
            type="button"
            className="m-page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span className="m-page-info">Page {page} of {totalPages}</span>
          <button
            type="button"
            className="m-page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </>
  )
}

// -------------------------------------------------------------
// MODALS (FORM HANDLERS)
// -------------------------------------------------------------

function Modal({ title, subtitle, children, onClose, large }: { title: string; subtitle: string; children: ReactNode; onClose: () => void; large?: boolean }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal ${large ? 'large' : ''}`} onMouseDown={e => e.stopPropagation()}>
        <div className="m-sheet-drag-handle" />
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="m-modal-close-btn" onClick={onClose} title="Close">
            <Icon name="close" size={15} />
          </button>
        </div>
        <div className="m-modal-body-scroll">
          {children}
        </div>
      </div>
    </div>
  )
}

function FormModal({
  type,
  targetId,
  targetFinancerName,
  targetEmi,
  availableBalance,
  partners,
  financers,
  activeRole,
  leads,
  onClose,
  onDone
}: {
  type: string
  targetId?: string
  targetFinancerName?: string
  targetEmi?: EmiItem | null
  availableBalance: number
  partners: Partner[]
  financers: Financer[]
  activeRole: UserRole
  leads: string[][]
  onClose: () => void
  onDone: (message: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)

  // EMI Payment with UTR State
  const [payUtr, setPayUtr] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10))
  const [payMethod, setPayMethod] = useState('NEFT / RTGS')
  const [payProofFile, setPayProofFile] = useState<File | null>(null)

  // Lead Form State
  const [leadBusiness, setLeadBusiness] = useState('')
  const [leadPerson, setLeadPerson] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadAmount, setLeadAmount] = useState('1000000')
  const [leadSource, setLeadSource] = useState('Referral')
  const [leadStatus, setLeadStatus] = useState('Qualified')

  // Lead Chain Selection State
  const initialFinancerId = activeRole?.financerId || (financers[0]?.id || '')
  const [selectedFinancerId, setSelectedFinancerId] = useState(initialFinancerId)
  const [selectedTeamId, setSelectedTeamId] = useState(activeRole?.teamId || '')

  const curFinancer = financers.find(f => f.id === selectedFinancerId)
  const hasTeams = Boolean(curFinancer && curFinancer.teams && curFinancer.teams.length > 0)
  const curTeam = hasTeams ? curFinancer?.teams?.find(t => t.id === selectedTeamId) : null

  // Financer Form State
  const [financerName, setFinancerName] = useState('')
  const [financerRole, setFinancerRole] = useState('Financer / Capital Partner')
  const [financerPhone, setFinancerPhone] = useState('')
  const [financerEmail, setFinancerEmail] = useState('')
  const [financerCapital, setFinancerCapital] = useState('1000000')

  // Sub-Team Form State
  const [teamName, setTeamName] = useState('')
  const [teamRole, setTeamRole] = useState('Loan Agent / Sub-Team')
  const [teamPhone, setTeamPhone] = useState('')
  const [teamEmail, setTeamEmail] = useState('')

  // Expense Form State
  const [expCategory, setExpCategory] = useState('Operations')
  const [expAmount, setExpAmount] = useState('')
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10))
  const [expDesc, setExpDesc] = useState('')
  const [expFile, setExpFile] = useState<File | null>(null)

  // Disburse Form State
  const [disburseAmount, setDisburseAmount] = useState('600000')
  const [disburseUtr, setDisburseUtr] = useState('')
  const [disburseDate, setDisburseDate] = useState(new Date().toISOString().slice(0, 10))
  const [disburseMethod, setDisburseMethod] = useState('NEFT / RTGS')
  const [disburseFile, setDisburseFile] = useState<File | null>(null)

  // Capital Investment Form State
  const [selectedPartnerId, setSelectedPartnerId] = useState(partners[0]?.id || 'u1')
  const [newPartnerName, setNewPartnerName] = useState('')
  const [newPartnerRole, setNewPartnerRole] = useState('Capital Partner & Investor')
  const [investAmount, setInvestAmount] = useState('500000')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (type === 'pay-emi' && targetEmi) {
        if (!payUtr.trim()) {
          alert('Please enter bank UTR / transaction reference number')
          setSubmitting(false)
          return
        }
        const formData = new FormData()
        formData.append('utr', payUtr.trim())
        formData.append('paymentDate', payDate)
        formData.append('paymentMethod', payMethod)
        if (payProofFile) {
          formData.append('proofFile', payProofFile)
        }

        const res = await fetch(`/api/emis/${targetEmi.id}/pay`, {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`EMI #${targetEmi.installment_num || 1} for ${targetEmi.customer} marked as Paid with UTR ${payUtr.trim()}! ${money(targetEmi.amount)} credited to Centralized Balance.`)
        } else {
          alert(data.error || 'Failed to submit payment')
        }
      } else if (type === 'lead') {
        if (!leadBusiness.trim()) {
          alert('Please enter business name')
          setSubmitting(false)
          return
        }

        const finId = curFinancer ? curFinancer.id : ''
        const finName = curFinancer ? curFinancer.name : ''
        const tmId = curTeam ? curTeam.id : ''
        const tmName = curTeam ? curTeam.name : ''

        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business: leadBusiness.trim(),
            contactPerson: leadPerson.trim(),
            phone: leadPhone.trim(),
            email: leadEmail.trim(),
            requirement: Number(leadAmount) || 0,
            source: leadSource,
            status: leadStatus,
            financerId: finId,
            financerName: finName,
            teamId: tmId,
            teamName: tmName,
            createdBy: activeRole?.name || 'Admin'
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          const attrText = finName
            ? tmName
              ? `${finName} ➔ ${tmName}`
              : `${finName} (Direct)`
            : 'Admin Direct'
          onDone(`Lead "${leadBusiness}" added! Chain Attribution: ${attrText}`)
        } else {
          alert(data.error || 'Failed to save lead')
        }
      } else if (type === 'add-financer') {
        if (!financerName.trim()) {
          alert('Please enter financer name')
          setSubmitting(false)
          return
        }
        const res = await fetch('/api/financers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: financerName.trim(),
            role: financerRole.trim(),
            phone: financerPhone.trim(),
            email: financerEmail.trim(),
            capitalInvested: Number(financerCapital) || 0
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Financer "${financerName}" created in Chain Reaction hierarchy!`)
        } else {
          alert(data.error || 'Failed to add financer')
        }
      } else if (type === 'add-team') {
        if (!teamName.trim() || !targetId) {
          alert('Please enter team / agent name')
          setSubmitting(false)
          return
        }
        const res = await fetch(`/api/financers/${targetId}/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: teamName.trim(),
            role: teamRole.trim(),
            phone: teamPhone.trim(),
            email: teamEmail.trim()
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Sub-team "${teamName}" attached under Financer ${targetFinancerName || 'Financer'}!`)
        } else {
          alert(data.error || 'Failed to add sub-team')
        }
      } else if (type === 'expense') {
        if (!expDesc.trim() || !expAmount) {
          alert('Please enter description and amount')
          setSubmitting(false)
          return
        }
        const formData = new FormData()
        formData.append('description', expDesc.trim())
        formData.append('category', expCategory)
        formData.append('amount', expAmount)
        formData.append('date', expDate)
        formData.append('submittedBy', 'Enterprise Admin')
        if (expFile) {
          formData.append('receiptFile', expFile)
        }

        const res = await fetch('/api/expenses', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Expense of ${money(Number(expAmount))} debited directly from Centralized Balance!`)
        } else {
          alert(data.error || 'Failed to record expense')
        }
      } else if (type === 'capital') {
        const amt = Number(investAmount)
        if (!amt || amt <= 0) {
          alert('Please enter a valid investment amount')
          setSubmitting(false)
          return
        }
        const isNew = selectedPartnerId === 'new'
        const partnerName = isNew ? newPartnerName.trim() : partners.find(p => p.id === selectedPartnerId)?.name

        if (isNew && !partnerName) {
          alert('Please enter the new partner name')
          setSubmitting(false)
          return
        }

        const res = await fetch('/api/capital/invest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerId: isNew ? undefined : selectedPartnerId,
            partnerName,
            role: isNew ? newPartnerRole : undefined,
            amount: amt
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Capital investment of ${money(amt)} credited to Centralized Balance! P&L shares recalculated.`)
        } else {
          alert(data.error || 'Failed to record capital investment')
        }
      } else if (type === 'disburse') {
        const id = targetId || 'GE-2025-086'
        const formData = new FormData()
        formData.append('amount', disburseAmount)
        formData.append('utr', disburseUtr.trim())
        formData.append('paymentDate', disburseDate)
        formData.append('paymentMethod', disburseMethod)
        if (disburseFile) {
          formData.append('proofFile', disburseFile)
        }

        const res = await fetch(`/api/loans/${id}/disburse`, {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Loan ${id} disbursed! ${money(Number(disburseAmount))} debited from Centralized Balance.`)
        } else {
          alert(data.error || 'Disbursement failed')
        }
      }
    } catch {
      alert('Network request error connecting to server.')
    } finally {
      setSubmitting(false)
    }
  }

  // 1. Convert Lead to Loan Modal with Full Funding Engine
  if (type === 'convert-lead') {
    return (
      <Modal
        large
        title="Convert Lead to Loan — Funding Engine"
        subtitle="Geet Enterprise Calculation Engine · All EMIs generated into schedule"
        onClose={onClose}
      >
        <div className="fe-modal-body">
          <FundingEngine
            leads={leads}
            preselectedLeadId={targetId}
            isModal={true}
            onSuccess={msg => { onClose(); onDone(msg) }}
            onCancel={onClose}
          />
        </div>
      </Modal>
    )
  }

  // 2. Direct Loan Creation with Full Funding Engine
  if (type === 'loan') {
    return (
      <Modal
        large
        title="Create Direct Loan — Funding Engine"
        subtitle="Sanction funding proposal and generate complete multi-installment EMI schedule"
        onClose={onClose}
      >
        <div className="fe-modal-body">
          <FundingEngine
            leads={leads}
            isModal={true}
            onSuccess={msg => { onClose(); onDone(msg) }}
            onCancel={onClose}
          />
        </div>
      </Modal>
    )
  }

  // 3. Record EMI Payment & Submit Bank UTR Modal
  if (type === 'pay-emi' && targetEmi) {
    return (
      <Modal
        title="Record EMI Payment / Submit Bank UTR"
        subtitle={`Installment #${targetEmi.installment_num || 1} for ${targetEmi.customer} (${targetEmi.loan_id})`}
        onClose={onClose}
      >
        <form onSubmit={submit} className="form">
          <div className="confirmation-strip emi-modal-strip">
            <div><span>Installment</span><strong>#{targetEmi.installment_num || 1} ({targetEmi.id})</strong></div>
            <div><span>Customer</span><strong>{targetEmi.customer}</strong></div>
            <div><span>Loan ID</span><strong>{targetEmi.loan_id}</strong></div>
            <div><span>Due Date</span><strong>{targetEmi.due_date}</strong></div>
            <div><span>Amount Due</span><strong style={{ color: 'var(--green)' }}>{money(targetEmi.amount)}</strong></div>
            <div><span>Remaining Balance</span><strong>{money(targetEmi.balance || 0)}</strong></div>
          </div>

          <div className="form-grid">
            <label style={{ gridColumn: '1/3' }}>
              Bank UTR / Transaction Reference Number *
              <input
                type="text"
                value={payUtr}
                onChange={e => setPayUtr(e.target.value.toUpperCase())}
                placeholder="e.g. HDFC002938472 or AXIS9871234"
                required
                autoFocus
              />
              <small style={{ color: 'var(--muted)', fontSize: '9px' }}>
                Mandatory: Submitting the bank UTR marks this installment as Paid and credits Central Balance.
              </small>
            </label>

            <label>
              Payment Date
              <input
                type="date"
                value={payDate}
                onChange={e => setPayDate(e.target.value)}
                required
              />
            </label>

            <label>
              Payment Method
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option>NEFT / RTGS</option>
                <option>IMPS</option>
                <option>UPI</option>
                <option>Net Banking</option>
                <option>Cheque</option>
              </select>
            </label>
          </div>

          <label className="upload">
            <Icon name="upload"/>
            <strong>{payProofFile ? payProofFile.name : 'Upload Payment Receipt / Proof (Optional)'}</strong>
            <span>{payProofFile ? `${Math.round(payProofFile.size / 1024)} KB` : 'PDF, PNG or JPG · Max 15 MB'}</span>
            <input type="file" onChange={e => e.target.files?.[0] && setPayProofFile(e.target.files[0])}/>
          </label>

          <div className="notice" style={{ background: '#f0fdf4', borderColor: '#22c55e', color: '#15803d', marginTop: '14px' }}>
            <Icon name="check"/>
            <div>
              <strong>Direct Credit to Centralized Liquid Balance</strong>
              <span>Submitting this UTR will immediately mark the installment as Paid, log the transaction in Master Ledger with this UTR reference, and credit {money(targetEmi.amount)} into the centralized balance.</span>
            </div>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting UTR...' : `Submit UTR & Mark Paid (${money(targetEmi.amount)})`}
            </Button>
          </div>
        </form>
      </Modal>
    )
  }

  if (type === 'disburse') {
    return (
      <Modal title="Confirm Loan Disbursement" subtitle="Verify details before debiting funds from Centralized Balance" onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="confirmation-strip">
            <div><span>Loan ID</span><strong>{targetId || 'GE-2025-086'}</strong></div>
            <div><span>Available Central Balance</span><strong>{money(availableBalance)}</strong></div>
          </div>
          <div className="form-grid">
            <label>Disbursement amount (₹)<input type="number" onWheel={e => (e.target as HTMLElement).blur()} value={disburseAmount} onChange={e => setDisburseAmount(e.target.value)} required/></label>
            <label>UTR / Bank reference<input type="text" value={disburseUtr} onChange={e => setDisburseUtr(e.target.value)} placeholder="e.g. HDFC002934812"/></label>
            <label>Payment date<input type="date" value={disburseDate} onChange={e => setDisburseDate(e.target.value)} required/></label>
            <label>Payment method
              <select value={disburseMethod} onChange={e => setDisburseMethod(e.target.value)}>
                <option>NEFT / RTGS</option>
                <option>IMPS</option>
                <option>Cheque</option>
              </select>
            </label>
          </div>
          <label className="upload">
            <Icon name="upload"/>
            <strong>{disburseFile ? disburseFile.name : 'Upload payment proof'}</strong>
            <span>{disburseFile ? `${Math.round(disburseFile.size / 1024)} KB` : 'PDF, PNG or JPG · Max 15 MB'}</span>
            <input type="file" onChange={e => e.target.files?.[0] && setDisburseFile(e.target.files[0])}/>
          </label>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Processing...' : 'Confirm disbursement'}</Button>
          </div>
        </form>
      </Modal>
    )
  }

  if (type === 'expense') {
    return (
      <Modal title="Add Operating Expense" subtitle="Debits directly from Centralized Balance" onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="notice" style={{ marginBottom: '14px', background: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8' }}>
            <Icon name="check"/>
            <div>
              <strong>Direct Central Fund Debit</strong>
              <span>This expense will be deducted directly from the Centralized Balance (Available: {money(availableBalance)}).</span>
            </div>
          </div>
          <div className="form-grid">
            <label>Category
              <select value={expCategory} onChange={e => setExpCategory(e.target.value)}>
                <option>Operations</option>
                <option>Legal</option>
                <option>Technology</option>
                <option>Travel</option>
                <option>Marketing</option>
              </select>
            </label>
            <label>
              Amount (₹)
              <input
                type="number"
                onWheel={e => (e.target as HTMLElement).blur()}
                value={expAmount}
                onChange={e => {
                  let v = e.target.value
                  if (v.length > 1 && v.startsWith('0')) v = v.replace(/^0+/, '')
                  setExpAmount(v)
                }}
                placeholder="Enter amount"
                required
              />
            </label>
            <label>Expense date<input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} required/></label>
            <label>Description<input type="text" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="What was this expense for?" required/></label>
          </div>
          <label className="upload">
            <Icon name="upload"/>
            <strong>{expFile ? expFile.name : 'Upload receipt'}</strong>
            <span>{expFile ? `${Math.round(expFile.size / 1024)} KB` : 'PDF, PNG or JPG · Max 15 MB'}</span>
            <input type="file" onChange={e => e.target.files?.[0] && setExpFile(e.target.files[0])}/>
          </label>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit & Debit Central Balance'}</Button>
          </div>
        </form>
      </Modal>
    )
  }

  if (type === 'capital') {
    return (
      <Modal title="Record Capital Investment" subtitle="Inject equity capital into Centralized Balance" onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="form-grid">
            <label style={{ gridColumn: '1/3' }}>
              Select Partner / Investor
              <select value={selectedPartnerId} onChange={e => setSelectedPartnerId(e.target.value)}>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Current: {money(p.capitalInvested)} · {p.sharePct}%)</option>
                ))}
                <option value="new">+ Add New Partner / Investor</option>
              </select>
            </label>

            {selectedPartnerId === 'new' && (
              <>
                <label>
                  New Partner Name
                  <input
                    type="text"
                    value={newPartnerName}
                    onChange={e => setNewPartnerName(e.target.value)}
                    placeholder="e.g. Vikram Singhania"
                    required
                  />
                </label>
                <label>
                  Role / Designation
                  <input
                    type="text"
                    value={newPartnerRole}
                    onChange={e => setNewPartnerRole(e.target.value)}
                    placeholder="e.g. Equity Partner"
                  />
                </label>
              </>
            )}

            <label style={{ gridColumn: '1/3' }}>
              Investment Amount (₹)
              <input
                type="number"
                onWheel={e => (e.target as HTMLElement).blur()}
                value={investAmount}
                onChange={e => {
                  let v = e.target.value
                  if (v.length > 1 && v.startsWith('0')) v = v.replace(/^0+/, '')
                  setInvestAmount(v)
                }}
                placeholder="500000"
                required
              />
              <small style={{ color: 'var(--muted)', fontSize: '9px', marginTop: '4px' }}>
                This amount will be added to Centralized Liquid Balance and will dynamically increase the partner's share in Profit & Loss.
              </small>
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Recording...' : 'Add to Central Capital'}</Button>
          </div>
        </form>
      </Modal>
    )
  }



  // 4. Add Financer Modal (Chain Reaction Tier 1)
  if (type === 'add-financer') {
    return (
      <Modal title="Add New Financer" subtitle="Add financer into the Chain Reaction hierarchy" onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="form-grid">
            <label style={{ gridColumn: '1/3' }}>
              Financer Name *
              <input
                type="text"
                value={financerName}
                onChange={e => setFinancerName(e.target.value)}
                placeholder="e.g. Sanjay Gupta or Singhania Capital"
                required
                autoFocus
              />
            </label>
            <label>
              Designation / Role
              <input
                type="text"
                value={financerRole}
                onChange={e => setFinancerRole(e.target.value)}
                placeholder="e.g. Financer / Capital Partner"
              />
            </label>
            <label>
              Contact Phone
              <input
                type="text"
                value={financerPhone}
                onChange={e => setFinancerPhone(e.target.value)}
                placeholder="+91 98765 00000"
              />
            </label>
            <label style={{ gridColumn: '1/3' }}>
              Email Address
              <input
                type="email"
                value={financerEmail}
                onChange={e => setFinancerEmail(e.target.value)}
                placeholder="financer@domain.com"
              />
            </label>
            <label style={{ gridColumn: '1/3' }}>
              Initial Capital to Invest (₹)
              <input
                type="number"
                onWheel={e => (e.target as HTMLElement).blur()}
                value={financerCapital}
                onChange={e => setFinancerCapital(e.target.value)}
                placeholder="1000000"
              />
              <small style={{ color: 'var(--muted)', fontSize: '9px', marginTop: '4px' }}>
                Invested capital is credited directly to Centralized Pool and partner equity shares update dynamically.
              </small>
            </label>
          </div>
          <div className="notice" style={{ background: '#f0fdf4', borderColor: '#22c55e', color: '#15803d', marginTop: '12px' }}>
            <Icon name="bolt" size={16}/>
            <div>
              <strong>Chain Reaction:</strong> Once created, you can add Sub-Teams under this financer or let leads attribute directly to them!
            </div>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Add Financer to Chain'}</Button>
          </div>
        </form>
      </Modal>
    )
  }

  // 5. Add Sub-Team / Agent Modal (Chain Reaction Tier 2)
  if (type === 'add-team') {
    return (
      <Modal title="Add Sub-Team / Loan Agent" subtitle={`Attach team member under Financer: ${targetFinancerName || 'Financer'}`} onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="notice" style={{ background: '#eff6ff', borderColor: '#3b82f6', color: '#1d4ed8', marginBottom: '14px' }}>
            <Icon name="check"/>
            <div>
              <strong>Parent Financer: {targetFinancerName || 'Financer'}</strong>
              <span>Leads assigned to this sub-team will carry chain attribution: {targetFinancerName || 'Financer'} ➔ [Team Name].</span>
            </div>
          </div>
          <div className="form-grid">
            <label style={{ gridColumn: '1/3' }}>
              Team / Agent Name *
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. West Delhi Field Agents or Vikram Malhotra"
                required
                autoFocus
              />
            </label>
            <label>
              Role / Designation
              <input
                type="text"
                value={teamRole}
                onChange={e => setTeamRole(e.target.value)}
                placeholder="e.g. Senior Acquisition Agent"
              />
            </label>
            <label>
              Contact Phone
              <input
                type="text"
                value={teamPhone}
                onChange={e => setTeamPhone(e.target.value)}
                placeholder="+91 98111 00000"
              />
            </label>
            <label style={{ gridColumn: '1/3' }}>
              Email Address
              <input
                type="email"
                value={teamEmail}
                onChange={e => setTeamEmail(e.target.value)}
                placeholder="agent@domain.com"
              />
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Attach Sub-Team to Financer'}</Button>
          </div>
        </form>
      </Modal>
    )
  }

  // 6. Add Lead Modal with Cascading Chain Reaction Dropdown
  return (
    <Modal title="Add New Lead" subtitle="Capture prospect details and set chain reaction attribution" onClose={onClose}>
      <form onSubmit={submit} className="form">
        {/* Chain Reaction Attribution Box */}
        <div className="m-chain-box">
          <div className="m-chain-box-title">
            <Icon name="bolt" size={15}/> Chain Reaction Attribution
          </div>

          <label>
            Select Financer
            <select
              value={selectedFinancerId}
              onChange={e => {
                setSelectedFinancerId(e.target.value)
                setSelectedTeamId('') // Reset team when financer changes
              }}
            >
              <option value="">🏢 Enterprise Direct (No Financer)</option>
              {financers.map(f => (
                <option key={f.id} value={f.id}>
                  💼 {f.name} ({f.teams?.length ? `${f.teams.length} sub-teams` : 'No team - Direct'})
                </option>
              ))}
            </select>
          </label>

          {/* CASCADING DROPDOWN: IF FINANCER HAS TEAMS -> SHOW TEAM DROPDOWN */}
          {curFinancer && hasTeams && (
            <label>
              Select Sub-Team / Sourcing Agent *
              <select
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
              >
                <option value="">-- Choose Sub-Team under {curFinancer.name} --</option>
                {curFinancer.teams.map(t => (
                  <option key={t.id} value={t.id}>
                    👥 {t.name} ({t.role})
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* CHAIN VISUAL INDICATOR */}
          {curFinancer ? (
            hasTeams ? (
              <div className="m-chain-indicator">
                🔗 <strong>Chain Link:</strong> Admin ➔ {curFinancer.name} ➔ {curTeam ? curTeam.name : 'Select Sub-Team above'}
              </div>
            ) : (
              <div className="m-chain-indicator" style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#92400e' }}>
                ⚡ <strong>Direct Financer Attribution:</strong> {curFinancer.name} has no sub-team. Lead belongs directly to {curFinancer.name}!
              </div>
            )
          ) : (
            <div className="m-chain-indicator" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
              🏢 <strong>Enterprise Direct:</strong> Lead belongs directly to central pool.
            </div>
          )}
        </div>

        {/* Standard Lead Inputs */}
        <div className="form-grid">
          <label>Business name *<input type="text" value={leadBusiness} onChange={e => setLeadBusiness(e.target.value)} placeholder="Registered business name" required autoFocus/></label>
          <label>Contact person<input type="text" value={leadPerson} onChange={e => setLeadPerson(e.target.value)} placeholder="Full name"/></label>
          <label>Phone number<input type="text" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} placeholder="+91 98765 43210"/></label>
          <label>Email address<input type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="name@business.com"/></label>
          <label>Loan requirement (₹)<input type="number" onWheel={e => (e.target as HTMLElement).blur()} value={leadAmount} onChange={e => setLeadAmount(e.target.value)} placeholder="Enter amount"/></label>
          <label>Lead source
            <select value={leadSource} onChange={e => setLeadSource(e.target.value)}>
              <option>Referral</option>
              <option>Website</option>
              <option>Partner</option>
              <option>Direct outreach</option>
            </select>
          </label>
          <label>Status
            <select value={leadStatus} onChange={e => setLeadStatus(e.target.value)}>
              <option>New</option>
              <option>Follow-up</option>
              <option>Qualified</option>
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add Lead with Chain'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// -------------------------------------------------------------
// MOBILE BANKING HOME VIEW (DIRECTLY MATCHING SCREENSHOT)
// -------------------------------------------------------------

function MobileHome({
  masterWallet,
  partners,
  financers,
  activeRole,
  setActiveRole,
  emis,
  loans,
  expenses,
  transactions,
  pnl,
  openAddLead,
  openConvertLead,
  openAddExpense,
  openAddCapital,
  navigate,
  balanceRevealed,
  setBalanceRevealed,
  themeMode,
  setThemeMode,
  notify,
  onLogout
}: {
  masterWallet: { total_capital: number; available_balance: number; allocated_capital: number }
  partners: Partner[]
  financers: Financer[]
  activeRole: UserRole
  setActiveRole: (r: UserRole) => void
  emis: string[][]
  loans: string[][]
  expenses: string[][]
  transactions: string[][]
  pnl: PnlSummary
  openAddLead: () => void
  openConvertLead: () => void
  openAddExpense: () => void
  openAddCapital: () => void
  navigate: (screen: Screen) => void
  balanceRevealed: boolean
  setBalanceRevealed: (v: boolean) => void
  themeMode: string
  setThemeMode: (m: 'theme-violet' | 'theme-amber' | 'theme-cyan') => void
  notify: (msg: string) => void
  onLogout: () => void
}) {
  const [profileDropdown, setProfileDropdown] = useState(false)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  const cycleTheme = () => {
    const next = themeMode === 'theme-violet' ? 'theme-amber' : themeMode === 'theme-amber' ? 'theme-cyan' : 'theme-violet'
    setThemeMode(next as 'theme-violet' | 'theme-amber' | 'theme-cyan')
    notify(`Color theme changed to ${next.replace('theme-', '')}`)
  }

  return (
    <div>
      {/* 1. Mobile Top Header directly matching screenshot */}
      <div className="mobile-top-header">
        <div className="mobile-top-row">
          <div>
            <div className="mobile-greeting-date">{today}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="mobile-greeting-title">Welcome</div>
              <span className="m-role-pill-badge" style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.3)' }}>
                {activeRole.type === 'admin' ? '👑 Admin' : activeRole.type === 'financer' ? `💼 ${activeRole.name.split(' ')[0]}` : `👥 ${activeRole.name.split(' ')[0]}`}
              </span>
            </div>
          </div>
          <div className="mobile-top-actions">
            <button
              type="button"
              className="mobile-round-btn"
              title="Switch Color Theme"
              onClick={cycleTheme}
            >
              <Icon name="palette" size={17}/>
            </button>
            <button
              type="button"
              className="mobile-round-btn"
              title="Notifications"
              onClick={() => notify('3 unread system alerts: All funds, loans & collections synced')}
            >
              <Icon name="bell" size={17}/>
              <span className="mobile-bell-badge">3</span>
            </button>
            <button
              type="button"
              className="mobile-round-btn avatar-btn"
              title="Admin Profile"
              onClick={() => setProfileDropdown(!profileDropdown)}
            >
              {activeRole.type === 'admin' ? 'AD' : activeRole.name.split(' ').map(x => x[0]).join('')}
            </button>
          </div>
        </div>

        {profileDropdown && (
          <div
            style={{
              marginTop: '12px',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '12px 14px',
              color: 'var(--ink)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '1px solid var(--line)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '13px' }}>{activeRole.name}</strong>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {activeRole.type === 'admin' ? 'admin@geetenterprise.in' : `${activeRole.type.toUpperCase()} · Chain Access`}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign out
              </button>
            </div>

            {/* Chain Reaction Persona Switcher */}
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Chain Reaction Access Mode:
              </div>
              <select
                value={activeRole.type === 'admin' ? 'admin' : activeRole.type === 'financer' ? `f_${activeRole.financerId}` : `t_${activeRole.teamId}`}
                onChange={e => {
                  const val = e.target.value
                  if (val === 'admin') {
                    setActiveRole({ type: 'admin', id: 'admin', name: 'Administrator' })
                    notify('Active Mode: Administrator (Full Central Pool Access)')
                  } else if (val.startsWith('f_')) {
                    const fId = val.replace('f_', '')
                    const f = financers.find(x => x.id === fId)
                    if (f) {
                      setActiveRole({ type: 'financer', id: f.id, name: f.name, financerId: f.id, financerName: f.name })
                      notify(`Active Mode: Financer (${f.name})`)
                    }
                  } else if (val.startsWith('t_')) {
                    const tId = val.replace('t_', '')
                    for (const f of financers) {
                      const t = f.teams.find(x => x.id === tId)
                      if (t) {
                        setActiveRole({ type: 'team', id: t.id, name: t.name, financerId: f.id, financerName: f.name, teamId: t.id, teamName: t.name })
                        notify(`Active Mode: Team Agent (${t.name})`)
                        break
                      }
                    }
                  }
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: '#f8fafc',
                  color: '#0f172a'
                }}
              >
                <option value="admin">👑 Administrator (Full Master Pool)</option>
                {financers.map(f => (
                  <optgroup key={f.id} label={`💼 Financer: ${f.name}`}>
                    <option value={`f_${f.id}`}>Financer: {f.name}</option>
                    {f.teams.map(t => (
                      <option key={t.id} value={`t_${t.id}`}>↳ Sub-Team: {t.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => { setProfileDropdown(false); navigate('Capital & Partners') }}
                style={{ background: '#f8faf8', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px', fontSize: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                💼 Financers & Teams
              </button>
              <button
                type="button"
                onClick={() => { setProfileDropdown(false); navigate('Profit & Loss') }}
                style={{ background: '#f8faf8', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px', fontSize: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}
              >
                📊 P&L Statement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Simple, High-Visibility Cash Balance Card (Easy for all users) */}
      <div className="simple-balance-card">
        <div className="simple-balance-top">
          <div className="simple-balance-badge">
            <span className="simple-badge-dot"/>
            <span>उपलब्ध रोकड़ (Cash in Hand)</span>
          </div>
          <button
            type="button"
            className="simple-add-capital-btn"
            onClick={openAddCapital}
            title="Add Capital Investment / पूंजी जोड़ें"
          >
            <Icon name="plus" size={13}/> + पूंजी जोड़ें
          </button>
        </div>

        <div className="simple-main-amount">
          {money(masterWallet.available_balance)}
        </div>
        <div className="simple-amount-sub">
          तुरंत लोन देने व खर्च के लिए तैयार रोकड़ बैलेंस
        </div>

        {/* 2 Clear Visual Stat Blocks */}
        <div className="simple-stats-row">
          <div
            className="simple-stat-box"
            onClick={() => navigate('Capital & Partners')}
            title="View Capital Partners & Equity"
          >
            <div className="simple-stat-icon">🏦</div>
            <div className="simple-stat-info">
              <span className="simple-stat-label">कुल पूंजी (Total Fund)</span>
              <strong className="simple-stat-val">{money(masterWallet.total_capital)}</strong>
            </div>
          </div>

          <div
            className="simple-stat-box"
            onClick={() => navigate('Loans')}
            title="View All Loans"
          >
            <div className="simple-stat-icon">🤝</div>
            <div className="simple-stat-info">
              <span className="simple-stat-label">मार्केट में लोन ({loans.length})</span>
              <strong className="simple-stat-val">{money(masterWallet.allocated_capital)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 Circular Quick Action Buttons tailored to Geet Enterprise Finance ERP */}
      <div className="mobile-quick-actions">
        <button type="button" className="quick-action-item" onClick={openAddLead} title="Add Customer Lead">
          <div className="quick-action-circle">
            <div className="quick-icon-ring green">
              <Icon name="leads" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Add Lead</span>
        </button>

        <button type="button" className="quick-action-item" onClick={openConvertLead} title="Sanction Loan / Convert Lead">
          <div className="quick-action-circle">
            <div className="quick-icon-ring blue">
              <Icon name="bolt" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Sanction</span>
        </button>

        <button type="button" className="quick-action-item" onClick={() => navigate('Scheduled EMIs')} title="EMI Collections & Schedule">
          <div className="quick-action-circle">
            <div className="quick-icon-ring amber">
              <Icon name="payments" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Collections</span>
        </button>

        <button type="button" className="quick-action-item" onClick={openAddExpense} title="Record Operating Expense">
          <div className="quick-action-circle">
            <div className="quick-icon-ring red">
              <Icon name="expense" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Expenses</span>
        </button>
      </div>

      {/* 4. Recent Activity Section from Real Central Ledger */}
      <div className="mobile-activity-section">
        <div className="mobile-activity-head">
          <span className="mobile-activity-title">Recent Activity</span>
          <button
            type="button"
            className="mobile-activity-link"
            onClick={() => navigate('Transactions')}
          >
            View All
          </button>
        </div>

        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map(tx => {
            const isCredit = tx[4]?.toLowerCase() === 'credit'
            const isDisbursal = tx[2]?.toLowerCase().includes('disburs')
            const isEmi = tx[2]?.toLowerCase().includes('emi')
            const tone = isCredit ? 'green' : isDisbursal ? 'amber' : 'red'

            return (
              <div
                className="mobile-activity-item"
                key={tx[0]}
                onClick={() => navigate('Transactions')}
              >
                <div className={`mobile-act-icon ${tone}`}>
                  {isCredit ? <Icon name="arrowUp" size={16}/> : isDisbursal ? <Icon name="loans" size={16}/> : <Icon name="arrowDown" size={16}/>}
                </div>
                <div className="mobile-act-details">
                  <div className="mobile-act-name">{tx[3] || tx[2]}</div>
                  <div className="mobile-act-date">{tx[1]} · {tx[2]}</div>
                </div>
                <div className="mobile-act-amount-col">
                  <div className={`mobile-act-amt ${isCredit ? 'credit' : 'debit'}`}>
                    {isCredit ? '+' : '-'}{tx[5]}
                  </div>
                  <div className="mobile-act-badge">{tx[4]}</div>
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--muted)', fontSize: '12px' }}>
            No recent activity recorded yet
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// LOGIN (SINGLE-USER ADMINISTRATOR ACCESS)
// -------------------------------------------------------------

function Login({ onLogin }: { onLogin: () => void }) {
  const [forgot, setForgot] = useState(false)
  const [email, setEmail] = useState('admin@geetenterprise.in')
  const [password, setPassword] = useState('password123')
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark large">GE</div>
        <div><strong>GEET ENTERPRISE</strong><span>Capital & Lending ERP</span></div>
      </div>
      <div className="auth-copy">
        <span className="kicker">CAPITAL & LOAN MANAGEMENT COCKPIT</span>
        <h1>Single-User Administrator Control.</h1>
        <p>A centralized finance ERP for capital deployment, customer lead acquisition, instant loan conversion, direct balance expense management, and pro-rata P&L distribution.</p>
        <div className="auth-metrics">
          <div><strong>₹45.75L</strong><span>Capital Pool</span></div>
          <div><strong>94.8%</strong><span>Recovery Rate</span></div>
          <div><strong>100%</strong><span>Centralized Debits</span></div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form">
          <div className="mobile-brand">GEET ENTERPRISE</div>
          <span className="eyebrow">SINGLE USER AUTHORIZED LOGIN</span>
          <h2>{forgot ? 'Reset password' : 'Administrator Sign In'}</h2>
          <p>{forgot ? 'Enter registered admin email.' : 'Sign in to access your central capital & loan dashboard.'}</p>
          {forgot ? (
            <form onSubmit={e => { e.preventDefault(); setForgot(false) }}>
              <label>Email address<input type="email" placeholder="admin@geetenterprise.in" required/></label>
              <Button type="submit">Send reset link</Button>
              <button type="button" className="text-button centered-button" onClick={() => setForgot(false)}>Back to sign in</button>
            </form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); onLogin() }}>
              <label>Administrator Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></label>
              <label>Password
                <div className="password-field">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required/>
                  <button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? 'Hide' : 'Show'}</button>
                </div>
              </label>
              <div className="form-between">
                <label className="check-label"><input type="checkbox" defaultChecked/> Keep me signed in</label>
                <button type="button" className="text-button" onClick={() => setForgot(true)}>Forgot password?</button>
              </div>
              <Button type="submit">Access Admin Dashboard <Icon name="arrowRight" size={16}/></Button>
            </form>
          )}
          <div className="secure-note">256-bit encrypted · Single user active session</div>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// MAIN APPLICATION ROOT (SINGLE USER DASHBOARD)
// -------------------------------------------------------------

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true)
  const [balanceRevealed, setBalanceRevealed] = useState(false)
  const [themeMode, setThemeMode] = useState<'theme-violet' | 'theme-amber' | 'theme-cyan'>('theme-violet')
  const [screen, setScreen] = useState<Screen>('Dashboard')
  const [sidebar, setSidebar] = useState(false)
  const [profile, setProfile] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [modalTargetId, setModalTargetId] = useState<string | undefined>()
  const [targetFinancerName, setTargetFinancerName] = useState<string>('')
  const [toast, setToast] = useState('')
  const [serverOnline, setServerOnline] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  // Master State
  const [masterWallet, setMasterWallet] = useState({ total_capital: 4575000, available_balance: 1435450, allocated_capital: 3139550 })
  const [partners, setPartners] = useState<Partner[]>([
    { id: 'u1', name: 'Amit Sharma', role: 'Managing Partner & Investor', theme: 'violet', capitalInvested: 2000000, sharePct: 43.72, grossShare: 207100, expenseShare: 52267, netProfitShare: 154833, roiPct: 7.74, status: 'Profitable' },
    { id: 'u2', name: 'Priya Mehta', role: 'Senior Partner & Investor', theme: 'amber', capitalInvested: 1500000, sharePct: 32.79, grossShare: 155325, expenseShare: 39200, netProfitShare: 116125, roiPct: 7.74, status: 'Profitable' },
    { id: 'u3', name: 'Rohan Khanna', role: 'Capital Partner & Investor', theme: 'cyan', capitalInvested: 1075000, sharePct: 23.50, grossShare: 111319, expenseShare: 28094, netProfitShare: 83225, roiPct: 7.74, status: 'Profitable' }
  ])
  const [financers, setFinancers] = useState<Financer[]>([])
  const [activeRole, setActiveRole] = useState<UserRole>({ type: 'admin', id: 'admin', name: 'Administrator' })
  const [pnl, setPnl] = useState<PnlSummary>({
    grossRevenue: 473697,
    interestEarned: 454817,
    processingFees: 18880,
    totalExpenses: 119550,
    netProfit: 354147,
    profitMargin: 74.8,
    totalCapitalInvested: 4575000,
    distribution: []
  })

  const [leads, setLeads] = useState<string[][]>([])
  const [loans, setLoans] = useState<string[][]>([])
  const [emis, setEmis] = useState<string[][]>([])
  const [emisData, setEmisData] = useState<EmiItem[]>([])
  const [payTargetEmi, setPayTargetEmi] = useState<EmiItem | null>(null)
  const [expenses, setExpenses] = useState<string[][]>([])
  const [transactions, setTransactions] = useState<string[][]>([])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
    syncData()
  }

  const navigate = (name: Screen) => {
    setScreen(name)
    setSidebar(false)
  }

  // Hydrate full state from Express backend
  const syncData = async () => {
    try {
      const res = await fetch('/api/initial-data')
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data

        if (d.masterWallet) {
          setMasterWallet(d.masterWallet)
        }

        if (d.pnl) {
          setPnl(d.pnl)
          if (d.pnl.distribution?.length) {
            setPartners(d.pnl.distribution)
          }
        }

        if (d.financers?.length) {
          setFinancers(d.financers)
        }

        if (d.leads?.length) {
          setLeads(d.leads.map((l: { id: string; business: string; contact_person: string; phone: string; requirement: number; source: string; status: string; attribution?: string; financer_name?: string; team_name?: string }) => [
            l.id,
            l.business,
            l.contact_person,
            l.phone,
            money(l.requirement),
            l.source,
            l.status,
            l.attribution || 'Admin Direct',
            l.financer_name || '',
            l.team_name || ''
          ]))
        }

        if (d.loans?.length) {
          setLoans(d.loans.map((l: { id: string; business: string; customer: string; principal: number; roi: number; tenure: number; emi: number; status: string }) => [
            l.id,
            l.business,
            l.customer,
            money(l.principal),
            `${l.roi}%`,
            `${l.tenure} mo`,
            money(l.emi),
            l.status
          ]))
        }

        if (d.emis?.length) {
          setEmisData(d.emis)
          setEmis(d.emis.map((e: { id: string; due_date: string; customer: string; loan_id: string; principal: number; interest: number; amount: number; status: string }) => [
            e.due_date,
            e.customer,
            e.loan_id,
            money(e.principal),
            money(e.interest),
            money(e.amount),
            e.status
          ]))
        }

        if (d.expenses?.length) {
          setExpenses(d.expenses.map((exp: { id: string; date: string; description: string; category: string; amount: number; submitted_by: string; status: string }) => [
            exp.id,
            exp.date,
            exp.description,
            exp.category,
            money(exp.amount),
            exp.submitted_by || 'Enterprise Admin',
            exp.status
          ]))
        }

        if (d.transactions?.length) {
          setTransactions(d.transactions.map((t: { id: string; date: string; description: string; party: string; type: string; amount: number; status: string }) => [
            t.id,
            t.date,
            t.description,
            t.party,
            t.type,
            money(t.amount),
            t.status
          ]))
        }

        setServerOnline(true)
      }
    } catch {
      setServerOnline(false)
    }
  }

  useEffect(() => {
    syncData()
    const timer = setInterval(syncData, 8000)
    return () => clearInterval(timer)
  }, [])

  // Action Handlers
  const handleConvertLead = async (leadId: string, leadBusiness: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        notify(`Lead "${leadBusiness}" converted! Loan proposal created under "Disbursal due".`)
      } else {
        alert(data.error || 'Conversion failed')
      }
    } catch (e) {
      console.error(e)
      alert('Could not convert lead')
    }
  }

  const handlePayEmi = async (loanId: string, customer: string) => {
    const found = emis.find(e => e[2] === loanId && e[6] !== 'Paid') || emis.find(e => e[2] === loanId)
    if (!found) return
    try {
      const res = await fetch(`/api/emis/${found[2]}/pay`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        notify(`EMI payment of ${found[5]} recorded for ${customer}! Credited to Centralized Balance.`)
      } else {
        alert(data.error || 'Failed to record payment')
      }
    } catch (e) {
      console.error(e)
      alert('Could not record EMI payment')
    }
  }

  const handleApproveExpense = async (expId: string) => {
    try {
      const res = await fetch(`/api/expenses/${expId}/approve`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        notify(`Expense ${expId} approved and debited from Centralized Balance!`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Are you sure you want to remove sub-team "${teamName}"?`)) return
    try {
      const res = await fetch(`/api/financer-teams/${teamId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        notify(`Sub-team "${teamName}" removed successfully.`)
        syncData()
      } else {
        alert(data.error || 'Failed to remove sub-team')
      }
    } catch {
      alert('Network request error removing team')
    }
  }

  const handleApplyCalc = async (calc: { principal: number; roi: number; tenure: number; emi: number; business: string; leadId?: string }) => {
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business: calc.business,
          customer: calc.business,
          principal: calc.principal,
          roi: calc.roi,
          tenure: calc.tenure,
          emi: calc.emi,
          status: 'Disbursal due',
          leadId: calc.leadId
        })
      })
      const data = await res.json()
      if (data.success) {
        notify(
          calc.leadId
            ? `Lead converted! Loan proposal created for ${calc.business} under Disbursal Due!`
            : `Loan proposal created for ${calc.business} with monthly EMI of ${money(calc.emi)}!`
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)}/>

  const page = screen === 'Dashboard' ? (
    <Dashboard navigate={navigate} masterWallet={masterWallet} emis={emis} loans={loans} expenses={expenses} pnl={pnl}/>
  ) : screen === 'Capital & Partners' ? (
    <CapitalAndPartners
      masterWallet={masterWallet}
      partners={partners}
      financers={financers}
      transactions={transactions}
      openAddCapital={() => { setModalTargetId(undefined); setModal('capital') }}
      openAddFinancer={() => { setModalTargetId(undefined); setModal('add-financer') }}
      openAddTeam={(fId, fName) => {
        setModalTargetId(fId)
        setTargetFinancerName(fName)
        setModal('add-team')
      }}
      onDeleteTeam={handleDeleteTeam}
    />
  ) : screen === 'Leads' ? (
    <Leads
      leads={leads}
      financers={financers}
      openAdd={() => { setModalTargetId(undefined); setModal('lead') }}
      convert={leadId => { setModalTargetId(leadId); setModal('convert-lead') }}
    />
  ) : screen === 'Loans' ? (
    <Loans
      loans={loans}
      leads={leads}
      openDisburse={id => { setModalTargetId(id); setModal('disburse') }}
      openCreate={() => { setModalTargetId(undefined); setModal('loan') }}
      openConvertLead={leadId => { setModalTargetId(leadId); setModal('convert-lead') }}
      onSuccessCalc={notify}
    />
  ) : screen === 'Scheduled EMIs' ? (
    <ScheduledEmis emis={emisData} onOpenPay={emi => { setPayTargetEmi(emi); setModal('pay-emi') }}/>
  ) : screen === 'Expenses' ? (
    <Expenses
      expenses={expenses}
      availableBalance={masterWallet.available_balance}
      openAdd={() => { setModalTargetId(undefined); setModal('expense') }}
      onApprove={handleApproveExpense}
    />
  ) : screen === 'Profit & Loss' ? (
    <ProfitLoss pnl={pnl} openAddCapital={() => { setModalTargetId(undefined); setModal('capital') }}/>
  ) : (
    <Transactions transactions={transactions}/>
  )

  return (
    <div className={`mobile-app-root ${themeMode}`}>
      <div className="mobile-app-container">
        {screen === 'Dashboard' ? (
          <MobileHome
            masterWallet={masterWallet}
            partners={partners}
            financers={financers}
            activeRole={activeRole}
            setActiveRole={setActiveRole}
            emis={emis}
            loans={loans}
            expenses={expenses}
            transactions={transactions}
            pnl={pnl}
            openAddLead={() => { setModalTargetId(undefined); setModal('lead') }}
            openConvertLead={() => { setModalTargetId(undefined); setModal('convert-lead') }}
            openAddExpense={() => { setModalTargetId(undefined); setModal('expense') }}
            openAddCapital={() => { setModalTargetId(undefined); setModal('capital') }}
            navigate={navigate}
            balanceRevealed={balanceRevealed}
            setBalanceRevealed={setBalanceRevealed}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
            notify={notify}
            onLogout={() => setLoggedIn(false)}
          />
        ) : (
          <div className="mobile-subpage-wrap">
            <div className="mobile-subpage-header">
              <button
                type="button"
                className="mobile-back-btn"
                onClick={() => setScreen('Dashboard')}
                title="Back to Home"
              >
                <Icon name="arrowLeft" size={18}/>
              </button>
              <h3 className="mobile-subpage-title">{screen}</h3>
            </div>
            <div className="mobile-subpage-content">
              {page}
            </div>
          </div>
        )}

        {/* Floating Mobile Bottom Navigation Dock */}
        <nav className="mobile-bottom-dock">
          <button
            type="button"
            className={`dock-item ${screen === 'Capital & Partners' ? 'active' : ''}`}
            onClick={() => setScreen('Capital & Partners')}
            title="Financers & Capital Partners"
          >
            <Icon name="userWallet" size={20}/>
            <span>Financers</span>
          </button>

          <button
            type="button"
            className={`dock-item ${screen === 'Leads' ? 'active' : ''}`}
            onClick={() => setScreen('Leads')}
            title="Leads Pipeline & Attribution"
          >
            <Icon name="leads" size={20}/>
            <span>Leads</span>
          </button>

          {/* Elevated Floating Center Home Button */}
          <button
            type="button"
            className={`dock-item-center ${screen === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setScreen('Dashboard')}
            title="Home Dashboard"
          >
            <Icon name="home" size={24}/>
          </button>

          <button
            type="button"
            className={`dock-item ${screen === 'Scheduled EMIs' ? 'active' : ''}`}
            onClick={() => setScreen('Scheduled EMIs')}
            title="Scheduled EMIs & Collections"
          >
            <Icon name="calendar" size={20}/>
            <span>EMIs</span>
          </button>

          <button
            type="button"
            className={`dock-item ${['Loans', 'Expenses', 'Profit & Loss', 'Transactions'].includes(screen) || moreMenuOpen ? 'active' : ''}`}
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            title="More Modules"
          >
            <Icon name="dots" size={20}/>
            <span>More</span>
          </button>
        </nav>

        {/* More Menu Bottom Sheet */}
        {moreMenuOpen && (
          <div className="mobile-more-sheet" onClick={() => setMoreMenuOpen(false)}>
            <div className="mobile-more-panel" onClick={e => e.stopPropagation()}>
              <div className="mobile-more-title">All Enterprise Modules</div>
              <div className="mobile-more-grid">
                <button
                  type="button"
                  className={`mobile-more-item ${screen === 'Loans' ? 'active' : ''}`}
                  onClick={() => { setScreen('Loans'); setMoreMenuOpen(false) }}
                >
                  <div className="mobile-more-icon violet"><Icon name="loans" size={18}/></div>
                  <span>Loans Portfolio</span>
                </button>
                <button
                  type="button"
                  className={`mobile-more-item ${screen === 'Expenses' ? 'active' : ''}`}
                  onClick={() => { setScreen('Expenses'); setMoreMenuOpen(false) }}
                >
                  <div className="mobile-more-icon amber"><Icon name="expense" size={18}/></div>
                  <span>Expenses</span>
                </button>
                <button
                  type="button"
                  className={`mobile-more-item ${screen === 'Profit & Loss' ? 'active' : ''}`}
                  onClick={() => { setScreen('Profit & Loss'); setMoreMenuOpen(false) }}
                >
                  <div className="mobile-more-icon green"><Icon name="chart" size={18}/></div>
                  <span>Profit & Loss</span>
                </button>
                <button
                  type="button"
                  className={`mobile-more-item ${screen === 'Transactions' ? 'active' : ''}`}
                  onClick={() => { setScreen('Transactions'); setMoreMenuOpen(false) }}
                >
                  <div className="mobile-more-icon blue"><Icon name="transaction" size={18}/></div>
                  <span>Transactions</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <FormModal
          type={modal}
          targetId={modalTargetId}
          targetFinancerName={targetFinancerName}
          targetEmi={payTargetEmi}
          availableBalance={masterWallet.available_balance}
          partners={partners}
          financers={financers}
          activeRole={activeRole}
          leads={leads}
          onClose={() => { setModal(null); setModalTargetId(undefined); setPayTargetEmi(null); setTargetFinancerName('') }}
          onDone={msg => { setModal(null); setModalTargetId(undefined); setPayTargetEmi(null); setTargetFinancerName(''); notify(msg) }}
        />
      )}

      {toast && (
        <div className="toast">
          <span><Icon name="check"/></span>
          {toast}
        </div>
      )}
    </div>
  )
}
