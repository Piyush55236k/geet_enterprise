import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'

type Screen =
  | 'Dashboard'
  | 'Central Wallet'
  | 'My Wallet'
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
  { name: 'Central Wallet', icon: 'wallet' },
  { name: 'My Wallet', icon: 'userWallet' },
  { name: 'Leads', icon: 'leads' },
  { name: 'Loans', icon: 'loans' },
  { name: 'Scheduled EMIs', icon: 'calendar' },
  { name: 'Expenses', icon: 'expense' },
  { name: 'Profit & Loss', icon: 'chart' },
  { name: 'Transactions', icon: 'transaction' },
]

type UserProfile = {
  id?: string
  name: string
  role: string
  theme: 'violet' | 'amber' | 'cyan'
  allocated: string
  available: string
  deployed: string
  recovery: string
  utilization: number
}

const initialUsers: UserProfile[] = [
  { id: 'u1', name: 'Amit Sharma', role: 'Credit Manager', theme: 'violet', allocated: '₹14,20,000', available: '₹4,82,400', deployed: '₹9,37,600', recovery: '₹2,18,450', utilization: 66 },
  { id: 'u2', name: 'Priya Mehta', role: 'Loan Officer', theme: 'amber', allocated: '₹11,50,000', available: '₹3,16,800', deployed: '₹8,33,200', recovery: '₹1,84,250', utilization: 72 },
  { id: 'u3', name: 'Rohan Khanna', role: 'Collections', theme: 'cyan', allocated: '₹7,80,400', available: '₹2,08,900', deployed: '₹5,71,500', recovery: '₹2,64,800', utilization: 73 },
]

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(value || 0))

function Badge({ status }: { status: string }) {
  const type = ['Paid', 'Completed', 'Approved', 'Active', 'Qualified', 'Converted'].includes(status)
    ? 'success'
    : ['Overdue', 'Rejected'].includes(status) ? 'danger'
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

function Donut({ utilization = 72 }: { utilization?: number }) {
  return <div className="donut-layout">
    <div className="donut"><div><strong>{Math.round(utilization)}%</strong><span>Utilized</span></div></div>
    <div className="legend">
      <div><i className="legend-green"/><span>Deployed capital</span><strong>₹31.5L</strong></div>
      <div><i className="legend-navy"/><span>Available funds</span><strong>₹12.2L</strong></div>
      <div><i className="legend-gray"/><span>Reserved</span><strong>₹2.0L</strong></div>
    </div>
  </div>
}

function SectionCard({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>
}

// -------------------------------------------------------------
// SCREEN COMPONENTS
// -------------------------------------------------------------

function Dashboard({
  navigate,
  masterWallet,
  emis,
  loans,
  expenses
}: {
  navigate: (s: Screen) => void
  masterWallet: { total_capital: number; available_balance: number; allocated_capital: number }
  emis: string[][]
  loans: string[][]
  expenses: string[][]
}) {
  const activeLoans = loans.filter(l => l[7] === 'Active').length
  const totalExp = expenses.reduce((sum, e) => {
    const raw = e[4].replace(/[^0-9]/g, '')
    return sum + (Number(raw) || 0)
  }, 0)

  const upcomingEmis = emis.filter(e => e[6] === 'Upcoming' || e[6] === 'Overdue')

  return (
    <>
      <PageHeader
        title="Business overview"
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={<Button icon="download" variant="secondary" onClick={() => window.print()}>Export report</Button>}
      />
      <div className="metrics-grid">
        <Metric label="Total capital" value={money(masterWallet.total_capital)} note="Across all wallets" trend="+8.2%"/>
        <Metric label="Available balance" value={money(masterWallet.available_balance)} note="Ready to deploy" tone="green"/>
        <Metric label="Allocated capital" value={money(masterWallet.allocated_capital)} note={`${((masterWallet.allocated_capital / (masterWallet.total_capital || 1)) * 100).toFixed(1)}% of capital`} tone="blue"/>
        <Metric label="Disbursed loans" value="₹31,42,000" note={`${activeLoans} active loans`} trend="+12.4%"/>
        <Metric label="Recovered principal" value="₹8,72,450" note="This financial year" trend="+6.8%"/>
        <Metric label="Interest income" value="₹4,28,650" note="This financial year" trend="+14.2%" tone="green"/>
        <Metric label="Total expenses" value={money(totalExp || 186200)} note="Recorded expenses" trend="-2.1%" tone="red"/>
        <Metric label="Net profit" value="₹2,42,450" note="56.6% profit margin" trend="+18.6%" tone="green"/>
      </div>
      <div className="dashboard-grid">
        <SectionCard title="Cash flow" subtitle="Inflow and outflow over 6 months" className="wide" action={<div className="chart-legend"><span><i className="dot green"/>Inflow</span><span><i className="dot navy"/>Outflow</span></div>}><LineChart/></SectionCard>
        <SectionCard title="Capital utilization" subtitle="Current portfolio distribution"><Donut/></SectionCard>
        <SectionCard title="Profit trend" subtitle="Net profit, monthly"><div className="profit-stat"><strong>₹2,42,450</strong><span>+18.6% vs last period</span></div><div className="bar-chart">{[42,55,48,68,73,86].map((h,i)=><div key={i}><span style={{height:`${h}%`}}/><small>{['Oct','Nov','Dec','Jan','Feb','Mar'][i]}</small></div>)}</div></SectionCard>
        <SectionCard title="Upcoming EMIs" subtitle="Pending & upcoming collections" className="wide" action={<button className="text-button" onClick={()=>navigate('Scheduled EMIs')}>View schedule <Icon name="arrowRight" size={15}/></button>}>
          <div className="emi-list">
            {upcomingEmis.slice(0, 4).map((r, i) => (
              <div className="emi-row" key={`${r[2]}-${i}`}>
                <div className="date-tile">
                  <strong>{r[0].slice(0, 2)}</strong>
                  <span>{r[0].slice(3, 6).toUpperCase()}</span>
                </div>
                <div className="emi-name">
                  <strong>{r[1]}</strong>
                  <span>{r[2]} · EMI #{i + 1}</span>
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

function CentralWallet({
  masterWallet,
  userList,
  transactions
}: {
  masterWallet: { total_capital: number; available_balance: number; allocated_capital: number }
  userList: UserProfile[]
  transactions: string[][]
}) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    if (!query) return transactions
    return transactions.filter(t => t.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [transactions, query])

  return (
    <>
      <PageHeader title="Central wallet" eyebrow="Shared capital overview" actions={<div className="central-managed"><Icon name="check" size={15}/> Centrally funded</div>}/>
      <div className="wallet-hero">
        <div><span>MASTER WALLET BALANCE</span><strong>{money(masterWallet.available_balance)}</strong><small>Last updated live from server</small></div>
        <div className="wallet-divider"/><div className="wallet-stat"><span>Total capital</span><strong>{money(masterWallet.total_capital)}</strong></div>
        <div className="wallet-stat"><span>Allocated</span><strong>{money(masterWallet.allocated_capital)}</strong></div>
        <div className="wallet-access"><Icon name="wallet" size={17}/><span>Central Reserve</span><small>Capital is added and allocated centrally</small></div>
      </div>
      <div className="three-col">
        {userList.map(u => (
          <div className={`user-wallet wallet-${u.theme}`} key={u.name}>
            <div className="user-head">
              <span className="avatar small">{u.name.split(' ').map(x => x[0]).join('')}</span>
              <div><strong>{u.name}</strong><small>{u.role}</small></div>
              <Badge status="Active"/>
            </div>
            <div className="wallet-split">
              <div><span>Allocated</span><strong>{u.allocated}</strong></div>
              <div><span>Available</span><strong>{u.available}</strong></div>
            </div>
            <div className="wallet-owner"><Icon name="userWallet" size={14}/> Individual wallet · {u.utilization}% Deployed</div>
          </div>
        ))}
      </div>
      <SectionCard title="Master wallet history" subtitle="All credits, allocations and transfers" action={<SearchFilter placeholder="Search wallet history..." value={query} onChange={setQuery}/>}>
        <DataTable headers={['Reference', 'Date', 'Description', 'Wallet / Party', 'Type', 'Amount', 'Status']} rows={filtered}/>
      </SectionCard>
    </>
  )
}

function MyWallet({ user, transactions }: { user: UserProfile; transactions: string[][] }) {
  const [query, setQuery] = useState('')
  const myTxns = useMemo(() => {
    return transactions.filter(t => t[3].toLowerCase().includes(user.name.toLowerCase()) || query && t.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [transactions, user.name, query])

  return (
    <>
      <PageHeader title="My wallet" eyebrow={`${user.name} · ${user.role}`} actions={<Button icon="download" variant="secondary" onClick={() => window.print()}>Statement</Button>}/>
      <div className="wallet-identity"><span className="avatar">{user.name.split(' ').map(x=>x[0]).join('')}</span><div><span>INDIVIDUAL WALLET</span><strong>{user.name}</strong></div><small>Only transactions assigned to this user are shown</small></div>
      <div className="metrics-grid four">
        <Metric label="Wallet balance" value={user.available} note="Available funds" tone="green"/>
        <Metric label="Allocated capital" value={user.allocated} note="From central wallet"/>
        <Metric label="Deployed funds" value={user.deployed} note="Across active loans"/>
        <Metric label="This month's recovery" value={user.recovery} trend="+11.8%" tone="green"/>
      </div>
      <div className="two-col">
        <SectionCard title="Fund utilization" subtitle="Allocation vs deployment">
          <div className="utilization">
            <div className="util-head"><strong>{user.utilization}%</strong><span>{user.deployed} of {user.allocated} deployed</span></div>
            <div className="progress"><span style={{width:`${user.utilization}%`}}/></div>
            <div className="util-labels"><span>Deployed {user.deployed}</span><span>Available {user.available}</span></div>
          </div>
        </SectionCard>
        <SectionCard title="Monthly movement" subtitle="March 2025">
          <div className="movement">
            <div><span className="movement-icon credit"><Icon name="arrowDown"/></span><span>Credits</span><strong>₹7,18,450</strong></div>
            <div><span className="movement-icon debit"><Icon name="arrowUp"/></span><span>Debits</span><strong>₹5,42,000</strong></div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="My transactions" subtitle="Transactions linked to your wallet" action={<SearchFilter value={query} onChange={setQuery}/>}>
        <DataTable headers={['Reference','Date','Description','Party','Type','Amount','Status']} rows={myTxns.length ? myTxns : transactions.slice(0, 5)}/>
      </SectionCard>
    </>
  )
}

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

  return (
    <>
      <PageHeader title="Leads" eyebrow="Customer acquisition pipeline" actions={<Button icon="plus" onClick={openAdd}>Add lead</Button>}/>
      <div className="metrics-grid four">
        <Metric label="Total leads" value={String(leads.length)} note="Live pipeline"/>
        <Metric label="Qualified" value={String(qualifiedCount)} note="Ready for proposal" tone="green"/>
        <Metric label="Follow-ups due" value={String(followUpCount)} note="Action required" tone="red"/>
        <Metric label="Conversion rate" value="41.2%" trend="+4.2%" tone="blue"/>
      </div>
      <SectionCard title="Lead pipeline" subtitle="Manage prospects and convert qualified leads" action={<SearchFilter placeholder="Search customers..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Lead ID','Business','Contact person','Phone','Requirement','Source','Status']}
          rows={filtered}
          action={row => (
            row[6] !== 'Converted' ? (
              <button className="table-action" onClick={() => convert(row[0], row[1])}>
                Convert to loan
              </button>
            ) : <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Converted</span>
          )}
        />
      </SectionCard>
    </>
  )
}

function Loans({
  loans,
  openDisburse,
  openCreate,
  onApplyCalc
}: {
  loans: string[][]
  openDisburse: (loanId: string) => void
  openCreate: () => void
  onApplyCalc: (c: { principal: number; roi: number; tenure: number; emi: number; business: string }) => void
}) {
  const [query, setQuery] = useState('')
  const [principal, setPrincipal] = useState(600000)
  const [rate, setRate] = useState(18)
  const [tenure, setTenure] = useState(12)
  const [calcBusiness, setCalcBusiness] = useState('')

  const monthlyRate = rate / 1200
  const emi = Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1))
  const fees = Math.round(principal * 0.02)
  const gstOnFee = Math.round(fees * 0.18)
  const netDisbursement = principal - fees - gstOnFee

  const filtered = useMemo(() => {
    if (!query) return loans
    return loans.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [loans, query])

  return (
    <>
      <PageHeader title="Loans" eyebrow="Portfolio & funding" actions={<Button icon="plus" onClick={openCreate}>Create loan</Button>}/>
      <div className="metrics-grid four">
        <Metric label="Active portfolio" value="₹31,42,000" note={`${loans.length} total loans`}/>
        <Metric label="Average ROI" value="17.8%" note="Weighted average" tone="green"/>
        <Metric label="Outstanding principal" value="₹24,18,650" note="76.9% of disbursed"/>
        <Metric label="At risk" value="₹1,14,200" note="2 overdue accounts" tone="red"/>
      </div>
      <SectionCard title="Loan portfolio" subtitle="All customer loans" action={<SearchFilter placeholder="Search loan or customer..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Loan ID','Business','Customer','Principal','ROI','Tenure','EMI','Status']}
          rows={filtered}
          action={row => row[7] === 'Disbursal due' ? (
            <button className="table-action" onClick={() => openDisburse(row[0])}>Disburse</button>
          ) : (
            <button className="table-action" onClick={() => alert(`Loan details: ${row[0]} - ${row[1]} (${row[7]})`)}>View details</button>
          )}
        />
      </SectionCard>
      <SectionCard title="Funding calculator" subtitle="Estimate disbursement and repayment schedule">
        <div className="calculator">
          <div className="calc-inputs">
            <label>Business / Customer name<input type="text" value={calcBusiness} onChange={e => setCalcBusiness(e.target.value)} placeholder="e.g. Verma Logistics"/></label>
            <label>Loan principal (₹)<input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))}/></label>
            <label>Annual ROI (%)<input type="number" value={rate} onChange={e => setRate(Number(e.target.value))}/></label>
            <label>Tenure (months)
              <select value={tenure} onChange={e => setTenure(Number(e.target.value))}>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="18">18 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
            </label>
          </div>
          <div className="calc-results">
            <div><span>Monthly EMI</span><strong>{money(emi)}</strong></div>
            <div><span>Interest payable</span><strong>{money(emi * tenure - principal)}</strong></div>
            <div><span>Processing fee (2%)</span><strong>{money(fees)}</strong></div>
            <div><span>GST on fee (18%)</span><strong>{money(gstOnFee)}</strong></div>
            <div className="net"><span>Net disbursement</span><strong>{money(netDisbursement)}</strong></div>
          </div>
        </div>
        <div className="schedule-preview">
          <strong>Repayment schedule preview:</strong>
          <span>First EMI: 15 Apr 2025</span>
          <span>Final EMI: 15 Mar 2026</span>
          <Button
            variant="secondary"
            onClick={() => onApplyCalc({ principal, roi: rate, tenure, emi, business: calcBusiness.trim() || 'New Customer Proposal' })}
          >
            Create this loan proposal
          </Button>
        </div>
      </SectionCard>
    </>
  )
}

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
      <PageHeader title="Scheduled EMIs" eyebrow="Repayment calendar" actions={<Button icon="download" variant="secondary" onClick={() => window.print()}>Export schedule</Button>}/>
      <div className="metrics-grid four">
        <Metric label="Due this month" value="₹8,42,600" note={`${emis.length} installments`}/>
        <Metric label="Collected" value="₹5,68,350" note={`${counts.paid} collected`} tone="green"/>
        <Metric label="Upcoming" value="₹1,48,000" note={`${counts.upcoming} installments`} tone="blue"/>
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
      <SectionCard title="March 2025 installments" subtitle="Customer-wise payment schedule" action={<SearchFilter placeholder="Search customer or loan..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Due date','Customer','Loan ID','Principal','Interest','Amount','Status']}
          rows={filtered}
          action={row => (
            row[6] === 'Paid' ? (
              <button className="table-action" onClick={() => alert(`Receipt verified for ${row[1]} (${row[2]})`)}>View receipt</button>
            ) : (
              <button className="table-action" onClick={() => onPay(row[2], row[1])}>Record payment</button>
            )
          )}
        />
      </SectionCard>
    </>
  )
}

function Expenses({
  expenses,
  openAdd,
  onApprove
}: {
  expenses: string[][]
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
      <PageHeader title="Expenses" eyebrow="Operating expense management" actions={<Button icon="plus" onClick={openAdd}>Add expense</Button>}/>
      <div className="metrics-grid four">
        <Metric label="This month" value={money(totalSpent)} trend="-2.1%" tone="green"/>
        <Metric label="Approved" value={money(totalSpent * 0.85)} note="Deducted from wallets"/>
        <Metric label="Pending approval" value="₹18,000" note="1 expense" tone="blue"/>
        <Metric label="Monthly budget" value="₹2,00,000" note="61.5% utilized"/>
      </div>
      <div className="notice"><Icon name="check"/><div><strong>Automatic wallet deduction</strong><span>Approved expenses are deducted from the submitter's wallet and recorded in the financial ledger.</span></div></div>
      <SectionCard title="Expense register" subtitle="Receipts, approvals and wallet deductions" action={<SearchFilter placeholder="Search expenses..." value={query} onChange={setQuery}/>}>
        <DataTable
          headers={['Expense ID','Date','Description','Category','Amount','Submitted by','Status']}
          rows={filtered}
          action={row => row[6] === 'Pending' ? (
            <button className="table-action" onClick={() => onApprove(row[0])}>Review / Approve</button>
          ) : (
            <button className="table-action" onClick={() => alert(`Receipt file for ${row[0]} is verified in server/uploads.`)}>View receipt</button>
          )}
        />
      </SectionCard>
    </>
  )
}

function ProfitLoss({ userList }: { userList: UserProfile[] }) {
  const [selectedTab, setSelectedTab] = useState<'Consolidated' | 'Amit' | 'Priya' | 'Rohan'>('Consolidated')
  const [period, setPeriod] = useState('01 Apr 2024 – 31 Mar 2025')

  return (
    <>
      <PageHeader
        title="Profit & loss"
        eyebrow="Financial performance"
        actions={
          <>
            <select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option>01 Apr 2024 – 31 Mar 2025</option>
              <option>This month</option>
              <option>Last quarter</option>
            </select>
            <Button icon="download" variant="secondary" onClick={() => window.print()}>Export PDF</Button>
          </>
        }
      />
      <div className="report-tabs">
        <button className={selectedTab === 'Consolidated' ? 'active' : ''} onClick={() => setSelectedTab('Consolidated')}>Consolidated</button>
        <button className={selectedTab === 'Amit' ? 'active' : ''} onClick={() => setSelectedTab('Amit')}>Amit Sharma</button>
        <button className={selectedTab === 'Priya' ? 'active' : ''} onClick={() => setSelectedTab('Priya')}>Priya Mehta</button>
        <button className={selectedTab === 'Rohan' ? 'active' : ''} onClick={() => setSelectedTab('Rohan')}>Rohan Khanna</button>
      </div>
      <div className="metrics-grid four">
        <Metric label="Interest earned" value={selectedTab === 'Consolidated' ? '₹4,28,650' : selectedTab === 'Amit' ? '₹1,68,400' : selectedTab === 'Priya' ? '₹1,44,250' : '₹1,16,000'} trend="+14.2%" tone="green"/>
        <Metric label="Operating expenses" value={selectedTab === 'Consolidated' ? '₹1,86,200' : selectedTab === 'Amit' ? '₹62,300' : selectedTab === 'Priya' ? '₹58,900' : '₹65,000'} trend="-2.1%"/>
        <Metric label="Net profit" value={selectedTab === 'Consolidated' ? '₹2,42,450' : selectedTab === 'Amit' ? '₹1,06,100' : selectedTab === 'Priya' ? '₹85,350' : '₹51,000'} trend="+18.6%" tone="green"/>
        <Metric label="Profit margin" value={selectedTab === 'Consolidated' ? '56.6%' : selectedTab === 'Amit' ? '63.0%' : selectedTab === 'Priya' ? '59.2%' : '44.0%'} trend="+3.4%" tone="blue"/>
      </div>
      <div className="two-col report-grid">
        <SectionCard title="Income vs expenses" subtitle="Monthly comparison">
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
          <div className="chart-legend centered"><span><i className="dot green"/>Interest income</span><span><i className="dot navy"/>Expenses</span></div>
        </SectionCard>
        <SectionCard title="Portfolio health" subtitle="Capital performance">
          <div className="pnl-list">
            <div><span>Outstanding principal</span><strong>₹24,18,650</strong></div>
            <div><span>Capital utilization</span><strong>72.1%</strong></div>
            <div><span>Recovery rate</span><strong>94.8%</strong></div>
            <div><span>Return on capital</span><strong>9.7%</strong></div>
          </div>
        </SectionCard>
      </div>
      <SectionCard title="Profitability by user" subtitle="Individual wallet performance">
        <DataTable
          headers={['User','Allocated capital','Interest earned','Expenses','Net profit','Utilization','Status']}
          rows={userList.map(u => [
            u.name,
            u.allocated,
            u.name.includes('Amit') ? '₹1,68,400' : u.name.includes('Priya') ? '₹1,44,250' : '₹1,16,000',
            u.name.includes('Amit') ? '₹62,300' : u.name.includes('Priya') ? '₹58,900' : '₹65,000',
            u.name.includes('Amit') ? '₹1,06,100' : u.name.includes('Priya') ? '₹85,350' : '₹51,000',
            `${u.utilization}.0%`,
            'On track'
          ])}
        />
      </SectionCard>
    </>
  )
}

function Transactions({ transactions }: { transactions: string[][] }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 6

  const filtered = useMemo(() => {
    if (!query) return transactions
    return transactions.filter(r => r.join(' ').toLowerCase().includes(query.toLowerCase()))
  }, [transactions, query])

  const totalPages = Math.ceil(filtered.length / perPage) || 1
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  const exportCsv = () => {
    const data = ['Reference,Date,Description,Party,Type,Amount,Status', ...filtered.map(r => r.join(','))].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([data], { type: 'text/csv' }))
    link.download = 'geet-ledger.csv'
    link.click()
  }

  return (
    <>
      <PageHeader title="Transactions" eyebrow="Complete financial ledger" actions={<Button icon="download" variant="secondary" onClick={exportCsv}>Export CSV</Button>}/>
      <div className="ledger-balance">
        <div><span>Total credits</span><strong>₹18,42,650</strong><small>Mar 2025</small></div>
        <div><span>Total debits</span><strong>₹14,86,200</strong><small>Mar 2025</small></div>
        <div><span>Net movement</span><strong>+₹3,56,450</strong><small>Mar 2025</small></div>
      </div>
      <SectionCard title="Financial ledger" subtitle={`${filtered.length} transactions recorded`} action={<div className="toolbar"><label className="search-field"><Icon name="search" size={17}/><input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search ledger..."/></label><Button variant="secondary" icon="filter">Filters</Button></div>}>
        <DataTable headers={['Reference','Date','Description','Party / Wallet','Type','Amount','Status']} rows={visible}/>
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

function Modal({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></div>{children}</div></div>
}

function FormModal({
  type,
  targetId,
  onClose,
  onDone
}: {
  type: string
  targetId?: string
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
  const [disburseAmount, setDisburseAmount] = useState('585840')
  const [disburseUtr, setDisburseUtr] = useState('')
  const [disburseDate, setDisburseDate] = useState(new Date().toISOString().slice(0, 10))
  const [disburseMethod, setDisburseMethod] = useState('NEFT / RTGS')
  const [disburseFile, setDisburseFile] = useState<File | null>(null)

  // New Loan Form State
  const [loanBusiness, setLoanBusiness] = useState('')
  const [loanCustomer, setLoanCustomer] = useState('')
  const [loanPrincipal, setLoanPrincipal] = useState('750000')
  const [loanRoi, setLoanRoi] = useState('18')
  const [loanTenure, setLoanTenure] = useState('12')

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
          onDone(`Expense of ${money(Number(expAmount))} submitted and recorded!`)
        } else {
          alert(data.error || 'Failed to record expense')
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
          onDone(`Loan ${id} disbursement recorded successfully!`)
        } else {
          alert(data.error || 'Disbursement failed')
        }
      } else if (type === 'loan') {
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
            status: 'Active'
          })
        })
        const data = await res.json()
        if (data.success) {
          onClose()
          onDone(`Loan created for ${loanBusiness} with EMI schedule!`)
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
      <Modal title="Confirm disbursement" subtitle="Verify payment details before releasing funds" onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="confirmation-strip">
            <div><span>Loan ID</span><strong>{targetId || 'GE-2025-086'}</strong></div>
            <div><span>Available Central Balance</span><strong>₹12,24,600</strong></div>
          </div>
          <div className="form-grid">
            <label>Disbursement amount (₹)<input type="number" value={disburseAmount} onChange={e => setDisburseAmount(e.target.value)} required/></label>
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
      <Modal title="Add expense" subtitle="Submit a business expense with receipt" onClose={onClose}>
        <form onSubmit={submit} className="form">
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
            <label>Amount (₹)<input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="Enter amount" required/></label>
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
            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit expense'}</Button>
          </div>
        </form>
      </Modal>
    )
  }

  if (type === 'loan') {
    return (
      <Modal title="Create new loan" subtitle="Set borrower principal and funding terms" onClose={onClose}>
        <form onSubmit={submit} className="form">
          <div className="form-grid">
            <label>Business name<input type="text" value={loanBusiness} onChange={e => setLoanBusiness(e.target.value)} placeholder="Registered business name" required/></label>
            <label>Customer contact<input type="text" value={loanCustomer} onChange={e => setLoanCustomer(e.target.value)} placeholder="Borrower representative"/></label>
            <label>Principal amount (₹)<input type="number" value={loanPrincipal} onChange={e => setLoanPrincipal(e.target.value)} required/></label>
            <label>Annual ROI (%)<input type="number" value={loanRoi} onChange={e => setLoanRoi(e.target.value)} required/></label>
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
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create loan'}</Button>
          </div>
        </form>
      </Modal>
    )
  }

  return (
    <Modal title="Add new lead" subtitle="Capture customer and loan requirement details" onClose={onClose}>
      <form onSubmit={submit} className="form">
        <div className="form-grid">
          <label>Business name<input type="text" value={leadBusiness} onChange={e => setLeadBusiness(e.target.value)} placeholder="Registered business name" required/></label>
          <label>Contact person<input type="text" value={leadPerson} onChange={e => setLeadPerson(e.target.value)} placeholder="Full name"/></label>
          <label>Phone number<input type="text" value={leadPhone} onChange={e => setLeadPhone(e.target.value)} placeholder="+91 98765 43210"/></label>
          <label>Email address<input type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} placeholder="name@business.com"/></label>
          <label>Loan requirement (₹)<input type="number" value={leadAmount} onChange={e => setLeadAmount(e.target.value)} placeholder="Enter amount"/></label>
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

function Login({ onLogin }: { onLogin: (user: UserProfile) => void }) {
  const [forgot, setForgot] = useState(false)
  const [email, setEmail] = useState('amit@geetenterprise.in')
  const [password, setPassword] = useState('password123')
  const [showPass, setShowPass] = useState(false)

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark large">GE</div>
        <div><strong>GEET ENTERPRISE</strong><span>Capital, controlled.</span></div>
      </div>
      <div className="auth-copy">
        <span className="kicker">SECURE FINANCE OPERATIONS</span>
        <h1>Clarity across every rupee deployed.</h1>
        <p>A unified capital, lending and recovery workspace for your entire team.</p>
        <div className="auth-metrics">
          <div><strong>₹45.75L</strong><span>Capital managed</span></div>
          <div><strong>94.8%</strong><span>Recovery rate</span></div>
          <div><strong>18</strong><span>Active loans</span></div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-form">
          <div className="mobile-brand">GEET ENTERPRISE</div>
          <span className="eyebrow">AUTHORIZED ACCESS ONLY</span>
          <h2>{forgot ? 'Reset password' : 'Welcome back'}</h2>
          <p>{forgot ? 'Enter your registered email to receive a secure reset link.' : 'Sign in to access your financial workspace.'}</p>
          {forgot ? (
            <form onSubmit={e => { e.preventDefault(); setForgot(false) }}>
              <label>Email address<input type="email" placeholder="you@geetenterprise.in" required/></label>
              <Button type="submit">Send reset link</Button>
              <button type="button" className="text-button centered-button" onClick={() => setForgot(false)}>Back to sign in</button>
            </form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); onLogin(initialUsers[0]) }}>
              <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></label>
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
              <Button type="submit">Secure login <Icon name="arrowRight" size={16}/></Button>
            </form>
          )}
          {!forgot && (
            <>
              <div className="access-divider"><span>MULTI-USER DEMO ACCESS</span></div>
              <div className="role-grid">
                {initialUsers.map((person, index) => (
                  <button key={person.name} onClick={() => onLogin(person)}>
                    <span className="avatar">{person.name.split(' ').map(x => x[0]).join('')}</span>
                    <span><strong>User {String(index + 1).padStart(2, '0')}</strong><small>{person.role}</small></span>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="secure-note">256-bit encrypted · Session monitored</div>
        </div>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// MAIN APPLICATION ROOT
// -------------------------------------------------------------

export default function App() {
  const [loggedIn, setLoggedIn] = useState(true)
  const [screen, setScreen] = useState<Screen>('Dashboard')
  const [user, setUser] = useState<UserProfile>(initialUsers[0])
  const [userList, setUserList] = useState<UserProfile[]>(initialUsers)
  const [masterWallet, setMasterWallet] = useState({ total_capital: 4575000, available_balance: 1224600, allocated_capital: 3350400 })

  const [leads, setLeads] = useState<string[][]>([])
  const [loans, setLoans] = useState<string[][]>([])
  const [emis, setEmis] = useState<string[][]>([])
  const [expenses, setExpenses] = useState<string[][]>([])
  const [transactions, setTransactions] = useState<string[][]>([])

  const [sidebar, setSidebar] = useState(false)
  const [profile, setProfile] = useState(false)
  const [modal, setModal] = useState<string | null>(null)
  const [modalTargetId, setModalTargetId] = useState<string | undefined>()
  const [toast, setToast] = useState('')
  const [serverOnline, setServerOnline] = useState(false)

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
    // Re-sync with backend to get latest database updates
    syncData()
  }

  const login = (profile: UserProfile) => {
    setUser(profile)
    setLoggedIn(true)
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

        if (d.wallets?.length) {
          setUserList(d.wallets.map((w: { id: string; name: string; role: string; theme: 'violet' | 'amber' | 'cyan'; allocated: number; available: number; deployed: number; recovery: number; utilization: number }) => ({
            id: w.id,
            name: w.name,
            role: w.role,
            theme: w.theme || 'violet',
            allocated: money(w.allocated),
            available: money(w.available),
            deployed: money(w.deployed),
            recovery: money(w.recovery),
            utilization: w.utilization || Math.round((w.deployed / (w.allocated || 1)) * 100)
          })))
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
            exp.submitted_by,
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
    const timer = setInterval(syncData, 10000)
    return () => clearInterval(timer)
  }, [])

  // Action Handlers
  const handleConvertLead = async (leadId: string, leadBusiness: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/convert`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        notify(`${leadBusiness} converted! Loan proposal created under Disbursal due.`)
      } else {
        alert(data.error || 'Conversion failed')
      }
    } catch (e) {
      console.error(e)
      alert('Could not convert lead')
    }
  }

  const handlePayEmi = async (loanId: string, customer: string) => {
    const found = emis.find(e => e[2] === loanId)
    if (!found) return
    try {
      const res = await fetch(`/api/emis/${found[2]}/pay`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        notify(`EMI payment of ${found[5]} recorded for ${customer}!`)
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
        notify(`Expense ${expId} approved successfully!`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleApplyCalc = async (calc: { principal: number; roi: number; tenure: number; emi: number; business: string }) => {
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
          status: 'Disbursal due'
        })
      })
      const data = await res.json()
      if (data.success) {
        notify(`Loan proposal created for ${calc.business} with monthly EMI of ${money(calc.emi)}!`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (!loggedIn) return <Login onLogin={login}/>

  const page = screen === 'Dashboard' ? (
    <Dashboard navigate={navigate} masterWallet={masterWallet} emis={emis} loans={loans} expenses={expenses}/>
  ) : screen === 'Central Wallet' ? (
    <CentralWallet masterWallet={masterWallet} userList={userList} transactions={transactions}/>
  ) : screen === 'My Wallet' ? (
    <MyWallet user={user} transactions={transactions}/>
  ) : screen === 'Leads' ? (
    <Leads leads={leads} openAdd={() => { setModalTargetId(undefined); setModal('lead') }} convert={handleConvertLead}/>
  ) : screen === 'Loans' ? (
    <Loans
      loans={loans}
      openDisburse={id => { setModalTargetId(id); setModal('disburse') }}
      openCreate={() => { setModalTargetId(undefined); setModal('loan') }}
      onApplyCalc={handleApplyCalc}
    />
  ) : screen === 'Scheduled EMIs' ? (
    <ScheduledEmis emis={emis} onPay={handlePayEmi}/>
  ) : screen === 'Expenses' ? (
    <Expenses
      expenses={expenses}
      openAdd={() => { setModalTargetId(undefined); setModal('expense') }}
      onApprove={handleApproveExpense}
    />
  ) : screen === 'Profit & Loss' ? (
    <ProfitLoss userList={userList}/>
  ) : (
    <Transactions transactions={transactions}/>
  )

  return (
    <div className={`app-shell theme-${user.theme}`}>
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
            <span>FY 2024–25</span>
            <strong>Financial year active</strong>
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

            <button className="notification" onClick={() => notify('No new unread notifications')}>
              <Icon name="bell"/>
              <i/>
            </button>
            <div className="profile-wrap">
              <button className="profile" onClick={() => setProfile(!profile)}>
                <span className="avatar">{user.name.split(' ').map(x => x[0]).join('')}</span>
                <span><strong>{user.name}</strong><small>{user.role}</small></span>
                <Icon name="arrowDown" size={14}/>
              </button>
              {profile && (
                <div className="profile-menu">
                  <span>Switch user</span>
                  {userList.map(person => (
                    <button key={person.name} onClick={() => { setUser(person); setProfile(false) }}>
                      {person.name} <small>{person.role}</small>
                    </button>
                  ))}
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
