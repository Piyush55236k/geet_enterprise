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
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">{iconPaths[name]}</svg>
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
  transactions,
  openAddCapital
}: {
  masterWallet: { total_capital: number; available_balance: number; allocated_capital: number }
  partners: Partner[]
  transactions: string[][]
  openAddCapital: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query) return transactions
    return transactions.filter(t => t.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [transactions, query])

  return (
    <>
      <PageHeader
        title="Capital & Partners"
        eyebrow="Centralized Fund & Investor Equity"
        actions={
          <div className="header-actions">
            <Button icon="plus" onClick={openAddCapital}>Add capital investment</Button>
            <div className="central-managed"><Icon name="check" size={15}/> Central Master Pool</div>
          </div>
        }
      />
      <div className="wallet-hero">
        <div>
          <span>CENTRALIZED LIQUID BALANCE</span>
          <strong>{money(masterWallet.available_balance)}</strong>
          <small>Central funds available for immediate loan disbursal</small>
        </div>
        <div className="wallet-divider"/>
        <div className="wallet-stat">
          <span>Total Capital Invested</span>
          <strong>{money(masterWallet.total_capital)}</strong>
        </div>
        <div className="wallet-stat">
          <span>Deployed in Loans</span>
          <strong>{money(masterWallet.allocated_capital)}</strong>
        </div>
        <div className="wallet-access">
          <Icon name="wallet" size={17}/>
          <span>Master Balance</span>
          <small>Operating expenses & disbursements debit directly from this pool</small>
        </div>
      </div>

      <SectionCard
        title="Capital Partners & Investors"
        subtitle="Individual capital invested into the centralized balance with dynamic equity share"
        action={<Button icon="plus" variant="secondary" onClick={openAddCapital}>Invest new capital</Button>}
      >
        <div className="three-col" style={{ padding: '16px' }}>
          {partners.map(p => (
            <div className={`user-wallet wallet-${p.theme}`} key={p.id}>
              <div className="user-head">
                <span className="avatar small">{p.name.split(' ').map(x => x[0]).join('')}</span>
                <div>
                  <strong>{p.name}</strong>
                  <small>{p.role}</small>
                </div>
                <Badge status={p.status || 'Active'}/>
              </div>
              <div className="wallet-split">
                <div>
                  <span>Capital Invested</span>
                  <strong>{money(p.capitalInvested)}</strong>
                </div>
                <div>
                  <span>Capital Share</span>
                  <strong style={{ color: 'var(--green)' }}>{p.sharePct}%</strong>
                </div>
              </div>
              <div style={{ margin: '8px 0 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>
                  <span>Pro-rata pool equity</span>
                  <span>{p.sharePct}%</span>
                </div>
                <div className="progress"><span style={{ width: `${Math.min(100, p.sharePct)}%` }}/></div>
              </div>
              <div className="wallet-owner">
                <Icon name="chart" size={14}/>
                <span>Distributed Net Profit: <strong>{money(p.netProfitShare)}</strong> ({p.roiPct}% ROI)</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Central Capital History" subtitle="Disbursements, EMI receipts, capital investments and expenses" action={<SearchFilter placeholder="Search capital history..." value={query} onChange={setQuery}/>}>
        <DataTable headers={['Reference', 'Date', 'Description', 'Party / Source', 'Type', 'Amount', 'Status']} rows={filtered}/>
      </SectionCard>
    </>
  )
}

// -------------------------------------------------------------
// 3. LEADS (ADD LEAD & CONVERT TO LOAN)
// -------------------------------------------------------------

function Leads({
  leads,
  openAdd,
  convert
}: {
  leads: string[][]
  openAdd: () => void
  convert: (id: string, name: string) => void
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query) return leads
    return leads.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [leads, query])

  const qualifiedCount = leads.filter(l => l[6] === 'Qualified').length
  const followUpCount = leads.filter(l => l[6] === 'Follow-up').length
  const convertedCount = leads.filter(l => l[6] === 'Converted').length

  return (
    <>
      <PageHeader
        title="Leads Pipeline"
        eyebrow="Customer Acquisition & Conversion"
        actions={<Button icon="plus" onClick={openAdd}>Add lead</Button>}
      />
      <div className="metrics-grid four">
        <Metric label="Total Leads" value={String(leads.length)} note="Live pipeline"/>
        <Metric label="Qualified Leads" value={String(qualifiedCount)} note="Ready to convert to loan" tone="green"/>
        <Metric label="Converted to Loans" value={String(convertedCount)} note="Loans sanctioned" tone="blue"/>
        <Metric label="Follow-ups Due" value={String(followUpCount)} note="Needs callback" tone="red"/>
      </div>

      <div className="notice" style={{ marginBottom: '16px' }}>
        <Icon name="check"/>
        <div>
          <strong>Convert Lead to Loan Option</strong>
          <span>Clicking "Convert to loan" directly creates a loan proposal in the Loans module with status "Disbursal due", calculates EMIs, and updates lead status to Converted.</span>
        </div>
      </div>

      <SectionCard title="Lead Register" subtitle="Review prospects and convert directly into active loans" action={<SearchFilter placeholder="Search customer or business..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Lead ID', 'Business', 'Contact person', 'Phone', 'Requirement', 'Source', 'Status']}
          rows={filtered}
          action={row => (
            row[6] !== 'Converted' ? (
              <button
                className="table-action"
                style={{
                  background: 'var(--green-soft)',
                  color: 'var(--green-dark)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
                onClick={() => convert(row[0], row[1])}
              >
                Convert to loan →
              </button>
            ) : (
              <span className="badge badge-success"><span className="badge-dot"/>Converted</span>
            )
          )}
        />
      </SectionCard>
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
  const unconvertedLeads = useMemo(() => leads.filter(l => l[6] !== 'Converted'), [leads])

  const filtered = useMemo(() => {
    if (!query) return loans
    return loans.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [loans, query])

  return (
    <>
      <PageHeader
        title="Loans Portfolio"
        eyebrow="Lending & Funding Engine"
        actions={
          <div className="header-actions">
            <Button icon="leads" variant="secondary" onClick={() => openConvertLead()}>
              Convert lead to loan
            </Button>
            <Button icon="plus" onClick={openCreate}>
              Create direct loan
            </Button>
          </div>
        }
      />
      <div className="metrics-grid four">
        <Metric label="Total Loans Portfolio" value={money(loans.reduce((acc, l) => acc + (Number(l[3].replace(/[^0-9]/g, '')) || 0), 0) || 4500000)} note={`${loans.length} total loans`}/>
        <Metric label="Active Loans" value={String(loans.filter(l => l[7] === 'Active').length)} note="Performing loans" tone="green"/>
        <Metric label="Disbursals Due" value={String(loans.filter(l => l[7] === 'Disbursal due').length)} note="Requires fund release" tone="red"/>
        <Metric label="Leads Ready to Convert" value={String(unconvertedLeads.length)} note="In acquisition pipeline" tone="blue"/>
      </div>

      {/* Leads Option to Convert to Loan directly in Loans View */}
      <SectionCard
        title={`Convert Leads into Loans (${unconvertedLeads.length} Available)`}
        subtitle="Prospects created in Leads module that can be directly converted into active loan proposals with all EMIs"
        action={
          unconvertedLeads.length > 0 ? (
            <Button icon="leads" variant="secondary" onClick={() => openConvertLead()}>
              Convert via modal
            </Button>
          ) : undefined
        }
      >
        {unconvertedLeads.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>
            All leads have been converted into active loans. You can add new leads in the Leads tab.
          </div>
        ) : (
          <DataTable
            headers={['Lead ID', 'Business', 'Contact person', 'Phone', 'Requirement', 'Source', 'Status']}
            rows={unconvertedLeads}
            action={row => (
              <button
                className="table-action"
                style={{
                  background: 'var(--green)',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
                onClick={() => openConvertLead(row[0])}
              >
                Convert to loan →
              </button>
            )}
          />
        )}
      </SectionCard>

      <SectionCard title="Loan Portfolio" subtitle="All customer loans, disbursal status and EMI schedules" action={<SearchFilter placeholder="Search loan ID or customer..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Loan ID', 'Business', 'Customer', 'Principal', 'ROI', 'Tenure', 'EMI', 'Status']}
          rows={filtered}
          action={row => row[7] === 'Disbursal due' ? (
            <button
              className="table-action"
              style={{
                background: 'var(--green)',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '4px',
                fontWeight: 700
              }}
              onClick={() => openDisburse(row[0])}
            >
              Disburse now
            </button>
          ) : (
            <button className="table-action" onClick={() => alert(`Loan details: ${row[0]} · Business: ${row[1]} · Status: ${row[7]}`)}>
              View details
            </button>
          )}
        />
      </SectionCard>

      {/* Advanced Funding Calculator matching reference specifications */}
      <SectionCard title="Funding Calculator Engine" subtitle="Calculate total return, advance deductions, and net in-hand disbursement">
        <FundingEngine leads={leads} onSuccess={onSuccessCalc}/>
      </SectionCard>
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

  const counts = useMemo(() => {
    return {
      all: emis.length,
      paid: emis.filter(e => e.status === 'Paid').length,
      upcoming: emis.filter(e => e.status === 'Upcoming' || e.status === 'Scheduled').length,
      overdue: emis.filter(e => e.status === 'Overdue').length,
    }
  }, [emis])

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

  const rows = filtered.map(e => [
    `#${e.installment_num || 1}`,
    e.due_date,
    e.customer,
    e.loan_id,
    money(e.amount),
    money(e.cumulative_paid || e.amount),
    money(e.balance || 0),
    e.status,
    e.utr || '—'
  ])

  return (
    <>
      <PageHeader
        title="Scheduled EMIs"
        eyebrow="Repayment Calendar & Collections"
        actions={<Button icon="download" variant="secondary" onClick={() => window.print()}>Export schedule</Button>}
      />
      <div className="metrics-grid four">
        <Metric label="Due This Period" value={money(totalDue || 842600)} note={`${emis.length} installments`}/>
        <Metric label="Collected to Central Balance" value={money(totalPaid)} note={`${counts.paid} installments collected`} tone="green"/>
        <Metric label="Upcoming Collections" value={money(totalUpcoming)} note={`${counts.upcoming} pending`} tone="blue"/>
        <Metric label="Overdue" value={money(totalOverdue)} note={`${counts.overdue} overdue accounts`} tone="red"/>
      </div>

      <div className="date-strip">
        {[
          { id: 'All', label: `All installments · ${counts.all}` },
          { id: 'Paid', label: `Paid · ${counts.paid}` },
          { id: 'Upcoming', label: `Upcoming · ${counts.upcoming}` },
          { id: 'Overdue', label: `Overdue · ${counts.overdue}` },
        ].map(tab => (
          <button
            className={filterTab === tab.id ? 'active' : ''}
            key={tab.id}
            onClick={() => setFilterTab(tab.id as typeof filterTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SectionCard
        title="EMI Repayments Register"
        subtitle="Submit Bank UTR reference to mark installment as Paid and credit directly into Centralized Liquid Balance"
        action={<SearchFilter placeholder="Search customer, loan ID or UTR..." value={query} onChange={setQuery}/>}
      >
        <DataTable
          headers={['#', 'Due date', 'Customer', 'Loan ID', 'Amount', 'Cumulative Paid', 'Balance', 'Status', 'UTR Ref']}
          rows={rows}
          action={(row, index) => {
            const item = filtered[index]
            if (!item) return null
            if (item.status === 'Paid') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span className="badge badge-success"><span className="badge-dot"/>Paid</span>
                  {item.utr ? (
                    <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700, fontFamily: 'monospace' }}>
                      UTR: {item.utr}
                    </span>
                  ) : null}
                  {item.paid_date ? (
                    <span style={{ fontSize: '9px', color: 'var(--muted)' }}>{item.paid_date}</span>
                  ) : null}
                </div>
              )
            }
            return (
              <button
                className="table-action"
                style={{
                  background: 'var(--green)',
                  color: 'white',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onClick={() => onOpenPay(item)}
              >
                Record Payment (Submit UTR) →
              </button>
            )
          }}
        />
      </SectionCard>
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
      <PageHeader
        title="Enterprise Expenses"
        eyebrow="Operating & Administrative Outflows"
        actions={<Button icon="plus" onClick={openAdd}>Add expense</Button>}
      />
      <div className="metrics-grid four">
        <Metric label="Total Operating Expenses" value={money(totalSpent)} trend="-2.1%" tone="red"/>
        <Metric label="Direct Central Balance Debits" value={money(totalSpent)} note="Debited from master pool" tone="blue"/>
        <Metric label="Central Balance Available" value={money(availableBalance)} note="Funds remaining" tone="green"/>
        <Metric label="Monthly Budget" value="₹2,00,000" note={`${Math.round((totalSpent / 200000) * 100)}% utilized`}/>
      </div>

      <div className="notice" style={{ background: '#f0fdf4', borderColor: '#22c55e', color: '#15803d' }}>
        <Icon name="check"/>
        <div>
          <strong>Direct Centralized Balance Debit (Single User System)</strong>
          <span>All operating expenses debit directly from the enterprise Centralized Balance (Master Fund). No individual user wallet is involved. Debited amounts reduce the net profit distributable to capital partners.</span>
        </div>
      </div>

      <SectionCard title="Expense Register" subtitle="Operational expenses, receipts, and direct central fund deductions" action={<SearchFilter placeholder="Search expenses..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Expense ID', 'Date', 'Description', 'Category', 'Amount', 'Submitted by', 'Status']}
          rows={filtered}
          action={row => row[6] === 'Pending' ? (
            <button className="table-action" onClick={() => onApprove(row[0])}>Approve & Debit</button>
          ) : (
            <button className="table-action" onClick={() => alert(`Receipt verified in server/uploads for ${row[0]}`)}>View receipt</button>
          )}
        />
      </SectionCard>
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
      <PageHeader
        title="Profit & Loss Statement"
        eyebrow="Financial Performance & Capital Distribution"
        actions={
          <div className="header-actions">
            <select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option>FY 2024–25 (Consolidated)</option>
              <option>Q4 Current Quarter</option>
              <option>This Month</option>
            </select>
            <Button icon="plus" onClick={openAddCapital}>Add capital</Button>
            <Button icon="download" variant="secondary" onClick={() => window.print()}>Export statement</Button>
          </div>
        }
      />

      <div className="metrics-grid four">
        <Metric label="Total Capital Invested" value={money(pnl.totalCapitalInvested)} note="Combined partner equity"/>
        <Metric label="Gross Revenue" value={money(pnl.grossRevenue)} note={`Interest: ${money(pnl.interestEarned)} + Fees: ${money(pnl.processingFees)}`} trend="+14.2%" tone="green"/>
        <Metric label="Operating Expenses" value={money(pnl.totalExpenses)} note="Debited from central balance" trend="-2.1%" tone="red"/>
        <Metric label="Net Distributable Profit" value={money(pnl.netProfit)} note={`${pnl.profitMargin}% enterprise margin`} trend="+18.6%" tone="green"/>
      </div>

      {/* Capital-Based Profit & Loss Distribution Breakdown */}
      <SectionCard
        title="Capital-Based Profit & Loss Distribution"
        subtitle="Net profit or loss is distributed dynamically pro-rata based on the exact capital invested by each user / partner"
        action={<Button icon="plus" variant="secondary" onClick={openAddCapital}>Invest capital</Button>}
      >
        <div style={{ padding: '0 16px 8px' }}>
          <div style={{ background: '#f8faf8', padding: '12px 16px', border: '1px solid var(--line)', marginBottom: '14px', fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <span>Distribution Formula: <strong>Partner Share % = (Partner Capital ÷ Total Capital) × 100</strong></span>
            <span>Net Profit Distributed = <strong>{money(pnl.netProfit)}</strong></span>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Partner / Investor</th>
                <th>Capital Invested</th>
                <th>Capital Share (%)</th>
                <th>Gross Earnings Share</th>
                <th>Operating Expense Share</th>
                <th>Net Distributed Profit</th>
                <th>Annual ROI</th>
                <th>Payout Status</th>
              </tr>
            </thead>
            <tbody>
              {pnl.distribution.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="avatar small">{p.name.split(' ').map(x => x[0]).join('')}</span>
                      <div>
                        <strong style={{ fontSize: '12px' }}>{p.name}</strong>
                        <div style={{ fontSize: '9px', color: 'var(--muted)' }}>{p.role}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>{money(p.capitalInvested)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, width: '45px' }}>{p.sharePct}%</span>
                      <div className="progress" style={{ width: '60px', height: '6px' }}>
                        <span style={{ width: `${Math.min(100, p.sharePct)}%` }}/>
                      </div>
                    </div>
                  </td>
                  <td>{money(p.grossShare)}</td>
                  <td style={{ color: 'var(--red)' }}>−{money(p.expenseShare)}</td>
                  <td>
                    <strong style={{ color: p.netProfitShare >= 0 ? '#176b4d' : 'var(--red)', fontSize: '13px' }}>
                      {p.netProfitShare >= 0 ? '+' : ''}{money(p.netProfitShare)}
                    </strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--green)' }}>{p.roiPct}%</span>
                  </td>
                  <td>
                    <Badge status={p.status}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="two-col report-grid" style={{ marginTop: '16px' }}>
        <SectionCard title="Revenue vs Expenses Comparison" subtitle="Monthly movement">
          <div className="grouped-bars">
            {['Oct','Nov','Dec','Jan','Feb','Mar'].map((m,i)=>(
              <div key={m}>
                <div>
                  <span className="income" style={{height:`${55+i*7}%`}}/>
                  <span className="cost" style={{height:`${25+i*2}%`}}/>
                </div>
                <small>{m}</small>
              </div>
            ))}
          </div>
          <div className="chart-legend centered">
            <span><i className="dot green"/>Gross Revenue (Interest & Fees)</span>
            <span><i className="dot navy"/>Operating Expenses</span>
          </div>
        </SectionCard>

        <SectionCard title="Portfolio Return Summary" subtitle="Key financial indicators">
          <div className="pnl-list">
            <div><span>Total Invested Capital</span><strong>{money(pnl.totalCapitalInvested)}</strong></div>
            <div><span>Gross Interest Earned</span><strong>{money(pnl.interestEarned)}</strong></div>
            <div><span>Sanction & Processing Fees</span><strong>{money(pnl.processingFees)}</strong></div>
            <div><span>Operating Expenses (Central Debit)</span><strong>{money(pnl.totalExpenses)}</strong></div>
            <div><span>Net Distributed Profit</span><strong style={{ color: 'var(--green)' }}>{money(pnl.netProfit)}</strong></div>
          </div>
        </SectionCard>
      </div>
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
      <PageHeader
        title="Financial Transactions"
        eyebrow="Central Master Ledger"
        actions={<Button icon="download" variant="secondary" onClick={exportCsv}>Export CSV</Button>}
      />
      <div className="ledger-balance">
        <div><span>Total Credits (Inflow)</span><strong>₹18,42,650</strong><small>EMIs & Capital Added</small></div>
        <div><span>Total Debits (Outflow)</span><strong>₹14,86,200</strong><small>Disbursements & Expenses</small></div>
        <div><span>Net Movement</span><strong>+₹3,56,450</strong><small>Positive liquidity</small></div>
      </div>
      <SectionCard title="Master Ledger" subtitle={`${filtered.length} transactions recorded`} action={<div className="toolbar"><label className="search-field"><Icon name="search" size={17}/><input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search ledger..."/></label><Button variant="secondary" icon="filter">Filters</Button></div>}>
        <DataTable headers={['Reference','Date','Description','Party / Source','Type','Amount','Status']} rows={visible}/>
        <div className="pagination">
          <span>Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
          <div>
            <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={page === p ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      </SectionCard>
    </>
  )
}

// -------------------------------------------------------------
// MODALS (FORM HANDLERS)
// -------------------------------------------------------------

function Modal({ title, subtitle, children, onClose, large }: { title: string; subtitle: string; children: ReactNode; onClose: () => void; large?: boolean }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className={`modal ${large ? 'large' : ''}`} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></div>{children}</div></div>
}

function FormModal({
  type,
  targetId,
  targetEmi,
  availableBalance,
  partners,
  leads,
  onClose,
  onDone
}: {
  type: string
  targetId?: string
  targetEmi?: EmiItem | null
  availableBalance: number
  partners: Partner[]
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
            status: leadStatus
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Lead "${leadBusiness}" added successfully!`)
        } else {
          alert(data.error || 'Failed to save lead')
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



  return (
    <Modal title="Add New Lead" subtitle="Capture prospect details and loan requirements" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="form-grid">
          <label>Business name<input type="text" value={leadBusiness} onChange={e => setLeadBusiness(e.target.value)} placeholder="Registered business name" required/></label>
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
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Add lead'}</Button>
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
            <div className="mobile-greeting-title">Welcome</div>
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
              AD
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
                <strong style={{ display: 'block', fontSize: '13px' }}>Administrator</strong>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>admin@geetenterprise.in</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => { setProfileDropdown(false); navigate('Capital & Partners') }}
                style={{ background: '#f8faf8', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px', fontSize: '10px', cursor: 'pointer', textAlign: 'left' }}
              >
                💼 Capital Partners
              </button>
              <button
                type="button"
                onClick={() => { setProfileDropdown(false); navigate('Profit & Loss') }}
                style={{ background: '#f8faf8', border: '1px solid var(--line)', borderRadius: '6px', padding: '6px', fontSize: '10px', cursor: 'pointer', textAlign: 'left' }}
              >
                📊 P&L Statement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Centralized Capital Card matching reference styling */}
      <div className="mobile-card-carousel">
        {/* Main Master Capital Card */}
        <div className="mobile-bank-card">
          <div className="mobile-card-decor"/>
          <div className="mobile-card-head">
            <div>
              <span className="mobile-card-eyebrow">CENTRALIZED MASTER WALLET</span>
              <h4 className="mobile-card-title">Geet Capital Pool</h4>
            </div>
            <button
              type="button"
              className="mobile-card-options-btn"
              title="Add Capital Investment"
              onClick={openAddCapital}
            >
              <Icon name="plus" size={16}/>
            </button>
          </div>

          <div className="mobile-card-mid">
            <button
              type="button"
              className="mobile-balance-pill"
              onClick={() => setBalanceRevealed(!balanceRevealed)}
            >
              <Icon name={balanceRevealed ? 'eyeOff' : 'eye'} size={14}/>
              {balanceRevealed ? 'Hide Balance' : 'Click for Balance'}
            </button>

            {balanceRevealed ? (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'Manrope', color: '#ffffff' }}>
                  {money(masterWallet.available_balance)}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                  Liquid available for immediate loan disbursals
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '4px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                ₹ ••••••••
              </div>
            )}
          </div>

          <div className="mobile-card-foot">
            <div>
              <span style={{ fontSize: '9px', opacity: 0.75, display: 'block' }}>TOTAL CAPITAL</span>
              <strong style={{ fontSize: '12px', letterSpacing: '0.5px' }}>{money(masterWallet.total_capital)}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '9px', opacity: 0.75, display: 'block' }}>DEPLOYED IN LOANS</span>
              <strong style={{ fontSize: '12px', letterSpacing: '0.5px' }}>{money(masterWallet.allocated_capital)}</strong>
            </div>
          </div>
        </div>

        {/* Secondary Card: Active Loans Portfolio */}
        <div
          className="mobile-bank-card secondary-card"
          onClick={() => navigate('Loans')}
          style={{ cursor: 'pointer' }}
        >
          <div className="mobile-card-decor"/>
          <div className="mobile-card-head">
            <div>
              <span className="mobile-card-eyebrow">PORTFOLIO</span>
              <h4 className="mobile-card-title">Active Loans</h4>
            </div>
            <span style={{ fontSize: '9px', background: 'rgba(255,255,255,0.18)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
              {loans.length} Loans
            </span>
          </div>
          <div className="mobile-card-mid">
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Manrope' }}>
              {money(masterWallet.allocated_capital)}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              130% Multiplier · 15D EMI Schedule
            </div>
          </div>
          <div className="mobile-card-foot">
            <span style={{ fontSize: '11px', opacity: 0.85 }}>GEET ENTERPRISE</span>
            <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700 }}>Tap to view loans →</span>
          </div>
        </div>
      </div>

      {/* 3. 4 Circular Quick Action Buttons from Reference Design */}
      <div className="mobile-quick-actions">
        <button type="button" className="quick-action-item" onClick={openAddLead}>
          <div className="quick-action-circle">
            <div className="quick-icon-ring green">
              <Icon name="transfer" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Transfer</span>
        </button>

        <button type="button" className="quick-action-item" onClick={openConvertLead}>
          <div className="quick-action-circle">
            <div className="quick-icon-ring red">
              <Icon name="request" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Request</span>
        </button>

        <button type="button" className="quick-action-item" onClick={() => navigate('Scheduled EMIs')}>
          <div className="quick-action-circle">
            <div className="quick-icon-ring blue">
              <Icon name="exchange" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Exchange</span>
        </button>

        <button type="button" className="quick-action-item" onClick={openAddExpense}>
          <div className="quick-action-circle">
            <div className="quick-icon-ring amber">
              <Icon name="bills" size={17}/>
            </div>
          </div>
          <span className="quick-action-label">Bills</span>
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
  const [toast, setToast] = useState('')
  const [serverOnline, setServerOnline] = useState(false)

  // Master State
  const [masterWallet, setMasterWallet] = useState({ total_capital: 4575000, available_balance: 1435450, allocated_capital: 3139550 })
  const [partners, setPartners] = useState<Partner[]>([
    { id: 'u1', name: 'Amit Sharma', role: 'Managing Partner & Investor', theme: 'violet', capitalInvested: 2000000, sharePct: 43.72, grossShare: 207100, expenseShare: 52267, netProfitShare: 154833, roiPct: 7.74, status: 'Profitable' },
    { id: 'u2', name: 'Priya Mehta', role: 'Senior Partner & Investor', theme: 'amber', capitalInvested: 1500000, sharePct: 32.79, grossShare: 155325, expenseShare: 39200, netProfitShare: 116125, roiPct: 7.74, status: 'Profitable' },
    { id: 'u3', name: 'Rohan Khanna', role: 'Capital Partner & Investor', theme: 'cyan', capitalInvested: 1075000, sharePct: 23.50, grossShare: 111319, expenseShare: 28094, netProfitShare: 83225, roiPct: 7.74, status: 'Profitable' }
  ])
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

        if (d.leads?.length) {
          setLeads(d.leads.map((l: { id: string; business: string; contact_person: string; phone: string; requirement: number; source: string; status: string }) => [
            l.id,
            l.business,
            l.contact_person,
            l.phone,
            money(l.requirement),
            l.source,
            l.status
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
      transactions={transactions}
      openAddCapital={() => { setModalTargetId(undefined); setModal('capital') }}
    />
  ) : screen === 'Leads' ? (
    <Leads
      leads={leads}
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
          >
            <Icon name="cards" size={20}/>
            <span>Cards</span>
          </button>

          <button
            type="button"
            className={`dock-item ${screen === 'Leads' ? 'active' : ''}`}
            onClick={() => setScreen('Leads')}
          >
            <Icon name="activity" size={20}/>
            <span>Activity</span>
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
          >
            <Icon name="payments" size={20}/>
            <span>Payments</span>
          </button>

          <button
            type="button"
            className={`dock-item ${['Loans', 'Expenses', 'Profit & Loss', 'Transactions'].includes(screen) ? 'active' : ''}`}
            onClick={() => {
              if (screen === 'Loans') setScreen('Expenses')
              else if (screen === 'Expenses') setScreen('Profit & Loss')
              else if (screen === 'Profit & Loss') setScreen('Transactions')
              else setScreen('Loans')
            }}
          >
            <Icon name="dots" size={20}/>
            <span>More</span>
          </button>
        </nav>
      </div>

      {modal && (
        <FormModal
          type={modal}
          targetId={modalTargetId}
          targetEmi={payTargetEmi}
          availableBalance={masterWallet.available_balance}
          partners={partners}
          leads={leads}
          onClose={() => { setModal(null); setModalTargetId(undefined); setPayTargetEmi(null) }}
          onDone={msg => { setModal(null); setModalTargetId(undefined); setPayTargetEmi(null); notify(msg) }}
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
