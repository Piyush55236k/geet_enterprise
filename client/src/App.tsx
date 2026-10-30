import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react"

type Screen = "dashboard" | "calculator" | "results" | "schedule" | "saved" | "reports" | "add-expense" | "categories" | "settings"
type AdvanceMode = "none" | "net_hand" | "full_1_emi" | "half_emi" | "by_advance" | "by_days"

type LoanInput = {
  customer: string
  amount: number
  rate: number
  tenureDays: number
  frequencyDays: number
  pfPercent: number
  startDate?: string
  advanceMode: AdvanceMode
  netHandAmount?: number
  advanceAmount?: number
  advanceDays?: number
  tenure?: number
  tenureUnit?: "months" | "years" | "days"
  fee?: number
  charges?: number
}
type Calculation = LoanInput & {
  id: string
  date: string
  months: number
  baseEmis: number
  deductedEmis: number
  payableEmis: number
  totalReturn: number
  totalInterest: number
  pfAmount: number
  totalFees: number
  advanceDeducted: number
  netHand: number
  remainingRepayment: number
  emi: number
  perInstalment: number
}
type ScheduleRow = {
  installment: number
  dueDate: string
  amount: number
  status: string
  cumulativePaid: number
  balance: number
  opening: number
  emi: number
  principal: number
  interest: number
  closing: number
}
type ExpenseCategory = {
  id: string
  name: string
  active: boolean
}
type Expense = {
  id: string
  title: string
  amount: number
  date: string
  paymentMethod: string
  description: string
  categoryId: string
  receipt?: string
}
type InstallmentStatus = "upcoming" | "paid" | "overdue" | "partially paid"
type Installment = {
  id: string
  loanId: string
  customer: string
  dueDate: string
  amount: number
  amountPaid: number
  outstanding: number
  status: InstallmentStatus
  daysDelayed: number
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})
const money = (value: number) => INR.format(Math.round(value || 0))

function formatIndianWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return ""
  if (num >= 10000000) {
    const cr = parseFloat((num / 10000000).toFixed(2))
    return `₹${cr} Cr`
  }
  if (num >= 100000) {
    const lakh = parseFloat((num / 100000).toFixed(2))
    return `₹${lakh} Lakh`
  }
  if (num >= 1000) {
    const k = parseFloat((num / 1000).toFixed(1))
    return `₹${k} Thousand`
  }
  return `₹${num}`
}

function formatEmiDate(d: Date): string {
  const day = d.getDate()
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()} (${days[d.getDay()]})`
}

function getShortcutDate(type: "today" | "tomorrow" | "1st" | "15th"): string {
  const now = new Date()
  if (type === "today") return now.toISOString().slice(0, 10)
  if (type === "tomorrow") {
    const tm = new Date(now.getTime() + 86400000)
    return tm.toISOString().slice(0, 10)
  }
  if (type === "1st") {
    const d = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return d.toISOString().slice(0, 10)
  }
  if (type === "15th") {
    let d = new Date(now.getFullYear(), now.getMonth(), 15)
    if (d.getTime() < now.getTime()) {
      d = new Date(now.getFullYear(), now.getMonth() + 1, 15)
    }
    return d.toISOString().slice(0, 10)
  }
  return now.toISOString().slice(0, 10)
}

function cleanNumericInput(val: string, allowDecimal = false): string {
  if (val === "" || val === null || val === undefined) return ""
  let clean = allowDecimal ? String(val).replace(/[^0-9.]/g, "") : String(val).replace(/[^0-9]/g, "")
  if (allowDecimal) {
    const parts = clean.split(".")
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("")
    }
  }
  if (/^0[0-9]+/.test(clean)) {
    clean = clean.replace(/^0+/, "")
    if (clean === "") clean = "0"
  }
  return clean
}

const iconPaths: Record<string, ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4" />
    </>
  ),
  bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />,
  table: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 9v11M15 9v11" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63h.01A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9v.01A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  trend: <path d="m3 17 6-6 4 4 8-9M16 6h5v5" />,
  wallet: (
    <>
      <path d="M3 6h16a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V6Z" />
      <path d="M3 8V5a2 2 0 0 1 2-2h12v5M16 12h5v4h-5a2 2 0 0 1 0-4Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M18 15a6 6 0 0 1 4 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  closeEye: (
    <>
      <path d="m3 3 18 18M10.6 6.2A11 11 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3 3.7M6.1 6.1C3.4 8 2 12 2 12s3.5 6 10 6a11 11 0 0 0 3-.4" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  check: <path d="m5 12 4 4L19 6" />,
  edit: (
    <>
      <path d="m14 4 6 6L8 22H2v-6L14 4Z" />
      <path d="m12 6 6 6" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 11v5M14 11v5" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  report: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      <path d="m3 7 6-4 6 6 6-5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </>
  ),
  tag: (
    <>
      <path d="M20 13 11 22l-9-9V2h11l7 7a3 3 0 0 1 0 4Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.6 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3M7 8l5-5 5 5" />
      <path d="M5 21h14" />
    </>
  ),
}

function Icon({ name, size = 19 }: { name: string; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  )
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "brand-light" : ""}`}>
      <div className="brand-mark">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div>
        <strong>Geet</strong>
        <small>ENTERPRISE</small>
      </div>
    </div>
  )
}

function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "danger"
  icon?: string
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={17} />}
      <span>{children}</span>
    </button>
  )
}

function Field({
  label,
  error,
  hint,
  action,
  children,
}: {
  label: string
  error?: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <label className={`field ${error ? "has-error" : ""}`}>
      <span className="field-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{label}</span>
        {action}
      </span>
      {children}
      {error ? (
        <span className="field-error">{error}</span>
      ) : hint ? (
        <span className="field-hint">{hint}</span>
      ) : null}
    </label>
  )
}

function calculateLoan(input: LoanInput): Calculation {
  const loanAmount = Number(input.amount) || 0
  const rate = Number(input.rate) || 100
  const tenureDays = Number(input.tenureDays) || (input.tenureUnit === "years" ? (input.tenure || 1) * 365 : (input.tenure || 105))
  const frequencyDays = Number(input.frequencyDays) || 15
  const pfPercent = Number(input.pfPercent ?? input.fee ?? 5)
  const advanceMode = input.advanceMode || "net_hand"
  const startDate = input.startDate || new Date().toISOString().slice(0, 10)

  // 1. Multiplier Total Return (e.g. Rate 130 -> 130% Total Return)
  const totalReturn = Math.round(loanAmount * (rate / 100))
  const totalInterest = Math.max(0, totalReturn - loanAmount)

  // 2. Base EMIs & Base EMI amount
  const baseEmis = Math.max(1, Math.floor(tenureDays / frequencyDays))
  const baseEmi = totalReturn > 0 && baseEmis > 0 ? totalReturn / baseEmis : 0

  // 3. Processing Fee (PF)
  const pfAmount = Math.round(loanAmount * (pfPercent / 100))

  // 4. Advance Deduction based on selected mode
  let advanceDeducted = 0
  let deductedEmis = 0

  if (advanceMode === "net_hand") {
    const targetNetHand = Number(input.netHandAmount ?? 800000)
    advanceDeducted = Math.max(0, loanAmount - pfAmount - targetNetHand)
    deductedEmis = 1
  } else if (advanceMode === "full_1_emi") {
    advanceDeducted = Math.round(baseEmi)
    deductedEmis = 1
  } else if (advanceMode === "half_emi") {
    advanceDeducted = Math.round(baseEmi * 0.5)
    deductedEmis = 0.5
  } else if (advanceMode === "by_advance") {
    advanceDeducted = Number(input.advanceAmount || 0)
    deductedEmis = baseEmi > 0 ? Math.max(1, Math.round(advanceDeducted / baseEmi)) : 1
  } else if (advanceMode === "by_days") {
    const advDays = Number(input.advanceDays || frequencyDays)
    advanceDeducted = Math.round((totalReturn / tenureDays) * advDays)
    deductedEmis = Math.max(1, Math.round(advDays / frequencyDays))
  } else {
    advanceDeducted = 0
    deductedEmis = 0
  }

  // 5. Payable EMIs & Remaining Repayment
  const payableEmis = Math.max(1, Math.round(baseEmis - deductedEmis))
  const remainingRepayment = Math.max(0, totalReturn - advanceDeducted)
  const perInstalment = Math.round(remainingRepayment / payableEmis)

  // 6. Net In-Hand Disbursement Amount
  const netHand = loanAmount - pfAmount - advanceDeducted

  return {
    ...input,
    amount: loanAmount,
    rate,
    tenureDays,
    frequencyDays,
    pfPercent,
    startDate,
    advanceMode,
    totalReturn,
    totalInterest,
    baseEmis,
    deductedEmis,
    payableEmis,
    pfAmount,
    advanceDeducted,
    netHand,
    remainingRepayment,
    perInstalment,
    months: payableEmis,
    emi: perInstalment,
    totalFees: pfAmount,
    id: input.id || `GE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
    date: input.date || new Date().toISOString(),
  }
}

function makeSchedule(calc: Calculation): ScheduleRow[] {
  const count = calc.payableEmis || calc.months || 1
  const perEmi = calc.perInstalment || calc.emi || 0
  const totalRepayment = calc.remainingRepayment || (perEmi * count)
  let cumulativePaid = 0
  const start = calc.startDate ? new Date(calc.startDate + "T00:00:00") : new Date()
  const freq = calc.frequencyDays || 15

  return Array.from({ length: count }, (_, index) => {
    const isLast = index === count - 1
    const amount = isLast ? Math.max(0, totalRepayment - cumulativePaid) : perEmi
    cumulativePaid += amount
    const balance = Math.max(0, totalRepayment - cumulativePaid)

    const dueDateObj = new Date(start.getTime() + (index + 1) * freq * 86400000)
    const formattedDate = formatEmiDate(dueDateObj)

    return {
      installment: index + 1,
      dueDate: formattedDate,
      amount,
      status: "Scheduled",
      cumulativePaid,
      balance,
      opening: balance + amount,
      emi: amount,
      principal: amount,
      interest: 0,
      closing: balance,
    }
  })
}

const demoInputs: LoanInput[] = [
  {
    customer: "Jain Financial Services",
    amount: 1000000,
    rate: 130,
    tenureDays: 105,
    frequencyDays: 15,
    pfPercent: 5,
    startDate: "2026-10-29",
    advanceMode: "net_hand",
    netHandAmount: 800000,
    advanceAmount: 150000,
    advanceDays: 15,
    fee: 5,
    charges: 0,
    tenure: 105,
    tenureUnit: "days",
  },
  {
    customer: "Aarav Textiles Pvt. Ltd.",
    amount: 1250000,
    rate: 125,
    tenureDays: 90,
    frequencyDays: 15,
    pfPercent: 4,
    startDate: "2026-10-25",
    advanceMode: "full_1_emi",
    netHandAmount: 1000000,
    advanceAmount: 200000,
    advanceDays: 15,
    fee: 4,
    charges: 0,
    tenure: 90,
    tenureUnit: "days",
  },
  {
    customer: "Sharma Trading Co.",
    amount: 850000,
    rate: 135,
    tenureDays: 120,
    frequencyDays: 15,
    pfPercent: 5,
    startDate: "2026-10-20",
    advanceMode: "by_advance",
    netHandAmount: 650000,
    advanceAmount: 150000,
    advanceDays: 15,
    fee: 5,
    charges: 0,
    tenure: 120,
    tenureUnit: "days",
  },
  {
    customer: "Bluebird Foods LLP",
    amount: 2000000,
    rate: 128,
    tenureDays: 150,
    frequencyDays: 30,
    pfPercent: 3.5,
    startDate: "2026-10-15",
    advanceMode: "net_hand",
    netHandAmount: 1600000,
    advanceAmount: 330000,
    advanceDays: 30,
    fee: 3.5,
    charges: 0,
    tenure: 150,
    tenureUnit: "days",
  },
]
const demoCalcs = demoInputs.map((item, i) => ({
  ...calculateLoan(item),
  id: `GE-2025-${[1048, 1044, 1039, 1033][i]}`,
  date: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}))

const initialCategories: ExpenseCategory[] = [
  "Salary",
  "Office Rent",
  "Electricity",
  "Internet",
  "Travel",
  "Marketing",
  "Software",
  "Maintenance",
  "Miscellaneous",
].map((name, index) => ({ id: `CAT-${index + 1}`, name, active: true }))

const monthDate = (monthOffset: number, day: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() + monthOffset, day)
  return date.toISOString().slice(0, 10)
}

const initialExpenses: Expense[] = [
  {
    id: "EXP-1084",
    title: "Team payroll",
    amount: 185000,
    date: monthDate(0, 2),
    paymentMethod: "Bank transfer",
    description: "Monthly payroll",
    categoryId: "CAT-1",
  },
  {
    id: "EXP-1081",
    title: "Head office rent",
    amount: 62000,
    date: monthDate(0, 4),
    paymentMethod: "Bank transfer",
    description: "Monthly lease payment",
    categoryId: "CAT-2",
  },
  {
    id: "EXP-1078",
    title: "Google Workspace",
    amount: 12800,
    date: monthDate(0, 7),
    paymentMethod: "Corporate card",
    description: "Productivity subscription",
    categoryId: "CAT-7",
  },
  {
    id: "EXP-1072",
    title: "Client acquisition campaign",
    amount: 28500,
    date: monthDate(-1, 18),
    paymentMethod: "Corporate card",
    description: "Digital campaign",
    categoryId: "CAT-6",
  },
  {
    id: "EXP-1065",
    title: "Electricity bill",
    amount: 9400,
    date: monthDate(-1, 12),
    paymentMethod: "UPI",
    description: "Office electricity",
    categoryId: "CAT-3",
  },
  {
    id: "EXP-1059",
    title: "Regional client meetings",
    amount: 21800,
    date: monthDate(-2, 23),
    paymentMethod: "Corporate card",
    description: "Travel and accommodation",
    categoryId: "CAT-5",
  },
  {
    id: "EXP-1051",
    title: "Office network",
    amount: 4800,
    date: monthDate(-2, 5),
    paymentMethod: "UPI",
    description: "Business broadband",
    categoryId: "CAT-4",
  },
]

const initialInstallments: Installment[] = [
  {
    id: "EMI-2408",
    loanId: "GE-2025-1048",
    customer: "Aarav Textiles Pvt. Ltd.",
    dueDate: monthDate(0, 25),
    amount: 26867,
    amountPaid: 0,
    outstanding: 987430,
    status: "upcoming",
    daysDelayed: 0,
  },
  {
    id: "EMI-2411",
    loanId: "GE-2025-1044",
    customer: "Sharma Trading Co.",
    dueDate: monthDate(0, 27),
    amount: 22076,
    amountPaid: 0,
    outstanding: 741220,
    status: "upcoming",
    daysDelayed: 0,
  },
  {
    id: "EMI-2416",
    loanId: "GE-2025-1039",
    customer: "Bluebird Foods LLP",
    dueDate: monthDate(1, 3),
    amount: 32962,
    amountPaid: 0,
    outstanding: 1884300,
    status: "upcoming",
    daysDelayed: 0,
  },
  {
    id: "EMI-2392",
    loanId: "GE-2025-1033",
    customer: "Riya Enterprises",
    dueDate: monthDate(-1, 8),
    amount: 19096,
    amountPaid: 0,
    outstanding: 498600,
    status: "overdue",
    daysDelayed: 18,
  },
  {
    id: "EMI-2388",
    loanId: "GE-2025-1044",
    customer: "Sharma Trading Co.",
    dueDate: monthDate(-1, 12),
    amount: 22076,
    amountPaid: 10000,
    outstanding: 753296,
    status: "partially paid",
    daysDelayed: 14,
  },
  {
    id: "EMI-2379",
    loanId: "GE-2025-1048",
    customer: "Aarav Textiles Pvt. Ltd.",
    dueDate: monthDate(-1, 5),
    amount: 26867,
    amountPaid: 26867,
    outstanding: 1013120,
    status: "paid",
    daysDelayed: 0,
  },
]

function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("admin@geetenterprise.in")
  const [password, setPassword] = useState("demo1234")
  const [error, setError] = useState("")
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.includes("@") || password.length < 6)
      return setError(
        "Enter a valid email and a password of at least 6 characters.",
      )
    onLogin()
  }
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-wrap">
          <Brand />
          <div className="login-heading">
            <p className="eyebrow">SECURE WORKSPACE</p>
            <h1>Welcome back</h1>
            <p>Sign in to manage funding calculations and customer records.</p>
          </div>
          <form onSubmit={submit} className="login-form">
            {error && <div className="alert alert-error">{error}</div>}
            <Field label="Work email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@company.com"
              />
            </Field>
            <Field label="Password">
              <div className="password-input">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "closeEye" : "eye"} />
                </button>
              </div>
            </Field>
            <div className="form-row">
              <label className="check-label">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-link">
                Forgot password?
              </button>
            </div>
            <Button type="submit">Sign in to workspace</Button>
            <p className="demo-note">
              Demo credentials are pre-filled for preview access.
            </p>
          </form>
          <p className="login-footer">Protected by enterprise-grade security</p>
        </div>
      </section>
      <section className="login-visual">
        <div className="visual-grid"></div>
        <div className="visual-copy">
          <div className="visual-badge">
            <Icon name="trend" /> SMARTER FUNDING DECISIONS
          </div>
          <h2>Clarity for every financial conversation.</h2>
          <p>
            Accurate repayments, transparent schedules, and professional
            reports—all in one focused workspace.
          </p>
          <div className="metric-strip">
            <div>
              <strong>100%</strong>
              <span>Transparent</span>
            </div>
            <div>
              <strong>Instant</strong>
              <span>Calculations</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Workspace</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const navItems: { id: Screen; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid" },
  { id: "calculator", label: "Funding Calculator", icon: "calculator" },
  { id: "saved", label: "Saved Calculations", icon: "bookmark" },
  { id: "schedule", label: "EMI Schedule", icon: "table" },
  { id: "reports", label: "Financial Reports", icon: "report" },
  { id: "add-expense", label: "Add Expense", icon: "receipt" },
  { id: "categories", label: "Expense Categories", icon: "tag" },
  { id: "settings", label: "Settings", icon: "settings" },
]

function AppShell({
  screen,
  setScreen,
  logout,
  isServerOnline = false,
  onSync,
  children,
}: {
  screen: Screen
  setScreen: (s: Screen) => void
  logout: () => void
  isServerOnline?: boolean
  onSync?: () => void
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const titles: Record<Screen, string> = {
    dashboard: "Dashboard",
    calculator: "Funding Calculator",
    results: "Calculation Results",
    schedule: "EMI Schedule",
    saved: "Saved Calculations",
    reports: "Financial Reports",
    "add-expense": "Add Expense",
    categories: "Expense Categories",
    settings: "Settings",
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <Brand light />
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            ×
          </button>
        </div>
        <nav>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={
                screen === item.id ||
                (screen === "results" && item.id === "calculator")
                  ? "active"
                  : ""
              }
              onClick={() => {
                setScreen(item.id)
                setMobileOpen(false)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">?</div>
            <strong>Need assistance?</strong>
            <span>Our support team is here to help.</span>
            <button>Contact support</button>
          </div>
          <button className="logout-btn" onClick={logout}>
            <Icon name="logout" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="scrim"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
        ></button>
      )}
      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">
            <button className="menu-btn" onClick={() => setMobileOpen(true)}>
              <Icon name="menu" />
            </button>
            <div>
              <span className="breadcrumb">GEET ENTERPRISE</span>
              <h1>{titles[screen]}</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              className={`server-status-pill ${isServerOnline ? "" : "offline"}`}
              onClick={onSync}
              title={isServerOnline ? "Connected to SQLite backend" : "Server offline - click to retry sync"}
            >
              <span className={`pulse-dot ${isServerOnline ? "" : "offline"}`}></span>
              <span>{isServerOnline ? "Server Live" : "Offline"}</span>
            </div>
            <div className="profile">
              <div className="profile-copy">
                <strong>Arjun Mehta</strong>
                <span>Administrator</span>
              </div>
              <div className="avatar">AM</div>
              <Icon name="chevron" size={15} />
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  meta,
  tone,
}: {
  icon: string
  label: string
  value: string
  meta: string
  tone: string
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
        <span>{meta}</span>
      </div>
    </article>
  )
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name="calculator" size={25} />
      </div>
      <h3>No matching calculations</h3>
      <p>Try another search or create a new funding calculation.</p>
      <Button icon="plus" onClick={onAction}>
        New calculation
      </Button>
    </div>
  )
}

function Dashboard({
  calcs,
  expenses,
  categories,
  installments,
  setScreen,
  view,
}: {
  calcs: Calculation[]
  expenses: Expense[]
  categories: ExpenseCategory[]
  installments: Installment[]
  setScreen: (s: Screen) => void
  view: (c: Calculation) => void
}) {
  const [search, setSearch] = useState("")
  const filtered = calcs.filter((c) =>
    `${c.customer} ${c.id}`.toLowerCase().includes(search.toLowerCase()),
  )
  const total = calcs.reduce((sum, c) => sum + c.amount, 0)
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0)
  const upcoming = installments.filter((item) => item.status === "upcoming")
  const overdue = installments.filter(
    (item) => item.status === "overdue" || item.status === "partially paid",
  )
  const categoryTotals = categories
    .map((category) => ({
      name: category.name,
      amount: expenses
        .filter((expense) => expense.categoryId === category.id)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .filter((item) => item.amount)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
  const maxCategory = categoryTotals[0]?.amount || 1
  return (
    <>
      <div className="page-intro">
        <div>
          <h2>Good morning, Arjun</h2>
          <p>Here’s what’s happening with your funding calculations.</p>
        </div>
        <Button icon="plus" onClick={() => setScreen("calculator")}>
          New calculation
        </Button>
      </div>
      <section className="stats-grid">
        <StatCard
          icon="calculator"
          label="Total calculations"
          value={String(calcs.length + 20)}
          meta="+12% this month"
          tone="blue"
        />
        <StatCard
          icon="wallet"
          label="Funding assessed"
          value={money(total + 24800000)}
          meta="+8.4% this month"
          tone="violet"
        />
        <StatCard
          icon="users"
          label="Active customers"
          value="18"
          meta="+3 this month"
          tone="green"
        />
        <StatCard
          icon="clock"
          label="Avg. interest rate"
          value="10.8%"
          meta="Across all loans"
          tone="orange"
        />
      </section>
      <section className="report-summary-grid">
        <button
          className="report-summary-card"
          onClick={() => setScreen("reports")}
        >
          <span className="summary-icon income">
            <Icon name="trend" />
          </span>
          <span>
            <small>Estimated monthly profit</small>
            <strong>{money(742500 - expenseTotal)}</strong>
            <em>Demo summary</em>
          </span>
          <Icon name="arrow" size={16} />
        </button>
        <button
          className="report-summary-card"
          onClick={() => setScreen("reports")}
        >
          <span className="summary-icon upcoming">
            <Icon name="calendar" />
          </span>
          <span>
            <small>Upcoming collections</small>
            <strong>
              {money(upcoming.reduce((sum, item) => sum + item.amount, 0))}
            </strong>
            <em>{upcoming.length} installments</em>
          </span>
          <Icon name="arrow" size={16} />
        </button>
        <button
          className="report-summary-card alert-card"
          onClick={() => setScreen("reports")}
        >
          <span className="summary-icon overdue">
            <Icon name="alert" />
          </span>
          <span>
            <small>Overdue amount</small>
            <strong>
              {money(
                overdue.reduce(
                  (sum, item) => sum + item.amount - item.amountPaid,
                  0,
                ),
              )}
            </strong>
            <em>{overdue.length} require attention</em>
          </span>
          <Icon name="arrow" size={16} />
        </button>
      </section>
      <div className="finance-dashboard-grid">
        <section className="card finance-chart-card">
          <div className="card-header">
            <div>
              <h3>Monthly profit vs. expenses</h3>
              <p>Demo financial performance over six months</p>
            </div>
            <button className="text-link" onClick={() => setScreen("reports")}>
              Full report <Icon name="arrow" size={14} />
            </button>
          </div>
          <div className="dual-chart">
            {[
              ["Oct", 72, 38],
              ["Nov", 78, 42],
              ["Dec", 68, 45],
              ["Jan", 82, 40],
              ["Feb", 88, 49],
              ["Mar", 92, 46],
            ].map(([month, income, expense]) => (
              <div className="dual-column" key={month}>
                <div className="dual-bars">
                  <i style={{ height: `${income}%` }}></i>
                  <i style={{ height: `${expense}%` }}></i>
                </div>
                <span>{month}</span>
              </div>
            ))}
          </div>
          <div className="chart-keys">
            <span>
              <i className="income-key"></i>Income
            </span>
            <span>
              <i className="expense-key"></i>Expenses
            </span>
          </div>
        </section>
        <section className="card expense-breakdown">
          <div className="card-header">
            <div>
              <h3>Expenses by category</h3>
              <p>Current demo records</p>
            </div>
            <button
              className="text-link"
              onClick={() => setScreen("add-expense")}
            >
              Add expense
            </button>
          </div>
          <div className="category-bars">
            {categoryTotals.map((item, index) => (
              <div key={item.name}>
                <div>
                  <span>
                    <i className={`category-dot dot-${index}`}></i>
                    {item.name}
                  </span>
                  <strong>{money(item.amount)}</strong>
                </div>
                <progress value={item.amount} max={maxCategory}></progress>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="alert-grid">
        <section className="card alert-list upcoming-list">
          <div className="card-header">
            <div>
              <h3>Upcoming EMI alerts</h3>
              <p>Next scheduled collections</p>
            </div>
            <button className="text-link" onClick={() => setScreen("reports")}>
              View all
            </button>
          </div>
          {upcoming.slice(0, 2).map((item) => (
            <div className="alert-row" key={item.id}>
              <span className="date-tile">
                <strong>{new Date(item.dueDate).getDate()}</strong>
                <small>
                  {new Date(item.dueDate).toLocaleDateString("en-IN", {
                    month: "short",
                  })}
                </small>
              </span>
              <span>
                <strong>{item.customer}</strong>
                <small>{item.loanId}</small>
              </span>
              <b>{money(item.amount)}</b>
            </div>
          ))}
        </section>
        <section className="card alert-list overdue-list">
          <div className="card-header">
            <div>
              <h3>Overdue EMI alerts</h3>
              <p>Collections requiring attention</p>
            </div>
            <button className="text-link" onClick={() => setScreen("reports")}>
              Review
            </button>
          </div>
          {overdue.slice(0, 2).map((item) => (
            <div className="alert-row" key={item.id}>
              <span className="alert-symbol">
                <Icon name="alert" size={17} />
              </span>
              <span>
                <strong>{item.customer}</strong>
                <small>
                  {item.daysDelayed} days delayed · {item.loanId}
                </small>
              </span>
              <b>{money(item.amount - item.amountPaid)}</b>
            </div>
          ))}
        </section>
      </div>
      <div className="dashboard-grid">
        <section className="card activity-card">
          <div className="card-header">
            <div>
              <h3>Calculation activity</h3>
              <p>Funding value assessed over 6 months</p>
            </div>
            <select aria-label="Activity period">
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
          </div>
          <div className="chart-wrap">
            <div className="y-axis">
              <span>₹6L</span>
              <span>₹4L</span>
              <span>₹2L</span>
              <span>₹0</span>
            </div>
            <div className="bar-chart">
              {[41, 59, 48, 74, 66, 90].map((height, i) => (
                <div className="bar-column" key={i}>
                  <div className="bar" style={{ height: `${height}%` }}>
                    <span>{i === 5 ? "₹5.4L" : ""}</span>
                  </div>
                  <small>{["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="card quick-card">
          <div className="card-header">
            <div>
              <h3>Quick calculation</h3>
              <p>Start with a common loan type</p>
            </div>
          </div>
          {[
            ["Business loan", "₹5L–₹50L", "trend"],
            ["Equipment finance", "₹2L–₹25L", "settings"],
            ["Working capital", "₹1L–₹20L", "wallet"],
          ].map(([name, range, icon]) => (
            <button
              key={name}
              onClick={() => setScreen("calculator")}
              className="quick-row"
            >
              <span className="quick-icon">
                <Icon name={icon} />
              </span>
              <span>
                <strong>{name}</strong>
                <small>{range}</small>
              </span>
              <Icon name="arrow" size={17} />
            </button>
          ))}
        </section>
      </div>
      <section className="card table-card">
        <div className="card-header history-header">
          <div>
            <h3>Recent calculations</h3>
            <p>Your latest funding assessments</p>
          </div>
          <div className="header-actions">
            <div className="search-box">
              <Icon name="search" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer or ID"
              />
            </div>
            <button className="text-link" onClick={() => setScreen("saved")}>
              View all <Icon name="arrow" size={15} />
            </button>
          </div>
        </div>
        {filtered.length ? (
          <CalculationTable calcs={filtered.slice(0, 4)} onView={view} />
        ) : (
          <EmptyState onAction={() => setScreen("calculator")} />
        )}
      </section>
    </>
  )
}

function CalculationTable({
  calcs,
  onView,
  actions,
}: {
  calcs: Calculation[]
  onView: (c: Calculation) => void
  actions?: (c: Calculation) => ReactNode
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>REFERENCE</th>
            <th>CUSTOMER / BUSINESS</th>
            <th>LOAN AMOUNT</th>
            <th>RATE</th>
            <th>TENURE</th>
            <th>MONTHLY EMI</th>
            <th>DATE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {calcs.map((c) => (
            <tr key={c.id}>
              <td>
                <button className="ref-link" onClick={() => onView(c)}>
                  {c.id}
                </button>
              </td>
              <td>
                <strong>{c.customer}</strong>
              </td>
              <td>{money(c.amount)}</td>
              <td>{c.rate}%</td>
              <td>{c.months} months</td>
              <td>
                <strong>{money(c.emi)}</strong>
              </td>
              <td>
                {new Date(c.date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td>
                {actions ? (
                  actions(c)
                ) : (
                  <button
                    className="row-open"
                    onClick={() => onView(c)}
                    aria-label="View calculation"
                  >
                    <Icon name="arrow" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Calculator({
  initial,
  onCalculate,
}: {
  initial?: Calculation
  onCalculate: (c: Calculation) => void
}) {
  const [form, setForm] = useState({
    customer: initial?.customer ?? "Jain Financial Services",
    amount: String(initial?.amount ?? 1000000),
    rate: String(initial?.rate ?? 130),
    tenureDays: String(initial?.tenureDays ?? 105),
    frequencyDays: String(initial?.frequencyDays ?? 15),
    pfPercent: String(initial?.pfPercent ?? 5),
    startDate: initial?.startDate ?? new Date().toISOString().slice(0, 10),
    advanceMode: (initial?.advanceMode ?? "net_hand") as AdvanceMode,
    netHandAmount: String(initial?.netHandAmount ?? 800000),
    advanceAmount: String(initial?.advanceAmount ?? 150000),
    advanceDays: String(initial?.advanceDays ?? 15),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [scheduleSearch, setScheduleSearch] = useState("")

  const updateNumeric = (key: keyof typeof form, val: string, allowDecimal = false) => {
    const cleaned = cleanNumericInput(val, allowDecimal)
    setForm((prev) => ({ ...prev, [key]: cleaned }))
  }

  const liveCalc = useMemo(() => {
    return calculateLoan({
      customer: form.customer.trim() || "Jain Financial Services",
      amount: Number(form.amount) || 0,
      rate: Number(form.rate) || 100,
      tenureDays: Number(form.tenureDays) || 105,
      frequencyDays: Number(form.frequencyDays) || 15,
      pfPercent: Number(form.pfPercent) || 0,
      startDate: form.startDate,
      advanceMode: form.advanceMode,
      netHandAmount: Number(form.netHandAmount) || 0,
      advanceAmount: Number(form.advanceAmount) || 0,
      advanceDays: Number(form.advanceDays) || 15,
      id: initial?.id,
    })
  }, [form, initial])

  const scheduleRows = useMemo(() => makeSchedule(liveCalc), [liveCalc])

  const filteredSchedule = useMemo(() => {
    if (!scheduleSearch.trim()) return scheduleRows
    const q = scheduleSearch.toLowerCase()
    return scheduleRows.filter(
      (r) =>
        String(r.installment).includes(q) ||
        r.dueDate.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
    )
  }, [scheduleRows, scheduleSearch])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.customer.trim())
      next.customer = "Customer or business name is required."
    if (!Number(form.amount) || Number(form.amount) < 1000)
      next.amount = "Enter an amount of at least ₹1,000."
    if (!Number(form.rate) || Number(form.rate) <= 0)
      next.rate = "Enter a valid return multiplier rate."
    if (!Number(form.tenureDays) || Number(form.tenureDays) < 1)
      next.tenureDays = "Enter a valid tenure in days."
    if (!Number(form.frequencyDays) || Number(form.frequencyDays) < 1)
      next.frequencyDays = "Enter a valid EMI cycle frequency."
    setErrors(next)
    if (!Object.keys(next).length) {
      onCalculate(liveCalc)
    }
  }

  const reset = () => {
    setForm({
      customer: "Jain Financial Services",
      amount: "1000000",
      rate: "130",
      tenureDays: "105",
      frequencyDays: "15",
      pfPercent: "5",
      startDate: new Date().toISOString().slice(0, 10),
      advanceMode: "net_hand",
      netHandAmount: "800000",
      advanceAmount: "150000",
      advanceDays: "15",
    })
    setErrors({})
  }

  const selectedDateLabel = useMemo(() => {
    if (!form.startDate) return "No date selected"
    const d = new Date(form.startDate + "T00:00:00")
    if (isNaN(d.getTime())) return form.startDate
    return formatEmiDate(d)
  }, [form.startDate])

  return (
    <div className="calculator-split-layout">
      {/* LEFT COLUMN: Input Form */}
      <form onSubmit={submit} className="card calculator-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "18px", margin: "0 0 4px", color: "var(--navy)" }}>Funding Calculator</h2>
            <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>
              Jain Financial Services Calculation Engine
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={reset}
            style={{ padding: "4px 12px", height: "30px", fontSize: "11px" }}
          >
            ↻ Reset
          </button>
        </div>

        {/* Borrower Name */}
        <div className="form-grid one-col" style={{ marginBottom: "16px" }}>
          <Field label="Customer / Business Name" error={errors.customer}>
            <input
              type="text"
              value={form.customer}
              onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))}
              placeholder="e.g. Jain Financial Services"
            />
          </Field>
        </div>

        {/* Loan Amount */}
        <div className="form-grid one-col" style={{ marginBottom: "16px" }}>
          <Field
            label="Loan Amount Approved (₹)"
            action={<span className="badge-lakh">{formatIndianWords(Number(form.amount) || 0) || "₹0"}</span>}
            error={errors.amount}
          >
            <div className="input-prefix">
              <span>₹</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => updateNumeric("amount", e.target.value)}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                placeholder="1000000"
              />
            </div>
          </Field>
        </div>

        {/* Rate Multiplier */}
        <div className="form-grid one-col" style={{ marginBottom: "16px" }}>
          <Field
            label="Rate"
            action={<span className="badge-return">Multiplier: {form.rate || 100}% Total Return</span>}
            hint={`Rate ${form.rate || 0} → ${form.rate || 0}% Total Return`}
            error={errors.rate}
          >
            <input
              type="text"
              inputMode="decimal"
              value={form.rate}
              onChange={(e) => updateNumeric("rate", e.target.value, true)}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              placeholder="130"
            />
          </Field>
        </div>

        {/* Tenure (Days) */}
        <div className="form-grid one-col" style={{ marginBottom: "16px" }}>
          <Field label="Tenure (Days)" error={errors.tenureDays}>
            <input
              type="text"
              inputMode="numeric"
              value={form.tenureDays}
              onChange={(e) => updateNumeric("tenureDays", e.target.value)}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              placeholder="105"
            />
          </Field>
        </div>

        {/* EMI Frequency (Days) */}
        <div className="form-grid one-col" style={{ marginBottom: "16px" }}>
          <Field
            label="EMI Frequency (Days)"
            action={<span className="badge-lakh">= {liveCalc.baseEmis} Base EMIs</span>}
            hint={`e.g. 15 for 15-day cycle (${form.tenureDays || 105} days ÷ ${form.frequencyDays || 15} = ${liveCalc.baseEmis} Base EMIs)`}
            error={errors.frequencyDays}
          >
            <input
              type="text"
              inputMode="numeric"
              value={form.frequencyDays}
              onChange={(e) => updateNumeric("frequencyDays", e.target.value)}
              onWheel={(e) => (e.target as HTMLElement).blur()}
              placeholder="15"
            />
          </Field>
        </div>

        {/* Processing Fee */}
        <div className="form-grid one-col" style={{ marginBottom: "16px" }}>
          <Field
            label="Processing Fee (PF)"
            action={<span className="badge-lakh">= {money(liveCalc.pfAmount)}</span>}
            error={errors.pfPercent}
          >
            <div className="input-suffix">
              <input
                type="text"
                inputMode="decimal"
                value={form.pfPercent}
                onChange={(e) => updateNumeric("pfPercent", e.target.value, true)}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                placeholder="5"
              />
              <span>% PF</span>
            </div>
          </Field>
        </div>

        {/* Start Date */}
        <div className="form-grid one-col" style={{ marginBottom: "18px" }}>
          <Field
            label="Start Date (Optional)"
            action={
              form.startDate ? (
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setForm((prev) => ({ ...prev, startDate: "" }))}
                  style={{ fontSize: "11px", color: "var(--muted)", border: 0, background: "none", cursor: "pointer" }}
                >
                  ✕ Clear
                </button>
              ) : undefined
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "#f8fafc",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                marginBottom: "6px",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--navy)", fontWeight: 600 }}>
                📅 {selectedDateLabel}
              </div>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: "11px",
                  cursor: "pointer",
                  width: "125px",
                }}
              />
            </div>
            <div className="date-shortcuts">
              <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600 }}>Shortcuts:</span>
              <button
                type="button"
                className="date-shortcut-btn"
                onClick={() => setForm((prev) => ({ ...prev, startDate: getShortcutDate("today") }))}
              >
                ⚡ Today
              </button>
              <button
                type="button"
                className="date-shortcut-btn"
                onClick={() => setForm((prev) => ({ ...prev, startDate: getShortcutDate("tomorrow") }))}
              >
                Tomorrow
              </button>
              <button
                type="button"
                className="date-shortcut-btn"
                onClick={() => setForm((prev) => ({ ...prev, startDate: getShortcutDate("1st") }))}
              >
                1st
              </button>
              <button
                type="button"
                className="date-shortcut-btn"
                onClick={() => setForm((prev) => ({ ...prev, startDate: getShortcutDate("15th") }))}
              >
                15th
              </button>
            </div>
          </Field>
        </div>

        {/* Advance EMI / Net Hand Deduction Options */}
        <div style={{ borderTop: "1px solid #edf0f4", paddingTop: "18px", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--navy)" }}>
              Advance EMI / Net Hand Deduction
            </span>
            <span className="badge-lakh">
              {liveCalc.deductedEmis > 0
                ? `${liveCalc.deductedEmis} EMI Removed → ${liveCalc.payableEmis} EMIs to Pay`
                : `0 Advance → ${liveCalc.payableEmis} Base EMIs`}
            </span>
          </div>

          <div className="advance-radio-grid">
            {[
              { id: "none", label: "None" },
              { id: "net_hand", label: "By Net In-Hand (₹)" },
              { id: "full_1_emi", label: "Full 1 EMI" },
              { id: "half_emi", label: "Half EMI (0.5)" },
              { id: "by_advance", label: "By Advance (₹)" },
              { id: "by_days", label: "By Days" },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`advance-radio-item ${form.advanceMode === opt.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="advanceMode"
                  checked={form.advanceMode === opt.id}
                  onChange={() => setForm((prev) => ({ ...prev, advanceMode: opt.id as AdvanceMode }))}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {form.advanceMode === "net_hand" && (
            <div style={{ marginTop: "12px" }}>
              <Field
                label="Net In-Hand Amount to Give Client (₹)"
                action={<span className="badge-lakh">{formatIndianWords(Number(form.netHandAmount) || 0) || "₹0"}</span>}
              >
                <div className="input-prefix">
                  <span>₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.netHandAmount}
                    onChange={(e) => updateNumeric("netHandAmount", e.target.value)}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    placeholder="800000"
                  />
                </div>
              </Field>
              <div className="advance-formula-box">
                <div>
                  Advance Deducted: <strong>{money(liveCalc.advanceDeducted)}</strong>
                </div>
                <div>
                  Formula: Loan ({money(liveCalc.amount)}) − PF ({money(liveCalc.pfAmount)}) − Net Hand ({money(liveCalc.netHand)})
                </div>
                <div>
                  Repayment: {liveCalc.deductedEmis} EMI removed → <strong>{liveCalc.payableEmis} EMIs @ {money(liveCalc.perInstalment)}/EMI</strong>
                </div>
              </div>
            </div>
          )}

          {form.advanceMode === "by_advance" && (
            <div style={{ marginTop: "12px" }}>
              <Field
                label="Advance Amount (₹)"
                action={<span className="badge-lakh">{formatIndianWords(Number(form.advanceAmount) || 0) || "₹0"}</span>}
              >
                <div className="input-prefix">
                  <span>₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.advanceAmount}
                    onChange={(e) => updateNumeric("advanceAmount", e.target.value)}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    placeholder="150000"
                  />
                </div>
              </Field>
              <div className="advance-formula-box">
                <div>Advance Deducted: <strong>{money(liveCalc.advanceDeducted)}</strong></div>
                <div>Net In-Hand: <strong>{money(liveCalc.netHand)}</strong> | {liveCalc.payableEmis} EMIs @ <strong>{money(liveCalc.perInstalment)}</strong></div>
              </div>
            </div>
          )}

          {form.advanceMode === "by_days" && (
            <div style={{ marginTop: "12px" }}>
              <Field label="Advance Days to Deduct">
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.advanceDays}
                  onChange={(e) => updateNumeric("advanceDays", e.target.value)}
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                  placeholder="15"
                />
              </Field>
              <div className="advance-formula-box">
                <div>Advance Deducted: <strong>{money(liveCalc.advanceDeducted)}</strong></div>
                <div>Net In-Hand: <strong>{money(liveCalc.netHand)}</strong> | {liveCalc.payableEmis} EMIs @ <strong>{money(liveCalc.perInstalment)}</strong></div>
              </div>
            </div>
          )}

          {(form.advanceMode === "full_1_emi" || form.advanceMode === "half_emi") && (
            <div className="advance-formula-box" style={{ marginTop: "12px" }}>
              <div>
                Advance Deducted ({form.advanceMode === "full_1_emi" ? "1 Full EMI" : "0.5 Half EMI"}):{" "}
                <strong>{money(liveCalc.advanceDeducted)}</strong>
              </div>
              <div>
                Net In-Hand Disbursement: <strong>{money(liveCalc.netHand)}</strong>
              </div>
              <div>
                Remaining Repayment: <strong>{money(liveCalc.remainingRepayment)}</strong> ({liveCalc.payableEmis} EMIs @ {money(liveCalc.perInstalment)})
              </div>
            </div>
          )}
        </div>

        <div className="form-actions" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <Button variant="secondary" onClick={reset} type="button">
            Reset
          </Button>
          <Button type="submit" icon="calculator">
            Calculate & View Statement
          </Button>
        </div>
      </form>

      {/* RIGHT COLUMN: Live Funding Statement & Schedule Preview */}
      <div>
        {/* Main Amount Overview */}
        <section className="card" style={{ padding: "20px", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#18334e",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                JF
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", color: "var(--navy)" }}>Funding Statement</h3>
                <small style={{ color: "var(--muted)" }}>{liveCalc.customer}</small>
              </div>
            </div>
            <Button
              variant="secondary"
              icon="download"
              onClick={() => window.print()}
            >
              Print / PDF
            </Button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "14px", marginBottom: "16px" }}>
            <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>LOAN AMOUNT (SANCTION)</span>
                <span className="badge-lakh">{formatIndianWords(liveCalc.amount)}</span>
              </div>
              <strong style={{ fontSize: "22px", color: "var(--navy)", fontWeight: 800 }}>
                {money(liveCalc.amount)}
              </strong>
            </div>

            <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 700 }}>TOTAL RETURN AMOUNT</span>
                <span className="badge-return">Rate {liveCalc.rate}%</span>
              </div>
              <strong style={{ fontSize: "22px", color: "var(--navy)", fontWeight: 800 }}>
                {money(liveCalc.totalReturn)}
              </strong>
              <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "2px" }}>
                {formatIndianWords(liveCalc.totalReturn)}
              </div>
            </div>
          </div>

          {/* 4 Metric Pills */}
          <div className="metric-pills-row">
            <div className="metric-pill-item">
              <span>PF ({liveCalc.pfPercent}%)</span>
              <strong>{money(liveCalc.pfAmount)}</strong>
            </div>
            <div className="metric-pill-item">
              <span>ADVANCE DEDUCTED</span>
              <strong>{money(liveCalc.advanceDeducted)}</strong>
            </div>
            <div className="metric-pill-item">
              <span>PAYABLE EMIS</span>
              <strong>{liveCalc.payableEmis} (@ {liveCalc.frequencyDays}D)</strong>
            </div>
            <div className="metric-pill-item">
              <span>PER INSTALMENT</span>
              <strong style={{ color: "#b46b0a" }}>{money(liveCalc.perInstalment)}</strong>
            </div>
          </div>

          {/* Advance Deduction & Repayment Split */}
          <div className="split-summary-card">
            <div className="split-summary-header">
              <h4>Advance Deduction & Repayment Split</h4>
              <span className="badge-lakh">Mode: Net Hand: {money(liveCalc.netHand)}</span>
            </div>
            <div className="split-summary-grid">
              <div>
                <span>Active EMIs to Pay:</span>
                <strong>{liveCalc.payableEmis} Instalments ({liveCalc.deductedEmis} deducted)</strong>
              </div>
              <div>
                <span>Adjusted Per EMI:</span>
                <strong style={{ color: "var(--blue)" }}>{money(liveCalc.perInstalment)}</strong>
              </div>
              <div>
                <span>Remaining Repayment:</span>
                <strong>{money(liveCalc.remainingRepayment)}</strong>
              </div>
            </div>
          </div>

          {/* Net In-Hand Disbursement Green Card */}
          <div className="net-inhand-card">
            <div className="net-inhand-left">
              <span>NET IN-HAND DISBURSEMENT AMOUNT</span>
              <strong>{money(liveCalc.netHand)}</strong>
            </div>
            <div className="net-inhand-formula">
              <small>Formula: Loan − PF − Advance</small>
              {money(liveCalc.amount)} − {money(liveCalc.pfAmount)} − {money(liveCalc.advanceDeducted)}
            </div>
          </div>
        </section>

        {/* EMI Schedule Preview Table */}
        <section className="card table-card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "14px", color: "var(--navy)" }}>
                EMI Schedule ({liveCalc.payableEmis} Payable Instalments)
              </h3>
              <small style={{ color: "var(--muted)", fontSize: "10px" }}>
                Starting {form.startDate || "today"} • Every {liveCalc.frequencyDays} Days • ({liveCalc.deductedEmis} Advance EMI Deducted Upfront)
              </small>
            </div>
            <div className="search-box" style={{ width: "200px", height: "30px" }}>
              <Icon name="search" size={14} />
              <input
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                placeholder="Search EMI or Date..."
                style={{ fontSize: "10px" }}
              />
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>DUE DATE</th>
                  <th>AMOUNT (₹)</th>
                  <th>STATUS</th>
                  <th>CUMULATIVE PAID</th>
                  <th>BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.map((row) => (
                  <tr key={row.installment}>
                    <td>
                      <strong>{row.installment}</strong>
                    </td>
                    <td>{row.dueDate}</td>
                    <td>
                      <strong>{money(row.amount)}</strong>
                    </td>
                    <td>
                      <span className="badge-lakh" style={{ padding: "2px 7px", fontSize: "10px", background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>
                        Scheduled
                      </span>
                    </td>
                    <td>{money(row.cumulativePaid)}</td>
                    <td>{money(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", fontSize: "11px", color: "var(--muted)" }}>
            <span>Showing {filteredSchedule.length} of {scheduleRows.length} instalments</span>
            <strong style={{ color: "var(--navy)" }}>Total Repayment: {money(liveCalc.remainingRepayment)}</strong>
          </div>
        </section>
      </div>
    </div>
  )
}

function Results({
  calc,
  onSchedule,
  onSave,
  onNew,
  saved,
}: {
  calc: Calculation
  onSchedule: () => void
  onSave: () => void
  onNew: () => void
  saved: boolean
}) {
  const scheduleRows = useMemo(() => makeSchedule(calc), [calc])
  const [search, setSearch] = useState("")

  const filteredSchedule = useMemo(() => {
    if (!search.trim()) return scheduleRows
    const q = search.toLowerCase()
    return scheduleRows.filter(
      (r) =>
        String(r.installment).includes(q) ||
        r.dueDate.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
    )
  }, [scheduleRows, search])

  const totalReturn = calc.totalReturn || Math.round(calc.amount * (calc.rate / 100))
  const netHand = calc.netHand ?? (calc.amount - (calc.pfAmount || calc.totalFees || 0) - (calc.advanceDeducted || 0))
  const remainingRepayment = calc.remainingRepayment ?? totalReturn

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="success-label">
            <Icon name="check" size={15} /> FUNDING STATEMENT READY
          </div>
          <h2>{calc.customer}</h2>
          <p>
            Reference {calc.id} · Calculated{" "}
            {new Date(calc.date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="secondary" icon="plus" onClick={onNew}>
            New calculation
          </Button>
          <Button variant="secondary" icon="bookmark" onClick={onSave}>
            {saved ? "Saved ✓" : "Save"}
          </Button>
          <Button variant="secondary" icon="download" onClick={() => window.print()}>
            Print / PDF
          </Button>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success">
          <Icon name="check" /> Calculation saved successfully. You can access it anytime from Saved Calculations.
        </div>
      )}

      {/* Main Amounts Overview */}
      <section className="card" style={{ padding: "24px", marginBottom: "18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "18px", marginBottom: "18px" }}>
          <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>LOAN AMOUNT (SANCTION)</span>
              <span className="badge-lakh">{formatIndianWords(calc.amount)}</span>
            </div>
            <strong style={{ fontSize: "28px", color: "var(--navy)", fontWeight: 800 }}>
              {money(calc.amount)}
            </strong>
          </div>

          <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 700 }}>TOTAL RETURN AMOUNT</span>
              <span className="badge-return">Rate {calc.rate}%</span>
            </div>
            <strong style={{ fontSize: "28px", color: "var(--navy)", fontWeight: 800 }}>
              {money(totalReturn)}
            </strong>
            <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
              {formatIndianWords(totalReturn)}
            </div>
          </div>
        </div>

        {/* 4 Metric Pills */}
        <div className="metric-pills-row">
          <div className="metric-pill-item">
            <span>PF ({calc.pfPercent ?? calc.fee}%)</span>
            <strong>{money(calc.pfAmount ?? calc.totalFees)}</strong>
          </div>
          <div className="metric-pill-item">
            <span>ADVANCE DEDUCTED</span>
            <strong>{money(calc.advanceDeducted || 0)}</strong>
          </div>
          <div className="metric-pill-item">
            <span>PAYABLE EMIS</span>
            <strong>{calc.payableEmis || calc.months} (@ {calc.frequencyDays || 15}D)</strong>
          </div>
          <div className="metric-pill-item">
            <span>PER INSTALMENT</span>
            <strong style={{ color: "#b46b0a" }}>{money(calc.perInstalment || calc.emi)}</strong>
          </div>
        </div>

        {/* Advance Deduction & Repayment Split */}
        <div className="split-summary-card">
          <div className="split-summary-header">
            <h4>Advance Deduction & Repayment Split</h4>
            <span className="badge-lakh">Mode: Net Hand: {money(netHand)}</span>
          </div>
          <div className="split-summary-grid">
            <div>
              <span>Active EMIs to Pay:</span>
              <strong>{calc.payableEmis || calc.months} Instalments ({calc.deductedEmis || 0} deducted)</strong>
            </div>
            <div>
              <span>Adjusted Per EMI:</span>
              <strong style={{ color: "var(--blue)" }}>{money(calc.perInstalment || calc.emi)}</strong>
            </div>
            <div>
              <span>Remaining Repayment:</span>
              <strong>{money(remainingRepayment)}</strong>
            </div>
          </div>
        </div>

        {/* Net In-Hand Disbursement Green Card */}
        <div className="net-inhand-card">
          <div className="net-inhand-left">
            <span>NET IN-HAND DISBURSEMENT AMOUNT</span>
            <strong>{money(netHand)}</strong>
          </div>
          <div className="net-inhand-formula">
            <small>Formula: Loan − PF − Advance</small>
            {money(calc.amount)} − {money(calc.pfAmount ?? calc.totalFees)} − {money(calc.advanceDeducted || 0)}
          </div>
        </div>
      </section>

      {/* EMI Schedule Table */}
      <section className="card table-card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "15px", color: "var(--navy)" }}>
              EMI Schedule ({calc.payableEmis || calc.months} Payable Instalments)
            </h3>
            <small style={{ color: "var(--muted)", fontSize: "11px" }}>
              Starting {calc.startDate || "today"} • Every {calc.frequencyDays || 15} Days • ({calc.deductedEmis || 0} Advance EMI Deducted Upfront)
            </small>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div className="search-box" style={{ width: "220px", height: "32px" }}>
              <Icon name="search" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search EMI or Date..."
                style={{ fontSize: "11px" }}
              />
            </div>
            <Button variant="secondary" icon="table" onClick={onSchedule}>
              Detailed view
            </Button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>DUE DATE</th>
                <th>AMOUNT (₹)</th>
                <th>STATUS</th>
                <th>CUMULATIVE PAID</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedule.map((row) => (
                <tr key={row.installment}>
                  <td>
                    <strong>{row.installment}</strong>
                  </td>
                  <td>{row.dueDate}</td>
                  <td>
                    <strong>{money(row.amount)}</strong>
                  </td>
                  <td>
                    <span className="badge-lakh" style={{ padding: "2px 7px", fontSize: "10px", background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>
                      Scheduled
                    </span>
                  </td>
                  <td>{money(row.cumulativePaid)}</td>
                  <td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "11px", color: "var(--muted)" }}>
          <span>Showing {filteredSchedule.length} of {scheduleRows.length} instalments</span>
          <strong style={{ color: "var(--navy)", fontSize: "13px" }}>Total Repayment: {money(remainingRepayment)}</strong>
        </div>
      </section>
    </>
  )
}

function EmiSchedule({ calc }: { calc: Calculation }) {
  const rows = useMemo(() => makeSchedule(calc), [calc])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const perPage = 12

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(
      (r) =>
        String(r.installment).includes(q) ||
        r.dueDate.toLowerCase().includes(q) ||
        String(r.amount).includes(q)
    )
  }, [rows, search])

  const pages = Math.ceil(filtered.length / perPage) || 1
  const visible = filtered.slice((page - 1) * perPage, page * perPage)

  const exportCsv = () => {
    const header = "Installment,Due Date,Amount,Status,Cumulative Paid,Balance\n"
    const data = rows
      .map((r) =>
        [
          r.installment,
          `"${r.dueDate}"`,
          r.amount.toFixed(2),
          r.status,
          r.cumulativePaid.toFixed(2),
          r.balance.toFixed(2),
        ].join(",")
      )
      .join("\n")
    const url = URL.createObjectURL(new Blob([header + data], { type: "text/csv" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${calc.id}-funding-schedule.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <h2>EMI repayment schedule</h2>
          <p>
            {calc.customer} · {calc.id}
          </p>
        </div>
        <div className="intro-actions">
          <Button variant="secondary" icon="download" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button variant="secondary" icon="download" onClick={() => window.print()}>
            Export PDF
          </Button>
        </div>
      </div>

      <section className="schedule-summary">
        {[
          ["Sanction amount", money(calc.amount)],
          ["Total Return", money(calc.totalReturn || calc.amount * (calc.rate / 100))],
          ["Per instalment", money(calc.perInstalment || calc.emi)],
          ["Net in-hand", money(calc.netHand || 0)],
        ].map(([a, b]) => (
          <div key={a}>
            <span>{a}</span>
            <strong>{b}</strong>
          </div>
        ))}
      </section>

      <section className="card table-card schedule-table">
        <div className="card-header">
          <div>
            <h3>Instalment breakdown</h3>
            <p>Cycle: Every {calc.frequencyDays || 15} days · {calc.payableEmis || calc.months} active instalments</p>
          </div>
          <div className="search-box" style={{ width: "220px", height: "32px" }}>
            <Icon name="search" size={14} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Search date or amount..."
              style={{ fontSize: "11px" }}
            />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>DUE DATE</th>
                <th>AMOUNT (₹)</th>
                <th>STATUS</th>
                <th>CUMULATIVE PAID</th>
                <th>BALANCE</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.installment}>
                  <td>
                    <strong>{String(row.installment).padStart(2, "0")}</strong>
                  </td>
                  <td>{row.dueDate}</td>
                  <td>
                    <strong>{money(row.amount)}</strong>
                  </td>
                  <td>
                    <span className="badge-lakh" style={{ padding: "2px 7px", fontSize: "10px", background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}>
                      {row.status}
                    </span>
                  </td>
                  <td>{money(row.cumulativePaid)}</td>
                  <td>{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>TOTALS</td>
                <td>—</td>
                <td>{money(calc.remainingRepayment || (calc.perInstalment || calc.emi) * (calc.payableEmis || calc.months))}</td>
                <td>—</td>
                <td>{money(calc.remainingRepayment || (calc.perInstalment || calc.emi) * (calc.payableEmis || calc.months))}</td>
                <td>₹0</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing {(page - 1) * perPage + 1}–
            {Math.min(page * perPage, filtered.length)} of {filtered.length}{" "}
            instalments
          </span>
          <div>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pages, page + 1))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

function SavedCalculations({
  calcs,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onNew,
}: {
  calcs: Calculation[]
  onView: (c: Calculation) => void
  onEdit: (c: Calculation) => void
  onDuplicate: (c: Calculation) => void
  onDelete: (c: Calculation) => void
  onNew: () => void
}) {
  const [search, setSearch] = useState("")
  const [menu, setMenu] = useState<string | null>(null)
  const filtered = calcs.filter((c) =>
    `${c.customer} ${c.id}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <div className="page-intro">
        <div>
          <h2>Saved calculations</h2>
          <p>Review, duplicate, or update your funding assessments.</p>
        </div>
        <Button icon="plus" onClick={onNew}>
          New calculation
        </Button>
      </div>
      <section className="card table-card">
        <div className="list-toolbar">
          <div className="search-box large">
            <Icon name="search" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, business or reference ID"
            />
          </div>
          <span>{filtered.length} records</span>
        </div>
        {filtered.length ? (
          <CalculationTable
            calcs={filtered}
            onView={onView}
            actions={(c) => (
              <div className="action-menu-wrap">
                <button
                  className="more-btn"
                  onClick={() => setMenu(menu === c.id ? null : c.id)}
                >
                  •••
                </button>
                {menu === c.id && (
                  <div className="action-menu">
                    <button onClick={() => onView(c)}>
                      <Icon name="eye" />
                      View
                    </button>
                    <button onClick={() => onEdit(c)}>
                      <Icon name="edit" />
                      Edit
                    </button>
                    <button onClick={() => onDuplicate(c)}>
                      <Icon name="copy" />
                      Duplicate
                    </button>
                    <button className="danger" onClick={() => onDelete(c)}>
                      <Icon name="trash" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          />
        ) : (
          <EmptyState onAction={onNew} />
        )}
      </section>
    </>
  )
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
    )
    .join("\n")
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function StatusBadge({ status }: { status: InstallmentStatus }) {
  return (
    <span className={`status-badge status-${status.replace(" ", "-")}`}>
      {status}
    </span>
  )
}

function ReportFilters({
  search,
  setSearch,
  from,
  setFrom,
  to,
  setTo,
  category,
  setCategory,
  categories,
  status,
  setStatus,
}: {
  search: string
  setSearch: (value: string) => void
  from: string
  setFrom: (value: string) => void
  to: string
  setTo: (value: string) => void
  category?: string
  setCategory?: (value: string) => void
  categories?: ExpenseCategory[]
  status?: string
  setStatus?: (value: string) => void
}) {
  return (
    <div className="report-filters">
      <div className="search-box report-search">
        <Icon name="search" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search report records"
        />
      </div>
      <label>
        <span>From</span>
        <input
          type="date"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
      </label>
      <label>
        <span>To</span>
        <input
          type="date"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
      </label>
      {setCategory && (
        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            {categories?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {setStatus && (
        <label>
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partially paid">Partially paid</option>
          </select>
        </label>
      )}
    </div>
  )
}

function Reports({
  expenses,
  categories,
  installments,
  onPay,
  onDeleteExpense,
}: {
  expenses: Expense[]
  categories: ExpenseCategory[]
  installments: Installment[]
  onPay?: (item: Installment) => void
  onDeleteExpense?: (id: string) => void
}) {
  const [tab, setTab] = useState<"pnl" | "upcoming" | "delayed" | "expenses">(
    "pnl",
  )
  const [search, setSearch] = useState("")
  const [from, setFrom] = useState(monthDate(-5, 1))
  const [to, setTo] = useState(monthDate(1, 28))
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const inRange = (date: string) => date >= from && date <= to
  const filteredExpenses = expenses.filter(
    (item) =>
      inRange(item.date) &&
      (category === "all" || item.categoryId === category) &&
      `${item.title} ${item.id} ${item.paymentMethod}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const filteredInstallments = installments.filter(
    (item) =>
      inRange(item.dueDate) &&
      (status === "all" || item.status === status) &&
      `${item.customer} ${item.loanId} ${item.id}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const upcomingRows = filteredInstallments.filter((item) =>
    ["upcoming", "paid", "partially paid"].includes(item.status),
  )
  const delayedRows = filteredInstallments.filter((item) =>
    ["overdue", "partially paid"].includes(item.status),
  )
  const expenseTotal = filteredExpenses.reduce(
    (sum, item) => sum + item.amount,
    0,
  )
  const interestIncome = 785000
  const otherIncome = 82000
  const totalIncome = interestIncome + otherIncome
  const netProfit = totalIncome - expenseTotal
  const monthly = [
    ["Oct", 610000, 294000],
    ["Nov", 648000, 316000],
    ["Dec", 584000, 338000],
    ["Jan", 692000, 305000],
    ["Feb", 735000, 329000],
    ["Mar", 867000, expenseTotal],
  ] as const
  const exportCurrent = () => {
    if (tab === "expenses") {
      downloadCsv("geet-expense-report.csv", [
        ["ID", "Date", "Title", "Category", "Method", "Amount"],
        ...filteredExpenses.map((item) => [
          item.id,
          item.date,
          item.title,
          categories.find((cat) => cat.id === item.categoryId)?.name || "",
          item.paymentMethod,
          item.amount,
        ]),
      ])
    } else if (tab === "upcoming" || tab === "delayed") {
      const records = tab === "upcoming" ? upcomingRows : delayedRows
      downloadCsv(`geet-${tab}-emi-report.csv`, [
        [
          "Installment",
          "Loan ID",
          "Customer",
          "Due date",
          "Status",
          "EMI",
          "Paid",
          "Outstanding",
        ],
        ...records.map((item) => [
          item.id,
          item.loanId,
          item.customer,
          item.dueDate,
          item.status,
          item.amount,
          item.amountPaid,
          item.outstanding,
        ]),
      ])
    } else {
      downloadCsv("geet-profit-loss-report.csv", [
        ["Month", "Income", "Expenses", "Net"],
        ...monthly.map((item) => [
          item[0],
          item[1],
          item[2],
          item[1] - item[2],
        ]),
      ])
    }
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <h2>Financial reports</h2>
          <p>
            Demo reporting workspace—figures shown are sample business data, not
            actual records.
          </p>
        </div>
        <div className="intro-actions">
          <Button variant="secondary" icon="download" onClick={exportCurrent}>
            Export CSV
          </Button>
          <Button
            variant="secondary"
            icon="printer"
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
        </div>
      </div>
      <div className="demo-banner">
        <Icon name="alert" size={17} />
        <span>
          <strong>Demonstration data</strong> These financial figures are for
          prototype evaluation only.
        </span>
      </div>
      <div className="report-tabs">
        {[
          ["pnl", "Profit & Loss"],
          ["upcoming", "Upcoming EMI"],
          ["delayed", "Delayed EMI"],
          ["expenses", "Expenses"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => {
              setTab(id as typeof tab)
              setSearch("")
              setStatus("all")
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ReportFilters
        search={search}
        setSearch={setSearch}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        category={category}
        setCategory={tab === "expenses" ? setCategory : undefined}
        categories={categories}
        status={status}
        setStatus={
          tab === "upcoming" || tab === "delayed" ? setStatus : undefined
        }
      />
      {tab === "pnl" && (
        <>
          <section className="report-kpis">
            <div>
              <span>Total income</span>
              <strong>{money(totalIncome)}</strong>
              <small>Interest + other income</small>
            </div>
            <div>
              <span>Interest income</span>
              <strong>{money(interestIncome)}</strong>
              <small>90.5% of income</small>
            </div>
            <div>
              <span>Total expenses</span>
              <strong>{money(expenseTotal)}</strong>
              <small>Filtered expense records</small>
            </div>
            <div className={netProfit >= 0 ? "positive-kpi" : "negative-kpi"}>
              <span>Net profit / loss</span>
              <strong>{money(netProfit)}</strong>
              <small>Income less expenses</small>
            </div>
          </section>
          <section className="card report-chart-card">
            <div className="card-header">
              <div>
                <h3>Monthly comparison</h3>
                <p>Income, expenses and net result by month</p>
              </div>
            </div>
            <div className="monthly-chart">
              {monthly.map((item) => (
                <div className="monthly-group" key={item[0]}>
                  <div className="monthly-bars">
                    <i
                      style={{ height: `${Math.max(20, item[1] / 9000)}%` }}
                    ></i>
                    <i
                      style={{ height: `${Math.max(15, item[2] / 9000)}%` }}
                    ></i>
                  </div>
                  <span>{item[0]}</span>
                  <small>{money(item[1] - item[2])}</small>
                </div>
              ))}
            </div>
            <div className="chart-keys">
              <span>
                <i className="income-key"></i>Income
              </span>
              <span>
                <i className="expense-key"></i>Expenses
              </span>
            </div>
          </section>
          <section className="card pnl-table">
            <div className="card-header">
              <div>
                <h3>Profit & loss statement</h3>
                <p>Summary for the selected period</p>
              </div>
            </div>
            <div className="statement-row">
              <span>Interest income</span>
              <strong>{money(interestIncome)}</strong>
            </div>
            <div className="statement-row">
              <span>Processing fees and other income</span>
              <strong>{money(otherIncome)}</strong>
            </div>
            <div className="statement-row statement-total">
              <span>Total income</span>
              <strong>{money(totalIncome)}</strong>
            </div>
            <div className="statement-row">
              <span>Operating expenses</span>
              <strong>({money(expenseTotal)})</strong>
            </div>
            <div className="statement-row statement-net">
              <span>Net profit / loss</span>
              <strong>{money(netProfit)}</strong>
            </div>
          </section>
        </>
      )}
      {tab === "upcoming" && (
        <ReportEmiTable rows={upcomingRows} delayed={false} onPay={onPay} />
      )}
      {tab === "delayed" && <ReportEmiTable rows={delayedRows} delayed onPay={onPay} />}
      {tab === "expenses" && (
        <ExpenseReportTable rows={filteredExpenses} categories={categories} onDelete={onDeleteExpense} />
      )}
    </>
  )
}

function ReportEmiTable({
  rows,
  delayed,
  onPay,
}: {
  rows: Installment[]
  delayed: boolean
  onPay?: (item: Installment) => void
}) {
  const total = rows.reduce(
    (sum, item) => sum + item.amount - item.amountPaid,
    0,
  )
  return (
    <>
      <section className="report-kpis compact-kpis">
        <div>
          <span>
            {delayed ? "Overdue installments" : "Upcoming installments"}
          </span>
          <strong>{rows.length}</strong>
          <small>Filtered records</small>
        </div>
        <div>
          <span>{delayed ? "Total overdue" : "Upcoming collections"}</span>
          <strong>{money(total)}</strong>
          <small>Amount pending</small>
        </div>
        <div>
          <span>Outstanding balance</span>
          <strong>
            {money(rows.reduce((sum, item) => sum + item.outstanding, 0))}
          </strong>
          <small>Across listed loans</small>
        </div>
      </section>
      <section className="card table-card report-table">
        <div className="card-header">
          <div>
            <h3>{delayed ? "Delayed EMI report" : "Upcoming EMI report"}</h3>
            <p>
              Status distinguishes paid, upcoming, overdue and partially paid
              installments.
            </p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>INSTALLMENT</th>
                <th>CUSTOMER / LOAN</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th>EMI AMOUNT</th>
                {delayed && <th>DAYS DELAYED</th>}
                <th>AMOUNT DUE</th>
                <th>OUTSTANDING</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.id}</strong>
                  </td>
                  <td>
                    <strong>{item.customer}</strong>
                    <small className="table-subtext">{item.loanId}</small>
                  </td>
                  <td>
                    {new Date(item.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>{money(item.amount)}</td>
                  {delayed && (
                    <td>
                      <strong className="danger-text">
                        {item.daysDelayed} days
                      </strong>
                    </td>
                  )}
                  <td>
                    <strong>{money(item.amount - item.amountPaid)}</strong>
                  </td>
                  <td>{money(item.outstanding)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ minHeight: "28px", height: "28px", padding: "0 10px", fontSize: "11px" }}
                      onClick={() => onPay?.(item)}
                    >
                      Collect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && (
          <div className="report-empty">
            <Icon name="search" />
            <strong>No matching installments</strong>
            <span>Adjust the report filters to see more records.</span>
          </div>
        )}
      </section>
    </>
  )
}

function ExpenseReportTable({
  rows,
  categories,
  onDelete,
}: {
  rows: Expense[]
  categories: ExpenseCategory[]
  onDelete?: (id: string) => void
}) {
  const totals = categories
    .map((item) => ({
      name: item.name,
      amount: rows
        .filter((expense) => expense.categoryId === item.id)
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .filter((item) => item.amount)
    .sort((a, b) => b.amount - a.amount)
  return (
    <>
      <section className="report-kpis compact-kpis">
        <div>
          <span>Total expenses</span>
          <strong>
            {money(rows.reduce((sum, item) => sum + item.amount, 0))}
          </strong>
          <small>{rows.length} transactions</small>
        </div>
        <div>
          <span>Top category</span>
          <strong>{totals[0]?.name || "—"}</strong>
          <small>{totals[0] ? money(totals[0].amount) : "No expenses"}</small>
        </div>
        <div>
          <span>Average expense</span>
          <strong>
            {rows.length
              ? money(
                  rows.reduce((sum, item) => sum + item.amount, 0) /
                    rows.length,
                )
              : money(0)}
          </strong>
          <small>Per transaction</small>
        </div>
      </section>
      <div className="expense-report-grid">
        <section className="card category-report">
          <div className="card-header">
            <div>
              <h3>Category breakdown</h3>
              <p>Filtered expense distribution</p>
            </div>
          </div>
          <div className="category-bars">
            {totals.map((item, index) => (
              <div key={item.name}>
                <div>
                  <span>
                    <i className={`category-dot dot-${index % 5}`}></i>
                    {item.name}
                  </span>
                  <strong>{money(item.amount)}</strong>
                </div>
                <progress
                  value={item.amount}
                  max={totals[0]?.amount || 1}
                ></progress>
              </div>
            ))}
          </div>
        </section>
        <section className="card table-card">
          <div className="card-header">
            <div>
              <h3>Date-wise transactions</h3>
              <p>Expenses in the selected range</p>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>DATE / ID</th>
                  <th>EXPENSE</th>
                  <th>CATEGORY</th>
                  <th>PAYMENT METHOD</th>
                  <th>RECEIPT</th>
                  <th>AMOUNT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                      <small className="table-subtext">{item.id}</small>
                    </td>
                    <td>
                      <strong>{item.title}</strong>
                    </td>
                    <td>
                      {
                        categories.find((cat) => cat.id === item.categoryId)
                          ?.name
                      }
                    </td>
                    <td>{item.paymentMethod}</td>
                    <td>
                      {item.receipt ? (
                        <a
                          href={`/uploads/${item.receipt}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ref-link"
                          title="View receipt"
                        >
                          📎 {item.receipt}
                        </a>
                      ) : (
                        <span style={{ color: "#8898aa", fontSize: "10px" }}>None</span>
                      )}
                    </td>
                    <td>
                      <strong>{money(item.amount)}</strong>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => onDelete?.(item.id)}
                        className="icon-btn"
                        title="Delete expense"
                        style={{ color: "#c23c3c", position: "static", display: "inline-grid", width: "28px", height: "28px" }}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}

function AddExpense({
  categories,
  expenses,
  onSave,
}: {
  categories: ExpenseCategory[]
  expenses: Expense[]
  onSave: (expense: Expense) => void
}) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "",
    description: "",
    categoryId: "",
    receipt: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState("")
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = "Expense title is required."
    if (!Number(form.amount) || Number(form.amount) <= 0)
      next.amount = "Enter an amount greater than ₹0."
    if (!form.date) next.date = "Expense date is required."
    if (!form.categoryId) next.categoryId = "Select an expense category."
    if (!form.paymentMethod) next.paymentMethod = "Select a payment method."
    setErrors(next)
    if (Object.keys(next).length) return

    try {
      const formData = new FormData()
      formData.append("title", form.title.trim())
      formData.append("amount", form.amount)
      formData.append("date", form.date)
      formData.append("categoryId", form.categoryId)
      formData.append("paymentMethod", form.paymentMethod)
      formData.append("method", form.paymentMethod)
      formData.append("description", form.description)
      formData.append("desc", form.description)
      if (selectedFile) {
        formData.append("receiptFile", selectedFile)
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        onSave(data.data)
        setSuccess("Expense saved successfully to server.")
      } else {
        throw new Error(data.error || "Server error")
      }
    } catch {
      onSave({
        ...form,
        amount: Number(form.amount),
        id: `EXP-${String(Date.now()).slice(-4)}`,
      })
      setSuccess("Expense saved successfully.")
    }

    setForm({
      title: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: "",
      description: "",
      categoryId: "",
      receipt: "",
    })
    setSelectedFile(null)
    window.setTimeout(() => setSuccess(""), 3500)
  }
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))
  return (
    <div className="expense-page">
      <div className="page-intro">
        <div>
          <h2>Record an expense</h2>
          <p>Add an operational expense to the demo financial workspace.</p>
        </div>
      </div>
      {success && (
        <div className="alert alert-success">
          <Icon name="check" />
          {success}
        </div>
      )}
      <div className="expense-entry-grid">
        <form className="card expense-form" onSubmit={submit}>
          <div className="form-card-heading">
            <span className="setting-icon">
              <Icon name="receipt" />
            </span>
            <div>
              <h3>Expense details</h3>
              <p>Fields marked required must be completed.</p>
            </div>
          </div>
          <div className="form-grid">
            <Field label="Expense title *" error={errors.title}>
              <input
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                placeholder="e.g. Monthly office rent"
              />
            </Field>
            <Field label="Expense category *" error={errors.categoryId}>
              <select
                value={form.categoryId}
                onChange={(event) => update("categoryId", event.target.value)}
              >
                <option value="">Select a category</option>
                {categories
                  .filter((item) => item.active)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field
              label="Amount *"
              error={errors.amount}
              action={<span className="badge-lakh">{formatIndianWords(Number(form.amount) || 0) || "₹0"}</span>}
            >
              <div className="input-prefix">
                <span>₹</span>
                <input
                  value={form.amount}
                  onChange={(event) => update("amount", cleanNumericInput(event.target.value))}
                  type="text"
                  inputMode="numeric"
                  onWheel={(e) => (e.target as HTMLElement).blur()}
                  placeholder="0"
                />
              </div>
            </Field>
            <Field label="Expense date *" error={errors.date}>
              <input
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
                type="date"
              />
            </Field>
            <Field label="Payment method *" error={errors.paymentMethod}>
              <select
                value={form.paymentMethod}
                onChange={(event) =>
                  update("paymentMethod", event.target.value)
                }
              >
                <option value="">Select payment method</option>
                <option>Bank transfer</option>
                <option>UPI</option>
                <option>Corporate card</option>
                <option>Cash</option>
                <option>Cheque</option>
              </select>
            </Field>
            <Field
              label="Receipt upload"
              hint={
                form.receipt
                  ? `Selected: ${form.receipt}`
                  : "PDF, PNG or JPG up to 5 MB"
              }
            >
              <label className="upload-control">
                <Icon name="upload" />
                <span>{form.receipt || "Choose receipt"}</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      setSelectedFile(file)
                      update("receipt", file.name)
                    }
                  }}
                />
              </label>
            </Field>
            <Field label="Description" hint="Optional notes about this expense">
              <textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Add context or notes"
              />
            </Field>
          </div>
          <div className="form-actions">
            <Button
              variant="secondary"
              onClick={() =>
                setForm({
                  title: "",
                  amount: "",
                  date: new Date().toISOString().slice(0, 10),
                  paymentMethod: "",
                  description: "",
                  categoryId: "",
                  receipt: "",
                })
              }
            >
              Clear
            </Button>
            <Button type="submit" icon="check">
              Save expense
            </Button>
          </div>
        </form>
        <aside className="card expense-guidance">
          <div className="guide-icon">
            <Icon name="tag" />
          </div>
          <h3>Consistent categorization</h3>
          <p>
            The selected category is saved with the expense and used across
            dashboard totals and financial reports.
          </p>
          <div className="guide-rule"></div>
          <strong>Active categories</strong>
          <div className="mini-tags">
            {categories
              .filter((item) => item.active)
              .slice(0, 6)
              .map((item) => (
                <span key={item.id}>{item.name}</span>
              ))}
          </div>
        </aside>
      </div>
      <section className="card table-card recent-expenses">
        <div className="card-header">
          <div>
            <h3>Recent expenses</h3>
            <p>Latest demo expense records, including newly added items</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>DATE</th>
                <th>EXPENSE</th>
                <th>CATEGORY</th>
                <th>PAYMENT METHOD</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {expenses.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td>
                    {new Date(item.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <strong>{item.title}</strong>
                    <small className="table-subtext">{item.id}</small>
                  </td>
                  <td>
                    {categories.find((cat) => cat.id === item.categoryId)?.name}
                  </td>
                  <td>{item.paymentMethod}</td>
                  <td>
                    <strong>{money(item.amount)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function ExpenseCategories({
  categories,
  setCategories,
}: {
  categories: ExpenseCategory[]
  setCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>
}) {
  const [name, setName] = useState("")
  const [editing, setEditing] = useState<string | null>(null)
  const [feedback, setFeedback] = useState("")
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setFeedback("Enter a category name before saving.")
    if (editing) {
      setCategories((items) =>
        items.map((item) =>
          item.id === editing ? { ...item, name: name.trim() } : item,
        ),
      )
      try {
        await fetch(`/api/categories/${editing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        })
      } catch (e) {
        console.error(e)
      }
    } else {
      try {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        })
        const data = await res.json()
        if (data.success) {
          setCategories((items) => [...items, data.data])
        } else {
          setCategories((items) => [
            ...items,
            { id: `CAT-${Date.now()}`, name: name.trim(), active: true },
          ])
        }
      } catch {
        setCategories((items) => [
          ...items,
          { id: `CAT-${Date.now()}`, name: name.trim(), active: true },
        ])
      }
    }
    setFeedback(
      editing
        ? "Category updated successfully."
        : "Category added successfully.",
    )
    setName("")
    setEditing(null)
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <h2>Expense categories</h2>
          <p>
            Authorized administrator view for managing expense classification.
          </p>
        </div>
        <span className="admin-badge">
          <Icon name="check" size={14} /> Administrator access
        </span>
      </div>
      {feedback && (
        <div
          className={`alert ${
            feedback.startsWith("Enter") ? "alert-error" : "alert-success"
          }`}
        >
          {feedback}
        </div>
      )}
      <div className="category-management-grid">
        <form className="card category-form" onSubmit={submit}>
          <div className="form-card-heading">
            <span className="setting-icon">
              <Icon name="tag" />
            </span>
            <div>
              <h3>{editing ? "Edit category" : "Add a category"}</h3>
              <p>Categories appear in expense entry and reports.</p>
            </div>
          </div>
          <Field label="Category name">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Professional services"
            />
          </Field>
          <div className="form-actions">
            {editing && (
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(null)
                  setName("")
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" icon={editing ? "check" : "plus"}>
              {editing ? "Save changes" : "Add category"}
            </Button>
          </div>
        </form>
        <section className="card category-list-card">
          <div className="card-header">
            <div>
              <h3>All categories</h3>
              <p>
                {categories.filter((item) => item.active).length} active ·{" "}
                {categories.filter((item) => !item.active).length} inactive
              </p>
            </div>
          </div>
          <div className="category-list">
            {categories.map((item) => (
              <div className="category-item" key={item.id}>
                <span className="category-avatar">
                  {item.name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.id}</small>
                </span>
                <span
                  className={`category-state ${
                    item.active ? "active" : "inactive"
                  }`}
                >
                  {item.active ? "Active" : "Inactive"}
                </span>
                <button
                  className="category-action"
                  onClick={() => {
                    setEditing(item.id)
                    setName(item.name)
                  }}
                >
                  <Icon name="edit" size={16} />
                  Edit
                </button>
                <button
                  className="category-action"
                  onClick={async () => {
                    const nextActive = !item.active
                    setCategories((items) =>
                      items.map((category) =>
                        category.id === item.id
                          ? { ...category, active: nextActive }
                          : category,
                      ),
                    )
                    try {
                      await fetch(`/api/categories/${item.id}/toggle`, {
                        method: "PATCH",
                      })
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                >
                  {item.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

function Settings({ logout }: { logout: () => void }) {
  const [success, setSuccess] = useState("")
  const save = (e: FormEvent, message: string) => {
    e.preventDefault()
    setSuccess(message)
    window.setTimeout(() => setSuccess(""), 3000)
  }
  return (
    <div className="settings-page">
      <div className="page-intro">
        <div>
          <h2>Account settings</h2>
          <p>Manage your profile and workspace security.</p>
        </div>
      </div>
      {success && (
        <div className="alert alert-success">
          <Icon name="check" />
          {success}
        </div>
      )}
      <section className="card settings-card">
        <div className="settings-title">
          <div className="avatar large-avatar">AM</div>
          <div>
            <h3>Profile information</h3>
            <p>Update your name and contact details.</p>
          </div>
        </div>
        <form
          onSubmit={(e) => save(e, "Profile changes saved successfully.")}
          className="form-grid"
        >
          <Field label="Full name">
            <input defaultValue="Arjun Mehta" />
          </Field>
          <Field label="Work email">
            <input defaultValue="admin@geetenterprise.in" type="email" />
          </Field>
          <Field label="Role">
            <input defaultValue="Administrator" disabled />
          </Field>
          <Field label="Phone number">
            <input defaultValue="+91 98765 43210" />
          </Field>
          <div className="settings-action">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </section>
      <section className="card settings-card">
        <div className="settings-title">
          <div className="setting-icon">
            <Icon name="settings" />
          </div>
          <div>
            <h3>Change password</h3>
            <p>Use at least 8 characters with a number.</p>
          </div>
        </div>
        <form
          onSubmit={(e) => save(e, "Password updated successfully.")}
          className="form-grid"
        >
          <Field label="Current password">
            <input type="password" placeholder="Enter current password" />
          </Field>
          <div></div>
          <Field label="New password">
            <input type="password" placeholder="Enter new password" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" placeholder="Re-enter new password" />
          </Field>
          <div className="settings-action">
            <Button type="submit">Update password</Button>
          </div>
        </form>
      </section>
      <section className="card logout-card">
        <div>
          <h3>Sign out of Geet Enterprise</h3>
          <p>You’ll need to sign in again to access your workspace.</p>
        </div>
        <Button variant="danger" icon="logout" onClick={logout}>
          Log out
        </Button>
      </section>
    </div>
  )
}

function GeetEnterpriseApp() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [screen, setScreen] = useState<Screen>("dashboard")
  const [calcs, setCalcs] = useState<Calculation[]>(demoCalcs)
  const [current, setCurrent] = useState<Calculation>(demoCalcs[0])
  const [editing, setEditing] = useState<Calculation | undefined>()
  const [saved, setSaved] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [categories, setCategories] =
    useState<ExpenseCategory[]>(initialCategories)
  const [installments, setInstallments] =
    useState<Installment[]>(initialInstallments)
  const [isServerOnline, setIsServerOnline] = useState(false)

  const syncData = async () => {
    try {
      const res = await fetch("/api/initial-data")
      if (!res.ok) throw new Error("HTTP " + res.status)
      const json = await res.json()
      if (json.success && json.data) {
        if (json.data.categories?.length) {
          setCategories(json.data.categories)
        }
        if (json.data.expenses?.length) {
          setExpenses(json.data.expenses)
        }
        if (json.data.emis?.length) {
          setInstallments(json.data.emis)
        }
        if (json.data.calculations?.length) {
          setCalcs(json.data.calculations)
          setCurrent(json.data.calculations[0])
        }
        setIsServerOnline(true)
      }
    } catch {
      setIsServerOnline(false)
    }
  }

  useEffect(() => {
    syncData()

    // Global listener to prevent mouse wheel from changing input values across entire app
    const preventInputWheel = (e: WheelEvent) => {
      const active = document.activeElement as HTMLInputElement | null
      if (active && (active.tagName === "INPUT" || active.type === "number")) {
        active.blur()
      }
    }
    window.addEventListener("wheel", preventInputWheel, { passive: true })
    return () => window.removeEventListener("wheel", preventInputWheel)
  }, [])

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  const view = (c: Calculation) => {
    setCurrent(c)
    setSaved(calcs.some((item) => item.id === c.id))
    setScreen("results")
  }
  const save = async () => {
    if (!calcs.some((c) => c.id === current.id)) {
      setCalcs((prev) => [current, ...prev])
      try {
        await fetch("/api/calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(current),
        })
      } catch (err) {
        console.error("Failed saving calculation to server:", err)
      }
    }
    setSaved(true)
  }
  const calculate = (c: Calculation) => {
    setCurrent(c)
    setEditing(undefined)
    setSaved(false)
    setScreen("results")
  }
  const handleDuplicate = async (c: Calculation) => {
    const copy = {
      ...c,
      id: `GE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
      customer: `${c.customer} (Copy)`,
      date: new Date().toISOString(),
    }
    setCalcs((prev) => [copy, ...prev])
    try {
      await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copy),
      })
    } catch (err) {
      console.error(err)
    }
  }
  const handleDeleteCalc = async (c: Calculation) => {
    setCalcs((prev) => prev.filter((item) => item.id !== c.id))
    try {
      await fetch(`/api/calculations/${c.id}`, { method: "DELETE" })
    } catch (err) {
      console.error(err)
    }
  }
  const handlePayEmi = async (item: Installment) => {
    const remaining = item.amount - item.amountPaid
    const input = prompt(
      `Record payment for ${item.customer} (${item.loanId}):\nEnter payment amount (₹):`,
      String(remaining > 0 ? remaining : item.amount)
    )
    if (!input) return
    const payAmt = parseFloat(input)
    if (isNaN(payAmt) || payAmt <= 0) return alert("Please enter a valid amount.")

    try {
      const res = await fetch(`/api/emis/${item.id}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentAmount: payAmt }),
      })
      const data = await res.json()
      if (data.success) {
        setInstallments((prev) =>
          prev.map((inst) =>
            inst.id === item.id
              ? {
                  ...inst,
                  ...data.data,
                  amountPaid: data.data.paidAmount ?? inst.amountPaid,
                  outstanding: data.data.outstandingLoan ?? inst.outstanding,
                  status: (data.data.status || inst.status).toLowerCase(),
                }
              : inst
          )
        )
        alert(`Payment of ₹${payAmt.toLocaleString("en-IN")} recorded successfully!`)
      } else {
        alert(data.error || "Payment recording failed.")
      }
    } catch (err: any) {
      alert("Network error: " + err.message)
    }
  }
  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return
    setExpenses((prev) => prev.filter((item) => item.id !== id))
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" })
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <AppShell
      screen={screen}
      setScreen={(s) => {
        setEditing(undefined)
        setScreen(s)
      }}
      logout={() => setLoggedIn(false)}
      isServerOnline={isServerOnline}
      onSync={syncData}
    >
      {screen === "dashboard" && (
        <Dashboard
          calcs={calcs}
          expenses={expenses}
          categories={categories}
          installments={installments}
          setScreen={setScreen}
          view={view}
        />
      )}
      {screen === "calculator" && (
        <Calculator initial={editing} onCalculate={calculate} />
      )}
      {screen === "results" && (
        <Results
          calc={current}
          saved={saved}
          onSchedule={() => setScreen("schedule")}
          onSave={save}
          onNew={() => setScreen("calculator")}
        />
      )}
      {screen === "schedule" && <EmiSchedule calc={current} />}
      {screen === "saved" && (
        <SavedCalculations
          calcs={calcs}
          onView={view}
          onEdit={(c) => {
            setEditing(c)
            setScreen("calculator")
          }}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteCalc}
          onNew={() => setScreen("calculator")}
        />
      )}
      {screen === "reports" && (
        <Reports
          expenses={expenses}
          categories={categories}
          installments={installments}
          onPay={handlePayEmi}
          onDeleteExpense={handleDeleteExpense}
        />
      )}
      {screen === "add-expense" && (
        <AddExpense
          categories={categories}
          expenses={expenses}
          onSave={(expense) => setExpenses((items) => [expense, ...items])}
        />
      )}
      {screen === "categories" && (
        <ExpenseCategories
          categories={categories}
          setCategories={setCategories}
        />
      )}
      {screen === "settings" && <Settings logout={() => setLoggedIn(false)} />}
    </AppShell>
  )
}

export default function App() {
  return <GeetEnterpriseApp />
}
