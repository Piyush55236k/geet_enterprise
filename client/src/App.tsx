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
  | 'menu' | 'close' | 'check' | 'upload' | 'arrowRight'

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

function DataTable({ headers, rows, action }: { headers: string[]; rows: string[][]; action?: (row: string[]) => ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}{action && <th>Action</th>}</tr></thead>
    <tbody>
      {rows.length === 0 ? (
        <tr><td colSpan={headers.length + (action ? 1 : 0)} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>No records found.</td></tr>
      ) : (
        rows.map((row, i) => <tr key={`${row[0]}-${i}`}>{row.map((cell, j) => <td key={j}>{j === row.length - 1 ? <Badge status={cell}/> : cell}</td>)}{action && <td>{action(row)}</td>}</tr>)
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
// 4. LOANS & FUNDING CALCULATOR
// -------------------------------------------------------------

function Loans({
  loans,
  leads,
  openDisburse,
  openCreate,
  openConvertLead,
  onConvertLead,
  onApplyCalc
}: {
  loans: string[][]
  leads: string[][]
  openDisburse: (loanId: string) => void
  openCreate: () => void
  openConvertLead: (leadId?: string) => void
  onConvertLead: (id: string, name: string) => void
  onApplyCalc: (c: { principal: number; roi: number; tenure: number; emi: number; business: string; leadId?: string }) => void
}) {
  const [query, setQuery] = useState('')
  const unconvertedLeads = useMemo(() => leads.filter(l => l[6] !== 'Converted'), [leads])
  const [selectedLeadId, setSelectedLeadId] = useState('')

  // Funding Calculator State (supporting clean inputs & zero scroll wheel bugs)
  const [calcBusiness, setCalcBusiness] = useState('')
  const [loanApproved, setLoanApproved] = useState('1000000')
  const [rateMultiplier, setRateMultiplier] = useState('130')
  const [tenureDays, setTenureDays] = useState('105')
  const [cycleDays, setCycleDays] = useState('15')
  const [pfPercent, setPfPercent] = useState('5')
  const [advanceMode, setAdvanceMode] = useState<'None' | 'Full 1 EMI' | 'Half EMI' | 'By Net In-Hand' | 'By Advance'>('By Net In-Hand')
  const [netInHandTarget, setNetInHandTarget] = useState('800000')

  // Calculation Math
  const principalNum = Math.max(0, Number(loanApproved) || 0)
  const multiplierNum = Math.max(100, Number(rateMultiplier) || 130)
  const daysNum = Math.max(1, Number(tenureDays) || 105)
  const freqNum = Math.max(1, Number(cycleDays) || 15)

  // Total Return Amount
  const totalReturn = Math.round(principalNum * (multiplierNum / 100))
  // Base installments
  const baseEmisCount = Math.max(1, Math.round(daysNum / freqNum))
  const baseEmiAmount = Math.round(totalReturn / baseEmisCount)

  // Processing Fee
  const pfAmount = Math.round(principalNum * (Number(pfPercent) / 100))

  // Advance deduction & Net in-hand
  let advanceAmount = 0
  let payableEmis = baseEmisCount

  if (advanceMode === 'Full 1 EMI') {
    advanceAmount = baseEmiAmount
    payableEmis = Math.max(1, baseEmisCount - 1)
  } else if (advanceMode === 'Half EMI') {
    advanceAmount = Math.round(baseEmiAmount * 0.5)
  } else if (advanceMode === 'By Net In-Hand') {
    const desiredNet = Number(netInHandTarget) || 800000
    advanceAmount = Math.max(0, principalNum - pfAmount - desiredNet)
    payableEmis = Math.max(1, baseEmisCount - 1)
  } else if (advanceMode === 'By Advance') {
    advanceAmount = 150000
    payableEmis = Math.max(1, baseEmisCount - 1)
  }

  const netInHand = Math.max(0, principalNum - pfAmount - advanceAmount)
  const remainingRepayment = totalReturn - advanceAmount
  const adjustedPerEmi = Math.round(remainingRepayment / payableEmis)

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
        subtitle="Prospects created in Leads module that can be directly converted into active loan proposals"
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
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="table-action"
                  style={{
                    background: 'var(--green)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}
                  onClick={() => onConvertLead(row[0], row[1])}
                >
                  Convert to loan →
                </button>
                <button
                  className="table-action"
                  style={{
                    background: '#f1f5f9',
                    color: 'var(--ink)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}
                  onClick={() => {
                    setSelectedLeadId(row[0])
                    setCalcBusiness(row[1])
                    const raw = row[4].replace(/[^0-9]/g, '')
                    if (raw) setLoanApproved(raw)
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                  }}
                >
                  Load in Calc
                </button>
              </div>
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
        <div className="calculator">
          <div className="calc-inputs" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <label style={{ gridColumn: '1/3' }}>
              Select Lead to Convert into Loan (Optional)
              <select
                value={selectedLeadId}
                onChange={e => {
                  const id = e.target.value
                  setSelectedLeadId(id)
                  const found = leads.find(l => l[0] === id)
                  if (found) {
                    setCalcBusiness(found[1])
                    const raw = found[4].replace(/[^0-9]/g, '')
                    if (raw) setLoanApproved(raw)
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
            </label>

            <label>
              Borrower Business / Customer
              <input
                type="text"
                value={calcBusiness}
                onChange={e => setCalcBusiness(e.target.value)}
                placeholder="e.g. Jain Enterprises"
              />
            </label>

            <label>
              Loan Amount Approved (₹)
              <input
                type="number"
                value={loanApproved}
                onWheel={e => (e.target as HTMLElement).blur()}
                onChange={e => {
                  let v = e.target.value
                  if (v.length > 1 && v.startsWith('0') && !v.startsWith('0.')) v = v.replace(/^0+/, '')
                  setLoanApproved(v)
                }}
                placeholder="1000000"
              />
            </label>

            <label>
              Rate Multiplier (% Total Return)
              <input
                type="number"
                value={rateMultiplier}
                onWheel={e => (e.target as HTMLElement).blur()}
                onChange={e => {
                  let v = e.target.value
                  if (v.length > 1 && v.startsWith('0') && !v.startsWith('0.')) v = v.replace(/^0+/, '')
                  setRateMultiplier(v)
                }}
                placeholder="130"
              />
              <small style={{ color: 'var(--muted)', fontSize: '9px' }}>Multiplier: {multiplierNum}% Total Return</small>
            </label>

            <label>
              Tenure (Days)
              <input
                type="number"
                value={tenureDays}
                onWheel={e => (e.target as HTMLElement).blur()}
                onChange={e => setTenureDays(e.target.value)}
                placeholder="105"
              />
            </label>

            <label>
              EMI Frequency (Days)
              <input
                type="number"
                value={cycleDays}
                onWheel={e => (e.target as HTMLElement).blur()}
                onChange={e => setCycleDays(e.target.value)}
                placeholder="15"
              />
              <small style={{ color: 'var(--muted)', fontSize: '9px' }}>{daysNum} days ÷ {freqNum} = {baseEmisCount} Base EMIs</small>
            </label>

            <label>
              Processing Fee (PF %)
              <select value={pfPercent} onChange={e => setPfPercent(e.target.value)}>
                <option value="2">2% Processing Fee ({money(principalNum * 0.02)})</option>
                <option value="3">3% Processing Fee ({money(principalNum * 0.03)})</option>
                <option value="5">5% Processing Fee ({money(principalNum * 0.05)})</option>
                <option value="0">No Processing Fee</option>
              </select>
            </label>

            <div style={{ gridColumn: '1/3' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Advance EMI / Net Hand Deduction Mode
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {(['None', 'Full 1 EMI', 'Half EMI', 'By Net In-Hand', 'By Advance'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAdvanceMode(mode)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: '1px solid var(--line)',
                      background: advanceMode === mode ? 'var(--green)' : 'white',
                      color: advanceMode === mode ? 'white' : 'var(--ink)',
                      borderRadius: '4px'
                    }}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {advanceMode === 'By Net In-Hand' && (
              <label style={{ gridColumn: '1/3' }}>
                Net In-Hand Target Amount (₹)
                <input
                  type="number"
                  value={netInHandTarget}
                  onWheel={e => (e.target as HTMLElement).blur()}
                  onChange={e => {
                    let v = e.target.value
                    if (v.length > 1 && v.startsWith('0')) v = v.replace(/^0+/, '')
                    setNetInHandTarget(v)
                  }}
                  placeholder="800000"
                />
              </label>
            )}
          </div>

          <div className="calc-results">
            <div>
              <span>Loan Amount (Sanctioned)</span>
              <strong>{money(principalNum)}</strong>
            </div>
            <div>
              <span>Total Return ({multiplierNum}%)</span>
              <strong style={{ color: 'var(--amber)' }}>{money(totalReturn)}</strong>
            </div>
            <div>
              <span>Processing Fee ({pfPercent}%)</span>
              <strong>{money(pfAmount)}</strong>
            </div>
            <div>
              <span>Advance Deducted Upfront</span>
              <strong>{money(advanceAmount)}</strong>
            </div>
            <div>
              <span>Payable Installments</span>
              <strong>{payableEmis} EMIs (@ {freqNum} Days)</strong>
            </div>
            <div>
              <span>Per Installment</span>
              <strong>{money(adjustedPerEmi)}</strong>
            </div>
            <div className="net">
              <div>
                <span style={{ fontSize: '10px', color: '#176b4d', fontWeight: 700 }}>NET IN-HAND DISBURSEMENT AMOUNT</span>
                <strong style={{ fontSize: '20px', color: '#176b4d' }}>{money(netInHand)}</strong>
              </div>
              <small style={{ fontSize: '9px', color: '#176b4d' }}>
                Formula: Loan ({money(principalNum)}) − PF ({money(pfAmount)}) − Advance ({money(advanceAmount)})
              </small>
            </div>
          </div>
        </div>

        <div className="schedule-preview">
          <strong>Summary:</strong>
          <span>Remaining Repayment: {money(remainingRepayment)}</span>
          <span>{payableEmis} EMIs of {money(adjustedPerEmi)}</span>
          <Button
            variant="secondary"
            onClick={() => onApplyCalc({
              principal: principalNum,
              roi: Math.round(((totalReturn - principalNum) / (principalNum || 1)) * (365 / daysNum) * 100),
              tenure: Math.max(1, Math.round(daysNum / 30)),
              emi: adjustedPerEmi,
              business: calcBusiness.trim() || 'New Proposal',
              leadId: selectedLeadId || undefined
            })}
          >
            {selectedLeadId ? `Convert "${calcBusiness}" to Loan Proposal` : 'Create this loan proposal'}
          </Button>
        </div>
      </SectionCard>
    </>
  )
}

// -------------------------------------------------------------
// 5. SCHEDULED EMIS
// -------------------------------------------------------------

function ScheduledEmis({
  emis,
  onPay
}: {
  emis: string[][]
  onPay: (loanId: string, cust: string) => void
}) {
  const [filterTab, setFilterTab] = useState<'All' | 'Paid' | 'Upcoming' | 'Overdue' | 'Partial'>('All')
  const [query, setQuery] = useState('')

  const counts = useMemo(() => {
    return {
      all: emis.length,
      paid: emis.filter(e => e[6] === 'Paid').length,
      upcoming: emis.filter(e => e[6] === 'Upcoming').length,
      overdue: emis.filter(e => e[6] === 'Overdue').length,
      partial: emis.filter(e => e[6] === 'Partial').length,
    }
  }, [emis])

  const filtered = useMemo(() => {
    return emis.filter(e => {
      const matchesTab = filterTab === 'All' || e[6].toLowerCase() === filterTab.toLowerCase()
      const matchesQuery = !query || e.join(' ').toLowerCase().includes(query.toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [emis, filterTab, query])

  return (
    <>
      <PageHeader
        title="Scheduled EMIs"
        eyebrow="Repayment Calendar & Collections"
        actions={<Button icon="download" variant="secondary" onClick={() => window.print()}>Export schedule</Button>}
      />
      <div className="metrics-grid four">
        <Metric label="Due This Period" value="₹8,42,600" note={`${emis.length} installments`}/>
        <Metric label="Collected to Central Balance" value="₹5,68,350" note={`${counts.paid} installments collected`} tone="green"/>
        <Metric label="Upcoming Collections" value="₹1,48,000" note={`${counts.upcoming} pending`} tone="blue"/>
        <Metric label="Overdue" value="₹1,26,250" note={`${counts.overdue} overdue accounts`} tone="red"/>
      </div>

      <div className="date-strip">
        {[
          { id: 'All', label: `All installments · ${counts.all}` },
          { id: 'Paid', label: `Paid · ${counts.paid}` },
          { id: 'Upcoming', label: `Upcoming · ${counts.upcoming}` },
          { id: 'Overdue', label: `Overdue · ${counts.overdue}` },
          { id: 'Partial', label: `Partial · ${counts.partial}` },
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

      <SectionCard title="EMI Repayments Register" subtitle="Click 'Record payment' to collect EMI directly into the centralized balance" action={<SearchFilter placeholder="Search customer or loan..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Due date', 'Customer', 'Loan ID', 'Principal', 'Interest', 'Amount', 'Status']}
          rows={filtered}
          action={row => (
            row[6] === 'Paid' ? (
              <span className="badge badge-success"><span className="badge-dot"/>Received</span>
            ) : (
              <button
                className="table-action"
                style={{
                  background: 'var(--green-soft)',
                  color: 'var(--green-dark)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}
                onClick={() => onPay(row[2], row[1])}
              >
                Record payment →
              </button>
            )
          )}
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
          <div style={{ background: '#f8faf8', padding: '12px 16px', border: '1px solid var(--line)', marginBottom: '14px', fontSize: '11px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></div>{children}</div></div>
}

function FormModal({
  type,
  targetId,
  availableBalance,
  partners,
  leads,
  onClose,
  onDone
}: {
  type: string
  targetId?: string
  availableBalance: number
  partners: Partner[]
  leads: string[][]
  onClose: () => void
  onDone: (message: string) => void
}) {
  const [submitting, setSubmitting] = useState(false)

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

  // New Loan Form State
  const unconvertedLeads = useMemo(() => leads.filter(l => l[6] !== 'Converted'), [leads])
  const [loanSourceMode, setLoanSourceMode] = useState<'lead' | 'direct'>(type === 'convert-lead' || unconvertedLeads.length > 0 ? 'lead' : 'direct')
  const [selectedLeadId, setSelectedLeadId] = useState(targetId || (unconvertedLeads[0]?.[0] || ''))

  const [loanBusiness, setLoanBusiness] = useState('')
  const [loanCustomer, setLoanCustomer] = useState('')
  const [loanPrincipal, setLoanPrincipal] = useState('750000')
  const [loanRoi, setLoanRoi] = useState('18')
  const [loanTenure, setLoanTenure] = useState('12')

  useEffect(() => {
    if (loanSourceMode === 'lead' && selectedLeadId) {
      const found = leads.find(l => l[0] === selectedLeadId)
      if (found) {
        setLoanBusiness(found[1])
        setLoanCustomer(found[2])
        const rawAmt = found[4].replace(/[^0-9]/g, '')
        if (rawAmt) setLoanPrincipal(rawAmt)
      }
    }
  }, [selectedLeadId, loanSourceMode, leads])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (type === 'lead') {
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
      } else if (type === 'loan' || type === 'convert-lead') {
        if (!loanBusiness.trim()) {
          alert('Please enter business name')
          setSubmitting(false)
          return
        }
        const res = await fetch('/api/loans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business: loanBusiness.trim(),
            customer: loanCustomer.trim() || loanBusiness.trim(),
            principal: Number(loanPrincipal) || 500000,
            roi: Number(loanRoi) || 18,
            tenure: Number(loanTenure) || 12,
            status: 'Disbursal due',
            leadId: (loanSourceMode === 'lead' && selectedLeadId) ? selectedLeadId : undefined
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(
            loanSourceMode === 'lead' && selectedLeadId
              ? `Lead "${loanBusiness}" successfully converted to loan proposal under Disbursal Due!`
              : `Loan proposal created for ${loanBusiness} with EMI schedule!`
          )
        } else {
          alert(data.error || 'Failed to create loan')
        }
      }
    } catch (err: unknown) {
      console.error(err)
      alert('Network request error connecting to server.')
    } finally {
      setSubmitting(false)
    }
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

  if (type === 'loan' || type === 'convert-lead') {
    return (
      <Modal
        title={type === 'convert-lead' ? 'Convert Lead to Loan' : 'Create or Convert Loan'}
        subtitle="Sanction funding by converting an existing lead or creating a direct loan"
        onClose={onClose}
      >
        <form onSubmit={submit} className="form">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => {
                setLoanSourceMode('lead')
                if (!selectedLeadId && unconvertedLeads[0]) {
                  setSelectedLeadId(unconvertedLeads[0][0])
                }
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid var(--line)',
                background: loanSourceMode === 'lead' ? 'var(--green)' : 'white',
                color: loanSourceMode === 'lead' ? 'white' : 'var(--ink)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Convert from Lead ({unconvertedLeads.length} available)
            </button>
            <button
              type="button"
              onClick={() => {
                setLoanSourceMode('direct')
                setSelectedLeadId('')
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid var(--line)',
                background: loanSourceMode === 'direct' ? 'var(--green)' : 'white',
                color: loanSourceMode === 'direct' ? 'white' : 'var(--ink)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Direct Loan Entry
            </button>
          </div>

          {loanSourceMode === 'lead' && (
            <div style={{ marginBottom: '14px', background: '#f8faf8', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: '4px' }}>
              <label>
                Select Lead to Convert to Loan
                <select
                  value={selectedLeadId}
                  onChange={e => {
                    const id = e.target.value
                    setSelectedLeadId(id)
                    const found = leads.find(l => l[0] === id)
                    if (found) {
                      setLoanBusiness(found[1])
                      setLoanCustomer(found[2])
                      const raw = found[4].replace(/[^0-9]/g, '')
                      if (raw) setLoanPrincipal(raw)
                    }
                  }}
                  required
                >
                  <option value="">-- Choose Lead from Pipeline --</option>
                  {unconvertedLeads.map(l => (
                    <option key={l[0]} value={l[0]}>
                      {l[1]} ({l[4]} · Contact: {l[2]} · {l[6]})
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--green)', fontWeight: 600 }}>
                ✓ Lead details auto-populated below. Submitting will convert lead and create loan proposal under "Disbursal due".
              </div>
            </div>
          )}

          <div className="form-grid">
            <label>Business name<input type="text" value={loanBusiness} onChange={e => setLoanBusiness(e.target.value)} placeholder="Registered business name" required/></label>
            <label>Customer contact<input type="text" value={loanCustomer} onChange={e => setLoanCustomer(e.target.value)} placeholder="Borrower representative"/></label>
            <label>Principal amount (₹)<input type="number" onWheel={e => (e.target as HTMLElement).blur()} value={loanPrincipal} onChange={e => setLoanPrincipal(e.target.value)} required/></label>
            <label>Annual ROI (%)<input type="number" onWheel={e => (e.target as HTMLElement).blur()} value={loanRoi} onChange={e => setLoanRoi(e.target.value)} required/></label>
            <label>Tenure (months)
              <select value={loanTenure} onChange={e => setLoanTenure(e.target.value)}>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
            </label>
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Processing...' : loanSourceMode === 'lead' ? 'Convert Lead to Loan Proposal' : 'Create direct loan'}
            </Button>
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
    <Leads leads={leads} openAdd={() => { setModalTargetId(undefined); setModal('lead') }} convert={handleConvertLead}/>
  ) : screen === 'Loans' ? (
    <Loans
      loans={loans}
      leads={leads}
      openDisburse={id => { setModalTargetId(id); setModal('disburse') }}
      openCreate={() => { setModalTargetId(undefined); setModal('loan') }}
      openConvertLead={leadId => { setModalTargetId(leadId); setModal('convert-lead') }}
      onConvertLead={handleConvertLead}
      onApplyCalc={handleApplyCalc}
    />
  ) : screen === 'Scheduled EMIs' ? (
    <ScheduledEmis emis={emis} onPay={handlePayEmi}/>
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
    <div className="app-shell theme-violet">
      <aside className={`sidebar ${sidebar ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">GE</div>
          <div><strong>GEET</strong><span>ENTERPRISE</span></div>
          <button className="mobile-close" onClick={() => setSidebar(false)}><Icon name="close"/></button>
        </div>
        <nav>
          <span className="nav-label">WORKSPACE</span>
          {navItems.map(item => (
            <button
              key={item.name}
              className={screen === item.name ? 'active' : ''}
              onClick={() => navigate(item.name)}
            >
              <Icon name={item.icon}/>
              <span>{item.name}</span>
              {screen === item.name && <i/>}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="fiscal">
            <span>CAPITAL POOL</span>
            <strong>{money(masterWallet.total_capital)}</strong>
            <div className="progress"><span style={{ width: '92%' }}/></div>
          </div>
          <button onClick={() => setLoggedIn(false)}><Icon name="logout"/><span>Sign out</span></button>
        </div>
      </aside>

      {sidebar && <button className="sidebar-overlay" onClick={() => setSidebar(false)}/>}

      <div className="main-shell">
        <header className="topbar">
          <button className="menu-button" onClick={() => setSidebar(true)}><Icon name="menu"/></button>
          <div className="top-search">
            <Icon name="search"/>
            <input placeholder="Search customers, loans, transactions..."/>
            <kbd>⌘ K</kbd>
          </div>
          <div className="top-actions">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: serverOnline ? '#15803d' : '#b45309',
                background: serverOnline ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${serverOnline ? '#bbf7d0' : '#fde68a'}`,
                padding: '4px 10px',
                borderRadius: '12px'
              }}
              title="Live Server Connection Status"
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: serverOnline ? '#22c55e' : '#f59e0b'
                }}
              />
              {serverOnline ? 'Backend Online' : 'Connecting...'}
            </span>

            <button className="notification" onClick={() => notify('Central funds and ledger synced')}>
              <Icon name="bell"/>
              <i/>
            </button>

            {/* SINGLE USER PROFILE HEADER - NO USER SWITCHING DROPDOWN */}
            <div className="profile-wrap">
              <button className="profile" onClick={() => setProfile(!profile)}>
                <span className="avatar">AD</span>
                <span><strong>Administrator</strong><small>Geet Enterprise</small></span>
                <Icon name="arrowDown" size={14}/>
              </button>
              {profile && (
                <div className="profile-menu">
                  <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--line)' }}>
                    <strong style={{ display: 'block', fontSize: '12px' }}>Geet Administrator</strong>
                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>admin@geetenterprise.in</span>
                  </div>
                  <div style={{ padding: '8px 12px', fontSize: '10px', color: 'var(--muted)' }}>
                    Single-User Admin Cockpit
                  </div>
                  <button onClick={() => { setProfile(false); setScreen('Dashboard') }}>
                    Dashboard Overview
                  </button>
                  <button onClick={() => { setProfile(false); setScreen('Capital & Partners') }}>
                    Capital & Partners
                  </button>
                  <button onClick={() => setLoggedIn(false)}>
                    <Icon name="logout" size={15}/> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main>{page}</main>
      </div>

      {modal && (
        <FormModal
          type={modal}
          targetId={modalTargetId}
          availableBalance={masterWallet.available_balance}
          partners={partners}
          leads={leads}
          onClose={() => setModal(null)}
          onDone={notify}
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
