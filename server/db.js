const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new DatabaseSync(dbPath);

// Initialize schema
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      theme TEXT NOT NULL,
      allocated REAL NOT NULL DEFAULT 0,
      available REAL NOT NULL DEFAULT 0,
      deployed REAL NOT NULL DEFAULT 0,
      recovery REAL NOT NULL DEFAULT 0,
      utilization REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS master_wallet (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_capital REAL NOT NULL DEFAULT 4575000,
      available_balance REAL NOT NULL DEFAULT 1224600,
      allocated_capital REAL NOT NULL DEFAULT 3350400,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      business TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      requirement REAL NOT NULL,
      source TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      business TEXT NOT NULL,
      customer TEXT NOT NULL,
      principal REAL NOT NULL,
      roi REAL NOT NULL,
      tenure INTEGER NOT NULL,
      emi REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      disbursement_amount REAL DEFAULT 0,
      utr TEXT DEFAULT '',
      payment_date TEXT DEFAULT '',
      payment_method TEXT DEFAULT '',
      proof_file TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS emis (
      id TEXT PRIMARY KEY,
      due_date TEXT NOT NULL,
      customer TEXT NOT NULL,
      loan_id TEXT NOT NULL,
      principal REAL NOT NULL,
      interest REAL NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      paid_date TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      submitted_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Approved',
      receipt_file TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      party TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedIfEmpty();
}

function seedIfEmpty() {
  const masterCount = db.prepare('SELECT COUNT(*) as count FROM master_wallet').get().count;
  if (masterCount === 0) {
    db.prepare(`
      INSERT INTO master_wallet (id, total_capital, available_balance, allocated_capital)
      VALUES (1, 4575000, 1224600, 3350400)
    `).run();
  }

  const walletCount = db.prepare('SELECT COUNT(*) as count FROM wallets').get().count;
  if (walletCount === 0) {
    const insertWallet = db.prepare(`
      INSERT INTO wallets (id, name, role, theme, allocated, available, deployed, recovery, utilization)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertWallet.run('u1', 'Amit Sharma', 'Credit Manager', 'violet', 1420000, 482400, 937600, 218450, 66);
    insertWallet.run('u2', 'Priya Mehta', 'Loan Officer', 'amber', 1150000, 316800, 833200, 184250, 72);
    insertWallet.run('u3', 'Rohan Khanna', 'Collections', 'cyan', 780400, 208900, 571500, 264800, 73);
  }

  const leadCount = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  if (leadCount === 0) {
    const insertLead = db.prepare(`
      INSERT INTO leads (id, business, contact_person, phone, email, requirement, source, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertLead.run('LD-1042', 'Aarav Industries', 'Neha Kapoor', '+91 98765 43210', 'neha@aaravind.com', 1200000, 'Referral', 'Qualified');
    insertLead.run('LD-1041', 'Sethi Distributors', 'Karan Sethi', '+91 98211 84002', 'karan@sethidist.com', 850000, 'Website', 'Follow-up');
    insertLead.run('LD-1040', 'Nanda Enterprises', 'Rahul Nanda', '+91 97111 22990', 'rahul@nandaent.com', 1500000, 'Partner', 'New');
    insertLead.run('LD-1039', 'Krishna Garments', 'Sonia Arora', '+91 98990 22114', 'sonia@krishnagarments.in', 600000, 'Referral', 'Qualified');
  }

  const loanCount = db.prepare('SELECT COUNT(*) as count FROM loans').get().count;
  if (loanCount === 0) {
    const insertLoan = db.prepare(`
      INSERT INTO loans (id, business, customer, principal, roi, tenure, emi, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertLoan.run('GE-2025-088', 'Rajesh Trading Co.', 'Rajesh Kumar', 800000, 18, 18, 51038, 'Active');
    insertLoan.run('GE-2025-087', 'Mehta Textiles', 'Vikram Mehta', 1250000, 16, 24, 61190, 'Active');
    insertLoan.run('GE-2025-086', 'Verma Logistics', 'Ankit Verma', 600000, 19, 12, 55308, 'Disbursal due');
    insertLoan.run('GE-2025-081', 'Patel Foods', 'Dhruv Patel', 1000000, 17, 18, 63409, 'Active');
    insertLoan.run('GE-2024-064', 'Singh Auto Parts', 'Manpreet Singh', 500000, 18, 12, 45840, 'Closed');
  }

  const emiCount = db.prepare('SELECT COUNT(*) as count FROM emis').get().count;
  if (emiCount === 0) {
    const insertEmi = db.prepare(`
      INSERT INTO emis (id, due_date, customer, loan_id, principal, interest, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertEmi.run('EMI-101', '15 Mar 2025', 'Rajesh Trading Co.', 'GE-2025-088', 39038, 12000, 51038, 'Upcoming');
    insertEmi.run('EMI-102', '16 Mar 2025', 'Mehta Textiles', 'GE-2025-087', 44523, 16667, 61190, 'Upcoming');
    insertEmi.run('EMI-103', '10 Mar 2025', 'Patel Foods', 'GE-2025-081', 49242, 14167, 63409, 'Paid');
    insertEmi.run('EMI-104', '08 Mar 2025', 'Ahuja Electricals', 'GE-2025-079', 31000, 9200, 40200, 'Partial');
    insertEmi.run('EMI-105', '05 Mar 2025', 'Kapoor Agencies', 'GE-2025-075', 27600, 8450, 36050, 'Overdue');
  }

  const expCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
  if (expCount === 0) {
    const insertExp = db.prepare(`
      INSERT INTO expenses (id, date, description, category, amount, submitted_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertExp.run('EXP-0284', '10 Mar 2025', 'Office rent', 'Operations', 72000, 'Amit Sharma', 'Approved');
    insertExp.run('EXP-0283', '08 Mar 2025', 'Legal documentation', 'Legal', 24600, 'Priya Mehta', 'Approved');
    insertExp.run('EXP-0282', '07 Mar 2025', 'Credit bureau subscription', 'Technology', 18000, 'Amit Sharma', 'Pending');
    insertExp.run('EXP-0281', '05 Mar 2025', 'Client meeting travel', 'Travel', 8450, 'Priya Mehta', 'Approved');
  }

  const txnCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  if (txnCount === 0) {
    const insertTxn = db.prepare(`
      INSERT INTO transactions (id, date, description, party, type, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertTxn.run('TXN-240312', '12 Mar 2025', 'EMI received', 'Mehta Textiles', 'Credit', 124500, 'Completed');
    insertTxn.run('TXN-240311', '11 Mar 2025', 'Loan disbursement', 'Rajesh Trading Co.', 'Debit', 800000, 'Completed');
    insertTxn.run('TXN-240310', '10 Mar 2025', 'Capital allocation', 'Amit Sharma', 'Debit', 500000, 'Completed');
    insertTxn.run('TXN-240309', '09 Mar 2025', 'Processing fee', 'Verma Logistics', 'Credit', 18880, 'Completed');
    insertTxn.run('TXN-240308', '08 Mar 2025', 'Office expense', 'Operations', 'Debit', 24600, 'Approved');
    insertTxn.run('TXN-240307', '07 Mar 2025', 'EMI received', 'Patel Foods', 'Credit', 86200, 'Completed');
  }
}

// ---------------------------------------------
// Data Access Functions
// ---------------------------------------------

function getMasterWallet() {
  return db.prepare('SELECT * FROM master_wallet WHERE id = 1').get();
}

function getWallets() {
  return db.prepare('SELECT * FROM wallets ORDER BY id ASC').all();
}

function getLeads() {
  return db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
}

function createLead(lead) {
  const count = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
  const id = lead.id || `LD-${count + 1043}`;
  db.prepare(`
    INSERT INTO leads (id, business, contact_person, phone, email, requirement, source, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    lead.business,
    lead.contact_person || lead.contactPerson || '',
    lead.phone || '',
    lead.email || '',
    Number(lead.requirement) || 0,
    lead.source || 'Referral',
    lead.status || 'New'
  );
  return db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
}

function convertLead(leadId) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
  if (!lead) return null;

  db.prepare("UPDATE leads SET status = 'Qualified' WHERE id = ?").run(leadId);

  // Automatically create loan proposal with status 'Disbursal due'
  const count = db.prepare('SELECT COUNT(*) as count FROM loans').get().count;
  const loanId = `GE-2025-${String(count + 89).padStart(3, '0')}`;
  const principal = Number(lead.requirement) || 500000;
  const roi = 18;
  const tenure = 12;
  const monthlyRate = roi / 1200;
  const emi = Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1));

  db.prepare(`
    INSERT INTO loans (id, business, customer, principal, roi, tenure, emi, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Disbursal due')
  `).run(loanId, lead.business, lead.contact_person, principal, roi, tenure, emi);

  return { lead: db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId), loanId };
}

function getLoans() {
  return db.prepare('SELECT * FROM loans ORDER BY created_at DESC').all();
}

function createLoan(loan) {
  const count = db.prepare('SELECT COUNT(*) as count FROM loans').get().count;
  const id = loan.id || `GE-2025-${String(count + 89).padStart(3, '0')}`;
  const principal = Number(loan.principal) || 500000;
  const roi = Number(loan.roi) || 18;
  const tenure = Number(loan.tenure) || 12;
  const monthlyRate = roi / 1200;
  const emi = loan.emi
    ? Number(loan.emi)
    : Math.round(principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1));

  db.prepare(`
    INSERT INTO loans (id, business, customer, principal, roi, tenure, emi, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    loan.business || loan.customer,
    loan.customer || loan.business,
    principal,
    roi,
    tenure,
    emi,
    loan.status || 'Active'
  );

  // Generate initial EMI schedule for the loan
  const countEmis = db.prepare('SELECT COUNT(*) as count FROM emis').get().count;
  const insertEmi = db.prepare(`
    INSERT INTO emis (id, due_date, customer, loan_id, principal, interest, amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Upcoming')
  `);
  const principalPart = Math.round(principal / tenure);
  const interestPart = emi - principalPart;

  const today = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 1; i <= Math.min(tenure, 3); i++) {
    const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 15);
    const dateStr = `${dueDate.getDate()} ${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`;
    insertEmi.run(`EMI-${countEmis + i}`, dateStr, loan.business, id, principalPart, interestPart, emi);
  }

  return db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
}

function disburseLoan(id, { amount, utr, paymentDate, paymentMethod, proofFile }) {
  const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
  if (!loan) return null;

  const disburseAmount = Number(amount) || loan.principal;

  db.prepare(`
    UPDATE loans
    SET status = 'Active', disbursement_amount = ?, utr = ?, payment_date = ?, payment_method = ?, proof_file = ?
    WHERE id = ?
  `).run(
    disburseAmount,
    utr || '',
    paymentDate || new Date().toISOString().slice(0, 10),
    paymentMethod || 'NEFT / RTGS',
    proofFile || '',
    id
  );

  // Update master wallet: decrease available balance, increase deployed
  db.prepare(`
    UPDATE master_wallet
    SET available_balance = MAX(0, available_balance - ?)
    WHERE id = 1
  `).run(disburseAmount);

  // Log transaction
  const countTxn = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const txnId = `TXN-${240313 + countTxn}`;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  db.prepare(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, 'Loan disbursement', ?, 'Debit', ?, 'Completed')
  `).run(txnId, dateStr, loan.business, disburseAmount);

  return db.prepare('SELECT * FROM loans WHERE id = ?').get(id);
}

function getEmis() {
  return db.prepare('SELECT * FROM emis ORDER BY created_at DESC').all();
}

function payEmi(id) {
  const emi = db.prepare('SELECT * FROM emis WHERE id = ?').get(id);
  if (!emi) return null;

  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  db.prepare(`
    UPDATE emis
    SET status = 'Paid', paid_date = ?
    WHERE id = ?
  `).run(dateStr, id);

  // Update master wallet: credit payment
  db.prepare(`
    UPDATE master_wallet
    SET available_balance = available_balance + ?
    WHERE id = 1
  `).run(emi.amount);

  // Log transaction
  const countTxn = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const txnId = `TXN-${240313 + countTxn}`;
  db.prepare(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, 'EMI received', ?, 'Credit', ?, 'Completed')
  `).run(txnId, dateStr, emi.customer, emi.amount);

  return db.prepare('SELECT * FROM emis WHERE id = ?').get(id);
}

function getExpenses() {
  return db.prepare('SELECT * FROM expenses ORDER BY created_at DESC').all();
}

function createExpense({ description, category, amount, submittedBy, receiptFile, date }) {
  const count = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
  const id = `EXP-0${285 + count}`;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const finalDate = date || `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const finalAmount = Number(amount) || 0;
  const submitter = submittedBy || 'Amit Sharma';

  db.prepare(`
    INSERT INTO expenses (id, date, description, category, amount, submitted_by, status, receipt_file)
    VALUES (?, ?, ?, ?, ?, ?, 'Approved', ?)
  `).run(id, finalDate, description, category, finalAmount, submitter, receiptFile || '');

  // Log transaction
  const countTxn = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const txnId = `TXN-${240313 + countTxn}`;
  db.prepare(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, 'Office expense', ?, 'Debit', ?, 'Approved')
  `).run(txnId, finalDate, category, finalAmount);

  // Deduct from submitter's wallet
  db.prepare(`
    UPDATE wallets
    SET available = MAX(0, available - ?)
    WHERE name = ?
  `).run(finalAmount, submitter);

  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
}

function approveExpense(id) {
  const exp = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!exp) return null;

  db.prepare("UPDATE expenses SET status = 'Approved' WHERE id = ?").run(id);
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
}

function getTransactions() {
  return db.prepare('SELECT * FROM transactions ORDER BY created_at DESC').all();
}

// Full Initial Data Hydration
function getInitialData() {
  return {
    masterWallet: getMasterWallet(),
    wallets: getWallets(),
    leads: getLeads(),
    loans: getLoans(),
    emis: getEmis(),
    expenses: getExpenses(),
    transactions: getTransactions()
  };
}

initDb();

module.exports = {
  db,
  getMasterWallet,
  getWallets,
  getLeads,
  createLead,
  convertLead,
  getLoans,
  createLoan,
  disburseLoan,
  getEmis,
  payEmi,
  getExpenses,
  createExpense,
  approveExpense,
  getTransactions,
  getInitialData
};
