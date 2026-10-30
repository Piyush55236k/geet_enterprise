const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      budget REAL DEFAULT 0,
      desc TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monthly_revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month_key TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      interest_income REAL DEFAULT 0,
      fee_income REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      desc TEXT DEFAULT '',
      receipt TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS emi_records (
      id TEXT PRIMARY KEY,
      loan_id TEXT NOT NULL,
      customer TEXT NOT NULL,
      phone TEXT DEFAULT '',
      due_date TEXT NOT NULL,
      installment_no TEXT NOT NULL,
      emi_amount REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      outstanding_loan REAL NOT NULL,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculations (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      amount REAL NOT NULL,
      rate REAL NOT NULL,
      tenure REAL NOT NULL,
      tenure_unit TEXT DEFAULT 'months',
      fee REAL DEFAULT 0,
      charges REAL DEFAULT 0,
      months REAL NOT NULL,
      emi REAL NOT NULL,
      total_interest REAL NOT NULL,
      total_fees REAL NOT NULL,
      date TEXT NOT NULL,
      meta_json TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    db.exec('ALTER TABLE calculations ADD COLUMN meta_json TEXT DEFAULT "{}"');
  } catch (e) {
    // Column already exists
  }
}

function calculateLoan(amount, rate, tenure, tenureUnit, fee = 0, charges = 0) {
  const months = tenureUnit === 'years' ? tenure * 12 : tenure;
  const monthlyRate = rate / 1200;
  const emi =
    monthlyRate === 0
      ? amount / months
      : (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
  const totalInterest = emi * months - amount;
  const totalFees = (amount * fee) / 100 + charges;
  return { months, emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalFees: Math.round(totalFees) };
}

function seedIfEmpty() {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    const seedPath = path.join(__dirname, 'seed_data.json');
    if (fs.existsSync(seedPath)) {
      const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

      // Seed Categories
      const insertCat = db.prepare(`
        INSERT INTO categories (id, name, budget, desc, active)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const c of data.cats) {
        insertCat.run(c.id, c.name, Number(c.budget) || 0, c.desc || '', c.active ? 1 : 0);
      }

      // Seed Monthly Revenue
      const insertRev = db.prepare(`
        INSERT INTO monthly_revenue (month_key, label, interest_income, fee_income)
        VALUES (?, ?, ?, ?)
      `);
      for (const r of data.revs) {
        insertRev.run(r.monthKey, r.label, Number(r.interestIncome) || 0, Number(r.feeIncome) || 0);
      }

      // Seed Expenses
      const insertExp = db.prepare(`
        INSERT INTO expenses (id, date, title, category_id, amount, method, desc, receipt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const e of data.exps) {
        insertExp.run(e.id, e.date, e.title, e.categoryId, Number(e.amount) || 0, e.method, e.desc || '', e.receipt || '');
      }

      // Seed EMIs
      const insertEmi = db.prepare(`
        INSERT INTO emi_records (id, loan_id, customer, phone, due_date, installment_no, emi_amount, paid_amount, outstanding_loan, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of data.emis) {
        insertEmi.run(
          m.id,
          m.loanId,
          m.customer,
          m.phone || '',
          m.dueDate,
          m.installmentNo,
          Number(m.emiAmount) || 0,
          Number(m.paidAmount) || 0,
          Number(m.outstandingLoan) || 0,
          m.status
        );
      }
    }
  }

  // Seed calculations if empty
  const calcCount = db.prepare('SELECT COUNT(*) as count FROM calculations').get().count;
  if (calcCount === 0) {
    const demoCalcsData = [
      { id: 'GE-2025-1048', customer: 'Aarav Textiles Pvt. Ltd.', amount: 1250000, rate: 10.5, tenure: 5, tenureUnit: 'years', fee: 1, charges: 2500 },
      { id: 'GE-2025-1044', customer: 'Sharma Trading Co.', amount: 850000, rate: 11.25, tenure: 48, tenureUnit: 'months', fee: 1.25, charges: 1800 },
      { id: 'GE-2025-1039', customer: 'Bluebird Foods LLP', amount: 2000000, rate: 9.75, tenure: 7, tenureUnit: 'years', fee: 0.75, charges: 3500 },
      { id: 'GE-2025-1033', customer: 'Riya Enterprises', amount: 575000, rate: 12, tenure: 36, tenureUnit: 'months', fee: 1, charges: 1500 }
    ];

    const insertCalc = db.prepare(`
      INSERT INTO calculations (id, customer, amount, rate, tenure, tenure_unit, fee, charges, months, emi, total_interest, total_fees, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    demoCalcsData.forEach((item, i) => {
      const computed = calculateLoan(item.amount, item.rate, item.tenure, item.tenureUnit, item.fee, item.charges);
      const dateStr = new Date(Date.now() - i * 86400000 * 3).toISOString();
      insertCalc.run(
        item.id,
        item.customer,
        item.amount,
        item.rate,
        item.tenure,
        item.tenureUnit,
        item.fee,
        item.charges,
        computed.months,
        computed.emi,
        computed.totalInterest,
        computed.totalFees,
        dateStr
      );
    });
  }

  console.log('✅ SQLite Database ready with full schema and seed data.');
}

initSchema();
seedIfEmpty();

// CATEGORIES QUERIES
function getCategories() {
  const rows = db.prepare(`
    SELECT c.*, 
      COALESCE(SUM(e.amount), 0) AS total_spent,
      COUNT(e.id) AS expense_count
    FROM categories c
    LEFT JOIN expenses e ON e.category_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at ASC
  `).all();

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    budget: Number(r.budget),
    desc: r.desc,
    active: Boolean(r.active),
    totalSpent: Number(r.total_spent),
    expenseCount: Number(r.expense_count)
  }));
}

function getCategoryById(id) {
  const r = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    budget: Number(r.budget),
    desc: r.desc,
    active: Boolean(r.active)
  };
}

function createCategory({ id, name, budget = 0, desc = '', active = true }) {
  const catId = id || ('CAT-' + Date.now().toString(36).toUpperCase());
  db.prepare(`
    INSERT INTO categories (id, name, budget, desc, active)
    VALUES (?, ?, ?, ?, ?)
  `).run(catId, name, Number(budget) || 0, desc || '', active ? 1 : 0);
  return getCategoryById(catId);
}

function updateCategory(id, { name, budget, desc, active }) {
  const existing = getCategoryById(id);
  if (!existing) return null;

  const newName = name !== undefined ? name : existing.name;
  const newBudget = budget !== undefined ? Number(budget) : existing.budget;
  const newDesc = desc !== undefined ? desc : existing.desc;
  const newActive = active !== undefined ? (active ? 1 : 0) : (existing.active ? 1 : 0);

  db.prepare(`
    UPDATE categories
    SET name = ?, budget = ?, desc = ?, active = ?
    WHERE id = ?
  `).run(newName, newBudget, newDesc, newActive, id);

  return getCategoryById(id);
}

function toggleCategory(id) {
  const existing = getCategoryById(id);
  if (!existing) return null;
  const nextStatus = existing.active ? 0 : 1;
  db.prepare('UPDATE categories SET active = ? WHERE id = ?').run(nextStatus, id);
  return getCategoryById(id);
}

function deleteCategory(id) {
  const count = db.prepare('SELECT COUNT(*) as count FROM expenses WHERE category_id = ?').get(id).count;
  if (count > 0) {
    db.prepare('UPDATE categories SET active = 0 WHERE id = ?').run(id);
    return { success: true, deactivated: true, message: 'Category contains expenses and was deactivated.' };
  }
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return { success: true, deactivated: false, message: 'Category deleted.' };
}

// MONTHLY REVENUE QUERIES
function getMonthlyRevenue() {
  const rows = db.prepare('SELECT * FROM monthly_revenue ORDER BY month_key ASC').all();
  return rows.map(r => ({
    id: r.id,
    monthKey: r.month_key,
    label: r.label,
    interestIncome: Number(r.interest_income),
    feeIncome: Number(r.fee_income)
  }));
}

function upsertMonthlyRevenue({ monthKey, label, interestIncome, feeIncome }) {
  db.prepare(`
    INSERT INTO monthly_revenue (month_key, label, interest_income, fee_income)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(month_key) DO UPDATE SET
      label = excluded.label,
      interest_income = excluded.interest_income,
      fee_income = excluded.fee_income
  `).run(monthKey, label, Number(interestIncome) || 0, Number(feeIncome) || 0);

  return db.prepare('SELECT * FROM monthly_revenue WHERE month_key = ?').get(monthKey);
}

// EXPENSES QUERIES
function getExpenses({ startDate, endDate, categoryId, search } = {}) {
  let sql = `
    SELECT e.*, c.name AS category_name, c.active AS category_active
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    sql += ' AND e.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND e.date <= ?';
    params.push(endDate);
  }
  if (categoryId && categoryId !== 'all' && categoryId !== 'ALL') {
    sql += ' AND e.category_id = ?';
    params.push(categoryId);
  }
  if (search) {
    sql += ' AND (LOWER(e.title) LIKE ? OR LOWER(e.desc) LIKE ? OR LOWER(e.method) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY e.date DESC, e.created_at DESC';

  const rows = db.prepare(sql).all(...params);
  return rows.map(r => ({
    id: r.id,
    date: r.date,
    title: r.title,
    categoryId: r.category_id,
    categoryName: r.category_name || 'Uncategorized',
    categoryActive: Boolean(r.category_active),
    amount: Number(r.amount),
    method: r.method,
    paymentMethod: r.method, // Support React client field
    desc: r.desc || '',
    description: r.desc || '', // Support React client field
    receipt: r.receipt || '',
    createdAt: r.created_at
  }));
}

function getExpenseById(id) {
  const r = db.prepare(`
    SELECT e.*, c.name AS category_name
    FROM expenses e
    LEFT JOIN categories c ON c.id = e.category_id
    WHERE e.id = ?
  `).get(id);
  if (!r) return null;
  return {
    id: r.id,
    date: r.date,
    title: r.title,
    categoryId: r.category_id,
    categoryName: r.category_name,
    amount: Number(r.amount),
    method: r.method,
    paymentMethod: r.method,
    desc: r.desc,
    description: r.desc,
    receipt: r.receipt,
    createdAt: r.created_at
  };
}

function createExpense({ id, date, title, categoryId, amount, method, paymentMethod, desc, description, receipt }) {
  let expId = id;
  if (!expId) {
    const count = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
    expId = `EXP-${count + 101}`;
  }

  const finalMethod = method || paymentMethod || 'Bank transfer';
  const finalDesc = desc || description || '';

  db.prepare(`
    INSERT INTO expenses (id, date, title, category_id, amount, method, desc, receipt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(expId, date, title, categoryId, Number(amount), finalMethod, finalDesc, receipt || '');

  return getExpenseById(expId);
}

function deleteExpense(id) {
  const exp = getExpenseById(id);
  if (!exp) return false;
  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return true;
}

// EMI RECORDS QUERIES
function getEMIs({ startDate, endDate, status, search, delinquentOnly } = {}) {
  let sql = 'SELECT * FROM emi_records WHERE 1=1';
  const params = [];

  if (delinquentOnly) {
    sql += " AND (LOWER(status) = 'overdue' OR LOWER(status) = 'partially paid')";
  } else if (status && status !== 'all' && status !== 'ALL' && status !== 'DELINQUENT') {
    sql += ' AND LOWER(status) = LOWER(?)';
    params.push(status);
  } else if (status === 'DELINQUENT') {
    sql += " AND (LOWER(status) = 'overdue' OR LOWER(status) = 'partially paid')";
  }

  if (startDate) {
    sql += ' AND due_date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    sql += ' AND due_date <= ?';
    params.push(endDate);
  }
  if (search) {
    sql += ' AND (LOWER(customer) LIKE ? OR LOWER(loan_id) LIKE ? OR LOWER(phone) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY due_date ASC';

  const rows = db.prepare(sql).all(...params);
  return rows.map(r => {
    const due = new Date(r.due_date);
    const diff = Math.floor((Date.now() - due) / 86400000);
    const daysDelayed = diff > 0 ? diff : 0;
    const normStatus = r.status.toLowerCase();

    return {
      id: r.id,
      loanId: r.loan_id,
      customer: r.customer,
      phone: r.phone || '',
      dueDate: r.due_date,
      installmentNo: r.installment_no,
      emiAmount: Number(r.emi_amount),
      amount: Number(r.emi_amount), // React client field
      paidAmount: Number(r.paid_amount),
      amountPaid: Number(r.paid_amount), // React client field
      outstandingLoan: Number(r.outstanding_loan),
      outstanding: Number(r.outstanding_loan), // React client field
      status: normStatus, // lowercase for React client ("upcoming" | "paid" | "overdue" | "partially paid")
      rawStatus: r.status,
      daysDelayed,
      createdAt: r.created_at
    };
  });
}

function getEMIById(id) {
  const r = db.prepare('SELECT * FROM emi_records WHERE id = ?').get(id);
  if (!r) return null;
  const due = new Date(r.due_date);
  const diff = Math.floor((Date.now() - due) / 86400000);
  const daysDelayed = diff > 0 ? diff : 0;
  return {
    id: r.id,
    loanId: r.loan_id,
    customer: r.customer,
    phone: r.phone,
    dueDate: r.due_date,
    installmentNo: r.installment_no,
    emiAmount: Number(r.emi_amount),
    amount: Number(r.emi_amount),
    paidAmount: Number(r.paid_amount),
    amountPaid: Number(r.paid_amount),
    outstandingLoan: Number(r.outstanding_loan),
    outstanding: Number(r.outstanding_loan),
    status: r.status.toLowerCase(),
    rawStatus: r.status,
    daysDelayed
  };
}

function payEMI(id, paymentAmount) {
  const emi = getEMIById(id);
  if (!emi) return null;

  const payAmt = Number(paymentAmount) || 0;
  const newPaidAmount = emi.paidAmount + payAmt;
  const newOutstanding = Math.max(0, emi.outstandingLoan - payAmt);
  let newStatus = emi.rawStatus;

  if (newPaidAmount >= emi.emiAmount) {
    newStatus = 'Paid';
  } else if (newPaidAmount > 0) {
    newStatus = 'Partially Paid';
  }

  db.prepare(`
    UPDATE emi_records
    SET paid_amount = ?, outstanding_loan = ?, status = ?
    WHERE id = ?
  `).run(newPaidAmount, newOutstanding, newStatus, id);

  return getEMIById(id);
}

function createEMI({ loanId, customer, phone, dueDate, installmentNo = '1 / 12', emiAmount, amount, paidAmount = 0, amountPaid = 0, outstandingLoan, outstanding, status = 'Upcoming' }) {
  const count = db.prepare('SELECT COUNT(*) as count FROM emi_records').get().count;
  const emiId = `EMI-${count + 901}`;
  const finalEmi = Number(emiAmount || amount || 0);
  const finalPaid = Number(paidAmount || amountPaid || 0);
  const finalOutstanding = Number(outstandingLoan || outstanding || finalEmi);

  db.prepare(`
    INSERT INTO emi_records (id, loan_id, customer, phone, due_date, installment_no, emi_amount, paid_amount, outstanding_loan, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    emiId,
    loanId,
    customer,
    phone || '',
    dueDate,
    installmentNo,
    finalEmi,
    finalPaid,
    finalOutstanding,
    status
  );

  return getEMIById(emiId);
}

function updateEMI(id, fields) {
  const existing = getEMIById(id);
  if (!existing) return null;

  const loanId = fields.loanId !== undefined ? fields.loanId : existing.loanId;
  const customer = fields.customer !== undefined ? fields.customer : existing.customer;
  const phone = fields.phone !== undefined ? fields.phone : existing.phone;
  const dueDate = fields.dueDate !== undefined ? fields.dueDate : existing.dueDate;
  const installmentNo = fields.installmentNo !== undefined ? fields.installmentNo : existing.installmentNo;
  const emiAmount = fields.emiAmount !== undefined ? Number(fields.emiAmount) : (fields.amount !== undefined ? Number(fields.amount) : existing.emiAmount);
  const paidAmount = fields.paidAmount !== undefined ? Number(fields.paidAmount) : (fields.amountPaid !== undefined ? Number(fields.amountPaid) : existing.paidAmount);
  const outstandingLoan = fields.outstandingLoan !== undefined ? Number(fields.outstandingLoan) : (fields.outstanding !== undefined ? Number(fields.outstanding) : existing.outstandingLoan);
  const status = fields.status !== undefined ? fields.status : existing.rawStatus;

  db.prepare(`
    UPDATE emi_records
    SET loan_id = ?, customer = ?, phone = ?, due_date = ?, installment_no = ?,
        emi_amount = ?, paid_amount = ?, outstanding_loan = ?, status = ?
    WHERE id = ?
  `).run(loanId, customer, phone, dueDate, installmentNo, emiAmount, paidAmount, outstandingLoan, status, id);

  return getEMIById(id);
}

function deleteEMI(id) {
  const existing = getEMIById(id);
  if (!existing) return false;
  db.prepare('DELETE FROM emi_records WHERE id = ?').run(id);
  return true;
}

// CALCULATIONS QUERIES (Funding Calculator)
function getCalculations() {
  const rows = db.prepare('SELECT * FROM calculations ORDER BY created_at DESC').all();
  return rows.map(r => {
    let meta = {};
    try {
      if (r.meta_json) meta = JSON.parse(r.meta_json);
    } catch (e) {}

    return {
      ...meta,
      id: r.id,
      customer: r.customer,
      amount: Number(r.amount),
      rate: Number(r.rate),
      tenure: Number(r.tenure),
      tenureUnit: r.tenure_unit,
      fee: Number(r.fee),
      charges: Number(r.charges),
      months: Number(r.months),
      emi: Number(r.emi),
      totalInterest: Number(r.total_interest),
      totalFees: Number(r.total_fees),
      date: r.date
    };
  });
}

function createCalculation(calc) {
  const id = calc.id || (`GE-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`);
  const dateStr = calc.date || new Date().toISOString();
  const metaJson = JSON.stringify(calc);

  db.prepare(`
    INSERT INTO calculations (id, customer, amount, rate, tenure, tenure_unit, fee, charges, months, emi, total_interest, total_fees, date, meta_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      customer = excluded.customer,
      amount = excluded.amount,
      rate = excluded.rate,
      tenure = excluded.tenure,
      tenure_unit = excluded.tenure_unit,
      fee = excluded.fee,
      charges = excluded.charges,
      months = excluded.months,
      emi = excluded.emi,
      total_interest = excluded.total_interest,
      total_fees = excluded.total_fees,
      date = excluded.date,
      meta_json = excluded.meta_json
  `).run(
    id,
    calc.customer,
    Number(calc.amount),
    Number(calc.rate),
    Number(calc.tenure || calc.tenureDays || 105),
    calc.tenureUnit || 'days',
    Number(calc.fee || calc.pfPercent || 0),
    Number(calc.charges || 0),
    Number(calc.months || calc.payableEmis || 6),
    Number(calc.emi || calc.perInstalment || 0),
    Number(calc.totalInterest || 0),
    Number(calc.totalFees || calc.pfAmount || 0),
    dateStr,
    metaJson
  );

  const row = db.prepare('SELECT * FROM calculations WHERE id = ?').get(id);
  let meta = {};
  try {
    if (row.meta_json) meta = JSON.parse(row.meta_json);
  } catch (e) {}

  return {
    ...meta,
    id: row.id,
    customer: row.customer,
    amount: Number(row.amount),
    rate: Number(row.rate),
    tenure: Number(row.tenure),
    tenureUnit: row.tenure_unit,
    fee: Number(row.fee),
    charges: Number(row.charges),
    months: Number(row.months),
    emi: Number(row.emi),
    totalInterest: Number(row.total_interest),
    totalFees: Number(row.total_fees),
    date: row.date
  };
}

function deleteCalculation(id) {
  const count = db.prepare('DELETE FROM calculations WHERE id = ?').run(id).changes;
  return count > 0;
}

module.exports = {
  db,
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategory,
  deleteCategory,
  getMonthlyRevenue,
  upsertMonthlyRevenue,
  getExpenses,
  getExpenseById,
  createExpense,
  deleteExpense,
  getEMIs,
  getEMIById,
  payEMI,
  createEMI,
  updateEMI,
  deleteEMI,
  getCalculations,
  createCalculation,
  deleteCalculation
};
