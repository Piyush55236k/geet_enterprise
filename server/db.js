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
      capital_invested REAL NOT NULL DEFAULT 0,
      allocated REAL NOT NULL DEFAULT 0,
      available REAL NOT NULL DEFAULT 0,
      deployed REAL NOT NULL DEFAULT 0,
      recovery REAL NOT NULL DEFAULT 0,
      utilization REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS master_wallet (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_capital REAL NOT NULL DEFAULT 4575000,
      available_balance REAL NOT NULL DEFAULT 1525000,
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

  // Ensure capital_invested column exists if upgrading an existing db
  try {
    db.exec(`ALTER TABLE wallets ADD COLUMN capital_invested REAL NOT NULL DEFAULT 0`);
  } catch {
    // Column already exists
  }

  seedIfEmpty();
}

function seedIfEmpty() {
  const masterCount = db.prepare('SELECT COUNT(*) as count FROM master_wallet').get().count;
  if (masterCount === 0) {
    db.prepare(`
      INSERT INTO master_wallet (id, total_capital, available_balance, allocated_capital)
      VALUES (1, 4575000, 1525000, 3350400)
    `).run();
  }

  // Ensure partners in wallets table with capital_invested
  const walletCount = db.prepare('SELECT COUNT(*) as count FROM wallets').get().count;
  if (walletCount === 0) {
    const insertWallet = db.prepare(`
      INSERT INTO wallets (id, name, role, theme, capital_invested, allocated, available, deployed, recovery, utilization)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertWallet.run('u1', 'Amit Sharma', 'Managing Partner & Investor', 'violet', 2000000, 1420000, 482400, 937600, 218450, 66);
    insertWallet.run('u2', 'Priya Mehta', 'Senior Partner & Investor', 'amber', 1500000, 1150000, 316800, 833200, 184250, 72);
    insertWallet.run('u3', 'Rohan Khanna', 'Capital Partner & Investor', 'cyan', 1075000, 780400, 208900, 571500, 264800, 73);
  } else {
    // Update existing partners to have accurate capital_invested if 0
    const w1 = db.prepare("SELECT capital_invested FROM wallets WHERE id = 'u1'").get();
    if (!w1 || w1.capital_invested === 0) {
      db.prepare("UPDATE wallets SET capital_invested = 2000000, role = 'Managing Partner & Investor' WHERE id = 'u1'").run();
      db.prepare("UPDATE wallets SET capital_invested = 1500000, role = 'Senior Partner & Investor' WHERE id = 'u2'").run();
      db.prepare("UPDATE wallets SET capital_invested = 1075000, role = 'Capital Partner & Investor' WHERE id = 'u3'").run();
    }
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
    insertExp.run('EXP-0284', '10 Mar 2025', 'Office rent', 'Operations', 72000, 'Geet Admin', 'Approved');
    insertExp.run('EXP-0283', '08 Mar 2025', 'Legal documentation', 'Legal', 24600, 'Geet Admin', 'Approved');
    insertExp.run('EXP-0282', '07 Mar 2025', 'Credit bureau subscription', 'Technology', 18000, 'Geet Admin', 'Pending');
    insertExp.run('EXP-0281', '05 Mar 2025', 'Client meeting travel', 'Travel', 8450, 'Geet Admin', 'Approved');
  }

  const txnCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  if (txnCount === 0) {
    const insertTxn = db.prepare(`
      INSERT INTO transactions (id, date, description, party, type, amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertTxn.run('TXN-240312', '12 Mar 2025', 'EMI received', 'Mehta Textiles', 'Credit', 124500, 'Completed');
    insertTxn.run('TXN-240311', '11 Mar 2025', 'Loan disbursement', 'Rajesh Trading Co.', 'Debit', 800000, 'Completed');
    insertTxn.run('TXN-240310', '10 Mar 2025', 'Capital contribution', 'Amit Sharma', 'Credit', 2000000, 'Completed');
    insertTxn.run('TXN-240309', '09 Mar 2025', 'Processing fee', 'Verma Logistics', 'Credit', 18880, 'Completed');
    insertTxn.run('TXN-240308', '08 Mar 2025', 'Office expense', 'Central Balance / Operations', 'Debit', 24600, 'Approved');
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
  return db.prepare('SELECT * FROM wallets ORDER BY capital_invested DESC').all();
}

function addCapitalInvestment({ partnerId, partnerName, amount, role }) {
  const investAmount = Number(amount) || 0;
  if (investAmount <= 0) return null;

  let existing = null;
  if (partnerId) {
    existing = db.prepare('SELECT * FROM wallets WHERE id = ?').get(partnerId);
  } else if (partnerName) {
    existing = db.prepare('SELECT * FROM wallets WHERE LOWER(name) = LOWER(?)').get(partnerName);
  }

  if (existing) {
    db.prepare(`
      UPDATE wallets
      SET capital_invested = capital_invested + ?,
          allocated = allocated + ?
      WHERE id = ?
    `).run(investAmount, investAmount, existing.id);
  } else {
    const count = db.prepare('SELECT COUNT(*) as count FROM wallets').get().count;
    const newId = `u${count + 1}`;
    const name = partnerName || `Partner ${count + 1}`;
    const partnerRole = role || 'Capital Partner & Investor';
    const themes = ['violet', 'amber', 'cyan'];
    const theme = themes[count % themes.length];
    db.prepare(`
      INSERT INTO wallets (id, name, role, theme, capital_invested, allocated, available, deployed, recovery, utilization)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0)
    `).run(newId, name, partnerRole, theme, investAmount, investAmount);
  }

  // Update Master Wallet Centralized Balance and Total Capital
  db.prepare(`
    UPDATE master_wallet
    SET total_capital = total_capital + ?,
        available_balance = available_balance + ?
    WHERE id = 1
  `).run(investAmount, investAmount);

  // Log transaction
  const countTxn = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const txnId = `TXN-${240313 + countTxn}`;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  db.prepare(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, 'Capital investment', ?, 'Credit', ?, 'Completed')
  `).run(txnId, dateStr, partnerName || (existing ? existing.name : 'Capital Partner'), investAmount);

  return {
    masterWallet: getMasterWallet(),
    partners: getWallets(),
    pnl: getPnlDistribution()
  };
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

  db.prepare("UPDATE leads SET status = 'Converted' WHERE id = ?").run(leadId);

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
  `).run(loanId, lead.business, lead.contact_person || lead.business, principal, roi, tenure, emi);

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
    insertEmi.run(`EMI-${countEmis + i}`, dateStr, loan.business || loan.customer, id, principalPart, interestPart, emi);
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

  // Directly debit from Master Centralized Balance
  db.prepare(`
    UPDATE master_wallet
    SET available_balance = MAX(0, available_balance - ?),
        allocated_capital = allocated_capital + ?
    WHERE id = 1
  `).run(disburseAmount, disburseAmount);

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

  // Credit directly into Master Centralized Balance
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

// DIRECT DEBIT FROM CENTRALIZED BALANCE (NOT USER'S OWN WALLET)
function createExpense({ description, category, amount, submittedBy, receiptFile, date }) {
  const count = db.prepare('SELECT COUNT(*) as count FROM expenses').get().count;
  const id = `EXP-0${285 + count}`;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const finalDate = date || `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const finalAmount = Number(amount) || 0;
  const submitter = submittedBy || 'Enterprise Admin';

  db.prepare(`
    INSERT INTO expenses (id, date, description, category, amount, submitted_by, status, receipt_file)
    VALUES (?, ?, ?, ?, ?, ?, 'Approved', ?)
  `).run(id, finalDate, description, category, finalAmount, submitter, receiptFile || '');

  // Log transaction - Debited directly from Centralized Fund
  const countTxn = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  const txnId = `TXN-${240313 + countTxn}`;
  db.prepare(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, ?, ?, 'Debit', ?, 'Approved')
  `).run(txnId, finalDate, `Operating expense: ${description}`, `Central Balance / ${category}`, finalAmount);

  // DIRECT DEBIT FROM CENTRALIZED BALANCE (master_wallet)
  db.prepare(`
    UPDATE master_wallet
    SET available_balance = MAX(0, available_balance - ?)
    WHERE id = 1
  `).run(finalAmount);

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

// ---------------------------------------------
// Dynamic Profit & Loss Distribution by Capital
// ---------------------------------------------
function getPnlDistribution() {
  // 1. Calculate Gross Revenue
  const emiPaidInterest = db.prepare("SELECT COALESCE(SUM(interest), 0) as interest FROM emis WHERE status = 'Paid'").get().interest;
  
  // Historical interest income base + real paid interest
  const baseHistoricalInterest = 428650;
  const totalInterestEarned = baseHistoricalInterest + emiPaidInterest;

  // Processing fees from loans (5% standard or recorded transactions)
  const txFees = db.prepare("SELECT COALESCE(SUM(amount), 0) as fees FROM transactions WHERE description LIKE '%Processing fee%'").get().fees;
  const totalProcessingFees = txFees > 0 ? txFees : 68400;

  const grossRevenue = totalInterestEarned + totalProcessingFees;

  // 2. Total Operating Expenses (Debited directly from Centralized Balance)
  const expenseSum = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = 'Approved'").get().total;
  const totalExpenses = expenseSum > 0 ? expenseSum : 123050;

  // 3. Net Distributable Profit / (Loss)
  const netProfit = grossRevenue - totalExpenses;

  // 4. Partners / Investors and their Invested Capital
  const partners = db.prepare('SELECT * FROM wallets ORDER BY capital_invested DESC').all();
  const totalCapitalInvested = partners.reduce((sum, p) => sum + (Number(p.capital_invested) || 0), 0) || 4575000;

  // Distribute based on capital ratio: (capital / totalCapital) * 100
  const distribution = partners.map(p => {
    const capital = Number(p.capital_invested) || 0;
    const sharePct = Number(((capital / totalCapitalInvested) * 100).toFixed(2));
    const grossShare = Math.round((grossRevenue * sharePct) / 100);
    const expenseShare = Math.round((totalExpenses * sharePct) / 100);
    const netProfitShare = Math.round((netProfit * sharePct) / 100);
    const roiPct = capital > 0 ? Number(((netProfitShare / capital) * 100).toFixed(2)) : 0;

    return {
      id: p.id,
      name: p.name,
      role: p.role,
      theme: p.theme,
      capitalInvested: capital,
      sharePct,
      grossShare,
      expenseShare,
      netProfitShare,
      roiPct,
      status: netProfitShare >= 0 ? 'Profitable' : 'Deficit'
    };
  });

  return {
    grossRevenue,
    interestEarned: totalInterestEarned,
    processingFees: totalProcessingFees,
    totalExpenses,
    netProfit,
    profitMargin: Number(((netProfit / (grossRevenue || 1)) * 100).toFixed(1)),
    totalCapitalInvested,
    distribution
  };
}

// Full Initial Data Hydration
function getInitialData() {
  return {
    masterWallet: getMasterWallet(),
    partners: getWallets(),
    wallets: getWallets(),
    leads: getLeads(),
    loans: getLoans(),
    emis: getEmis(),
    expenses: getExpenses(),
    transactions: getTransactions(),
    pnl: getPnlDistribution()
  };
}

initDb();

module.exports = {
  db,
  getMasterWallet,
  getWallets,
  addCapitalInvestment,
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
  getPnlDistribution,
  getInitialData
};
