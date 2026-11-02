require('dotenv').config();
const mysql = require('mysql2/promise');
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

// -------------------------------------------------------------
// Database Configuration (Hostinger MySQL & Clean Local Fallback)
// -------------------------------------------------------------
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'u368199755_geetenterprise',
  password: process.env.DB_PASSWORD || '+&+fdVHSe/5',
  database: process.env.DB_NAME || 'u368199755_geetenterprise',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 3000
};

let mysqlPool = null;
let sqliteDb = null;
let isMySql = false;

// -------------------------------------------------------------
// Table Definitions (MySQL & SQLite Compatible)
// -------------------------------------------------------------
const tableSchemas = [
  `CREATE TABLE IF NOT EXISTS master_wallet (
    id INT PRIMARY KEY,
    total_capital DOUBLE NOT NULL DEFAULT 0,
    available_balance DOUBLE NOT NULL DEFAULT 0,
    allocated_capital DOUBLE NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS wallets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    theme VARCHAR(64) NOT NULL,
    capital_invested DOUBLE NOT NULL DEFAULT 0,
    allocated DOUBLE NOT NULL DEFAULT 0,
    available DOUBLE NOT NULL DEFAULT 0,
    deployed DOUBLE NOT NULL DEFAULT 0,
    recovery DOUBLE NOT NULL DEFAULT 0,
    utilization DOUBLE NOT NULL DEFAULT 0,
    phone VARCHAR(64) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    status VARCHAR(64) DEFAULT 'Active'
  )`,

  `CREATE TABLE IF NOT EXISTS financer_teams (
    id VARCHAR(64) PRIMARY KEY,
    financer_id VARCHAR(64) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'Loan Agent / Sub-Team',
    phone VARCHAR(64) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    status VARCHAR(64) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS leads (
    id VARCHAR(64) PRIMARY KEY,
    business VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    email VARCHAR(255) DEFAULT '',
    requirement DOUBLE NOT NULL,
    source VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'New',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    financer_id VARCHAR(64) DEFAULT '',
    financer_name VARCHAR(255) DEFAULT '',
    team_id VARCHAR(64) DEFAULT '',
    team_name VARCHAR(255) DEFAULT '',
    attribution VARCHAR(255) DEFAULT '',
    created_by VARCHAR(64) DEFAULT 'Admin',
    utr VARCHAR(255) DEFAULT ''
  )`,

  `CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(64) PRIMARY KEY,
    business VARCHAR(255) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    principal DOUBLE NOT NULL,
    roi DOUBLE NOT NULL,
    tenure INT NOT NULL,
    emi DOUBLE NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'Active',
    disbursement_amount DOUBLE DEFAULT 0,
    utr VARCHAR(255) DEFAULT '',
    payment_date VARCHAR(64) DEFAULT '',
    payment_method VARCHAR(64) DEFAULT '',
    proof_file VARCHAR(255) DEFAULT '',
    total_return DOUBLE DEFAULT 0,
    net_in_hand DOUBLE DEFAULT 0,
    advance_deducted DOUBLE DEFAULT 0,
    processing_fee DOUBLE DEFAULT 0,
    tenure_days INT DEFAULT 0,
    frequency_days INT DEFAULT 0,
    payable_emis INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS emis (
    id VARCHAR(64) PRIMARY KEY,
    due_date VARCHAR(64) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    loan_id VARCHAR(64) NOT NULL,
    principal DOUBLE NOT NULL,
    interest DOUBLE NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'Upcoming',
    paid_date VARCHAR(64) DEFAULT '',
    utr VARCHAR(255) DEFAULT '',
    payment_method VARCHAR(64) DEFAULT '',
    proof_file VARCHAR(255) DEFAULT '',
    installment_num INT DEFAULT 1,
    total_return DOUBLE DEFAULT 0,
    balance DOUBLE DEFAULT 0,
    cumulative_paid DOUBLE DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(64) PRIMARY KEY,
    date VARCHAR(64) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    amount DOUBLE NOT NULL,
    submitted_by VARCHAR(64) NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'Approved',
    receipt_file VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    date VARCHAR(64) NOT NULL,
    description VARCHAR(255) NOT NULL,
    party VARCHAR(255) NOT NULL,
    type VARCHAR(64) NOT NULL,
    amount DOUBLE NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

// Initialize MySQL or fallback SQLite
async function initDb() {
  try {
    const pool = mysql.createPool(dbConfig);
    // Test connectivity
    const connection = await pool.getConnection();
    connection.release();
    mysqlPool = pool;
    isMySql = true;
    console.log(`[Database] Connected successfully to MySQL: ${dbConfig.database} @ ${dbConfig.host}:${dbConfig.port}`);

    // Create tables in MySQL
    for (const sql of tableSchemas) {
      await mysqlPool.query(sql);
    }

    // Initialize clean master wallet row if empty
    const [rows] = await mysqlPool.query('SELECT COUNT(*) as count FROM master_wallet');
    if (rows[0].count === 0) {
      await mysqlPool.query('INSERT INTO master_wallet (id, total_capital, available_balance, allocated_capital) VALUES (1, 0, 0, 0)');
    }
  } catch (err) {
    console.log(`[Database] Note: MySQL not reachable at ${dbConfig.host}:${dbConfig.port} (${err.code || err.message}).`);
    console.log('[Database] Initializing fresh local SQLite database (Zero seed data, fresh start).');
    isMySql = false;

    const dbPath = path.join(__dirname, 'database.sqlite');
    sqliteDb = new DatabaseSync(dbPath);

    for (const sql of tableSchemas) {
      sqliteDb.exec(sql);
    }

    // Ensure clean master wallet row with 0 values
    const count = sqliteDb.prepare('SELECT COUNT(*) as count FROM master_wallet').get().count;
    if (count === 0) {
      sqliteDb.prepare('INSERT INTO master_wallet (id, total_capital, available_balance, allocated_capital) VALUES (1, 0, 0, 0)').run();
    }
  }
}

// -------------------------------------------------------------
// Unified Query Helpers
// -------------------------------------------------------------
async function query(sql, params = []) {
  if (isMySql && mysqlPool) {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  } else {
    return sqliteDb.prepare(sql).all(...params);
  }
}

async function queryOne(sql, params = []) {
  if (isMySql && mysqlPool) {
    const [rows] = await mysqlPool.query(sql, params);
    return rows[0] || null;
  } else {
    return sqliteDb.prepare(sql).get(...params) || null;
  }
}

async function execute(sql, params = []) {
  if (isMySql && mysqlPool) {
    const [result] = await mysqlPool.query(sql, params);
    return result;
  } else {
    return sqliteDb.prepare(sql).run(...params);
  }
}

// -------------------------------------------------------------
// Core Business Methods
// -------------------------------------------------------------

async function getMasterWallet() {
  const row = await queryOne('SELECT * FROM master_wallet WHERE id = 1');
  return row || { id: 1, total_capital: 0, available_balance: 0, allocated_capital: 0 };
}

async function getWallets() {
  return await query('SELECT * FROM wallets ORDER BY capital_invested DESC');
}

async function getFinancersWithTeams() {
  const financers = await query('SELECT * FROM wallets ORDER BY capital_invested DESC');
  const results = [];
  for (const f of financers) {
    const teams = await query('SELECT * FROM financer_teams WHERE financer_id = ? ORDER BY created_at ASC', [f.id]);
    const leadCountRes = await queryOne('SELECT COUNT(*) as count FROM leads WHERE financer_id = ?', [f.id]);
    results.push({
      ...f,
      teams,
      leadsCount: leadCountRes?.count || 0
    });
  }
  return results;
}

async function addFinancer({ name, role, phone, email, capitalInvested }) {
  const countRow = await queryOne('SELECT COUNT(*) as count FROM wallets');
  const count = Number(countRow?.count || 0);
  const newId = `u${count + 1}`;
  const financerRole = role || 'Financer / Capital Partner';
  const themes = ['violet', 'amber', 'cyan'];
  const theme = themes[count % themes.length];
  const cap = Number(capitalInvested) || 0;

  await execute(`
    INSERT INTO wallets (id, name, role, theme, capital_invested, allocated, available, deployed, recovery, utilization, phone, email, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, 'Active')
  `, [newId, name, financerRole, theme, cap, cap, phone || '', email || '']);

  if (cap > 0) {
    await execute(`
      UPDATE master_wallet
      SET total_capital = total_capital + ?,
          available_balance = available_balance + ?
      WHERE id = 1
    `, [cap, cap]);

    const countTxnRow = await queryOne('SELECT COUNT(*) as count FROM transactions');
    const txnId = `TXN-${String(Number(countTxnRow?.count || 0) + 1).padStart(6, '0')}`;
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

    await execute(`
      INSERT INTO transactions (id, date, description, party, type, amount, status)
      VALUES (?, ?, 'Financer capital addition', ?, 'Credit', ?, 'Completed')
    `, [txnId, dateStr, name, cap]);
  }

  return await queryOne('SELECT * FROM wallets WHERE id = ?', [newId]);
}

async function addFinancerTeam({ financerId, name, role, phone, email }) {
  const countRow = await queryOne('SELECT COUNT(*) as count FROM financer_teams');
  const id = `tm-${Number(countRow?.count || 0) + 1}`;
  await execute(`
    INSERT INTO financer_teams (id, financer_id, name, role, phone, email, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Active')
  `, [id, financerId, name, role || 'Loan Agent / Sub-Team', phone || '', email || '']);
  return await queryOne('SELECT * FROM financer_teams WHERE id = ?', [id]);
}

async function deleteFinancerTeam(teamId) {
  return await execute('DELETE FROM financer_teams WHERE id = ?', [teamId]);
}

async function addCapitalInvestment({ partnerId, partnerName, amount, role }) {
  const investAmount = Number(amount) || 0;
  if (investAmount <= 0) return null;

  let existing = null;
  if (partnerId) {
    existing = await queryOne('SELECT * FROM wallets WHERE id = ?', [partnerId]);
  } else if (partnerName) {
    existing = await queryOne('SELECT * FROM wallets WHERE LOWER(name) = LOWER(?)', [partnerName]);
  }

  if (existing) {
    await execute(`
      UPDATE wallets
      SET capital_invested = capital_invested + ?,
          allocated = allocated + ?
      WHERE id = ?
    `, [investAmount, investAmount, existing.id]);
  } else {
    const countRow = await queryOne('SELECT COUNT(*) as count FROM wallets');
    const count = Number(countRow?.count || 0);
    const newId = `u${count + 1}`;
    const name = partnerName || `Partner ${count + 1}`;
    const partnerRole = role || 'Capital Partner & Investor';
    const themes = ['violet', 'amber', 'cyan'];
    const theme = themes[count % themes.length];
    await execute(`
      INSERT INTO wallets (id, name, role, theme, capital_invested, allocated, available, deployed, recovery, utilization)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, 0)
    `, [newId, name, partnerRole, theme, investAmount, investAmount]);
  }

  await execute(`
    UPDATE master_wallet
    SET total_capital = total_capital + ?,
        available_balance = available_balance + ?
    WHERE id = 1
  `, [investAmount, investAmount]);

  const countTxnRow = await queryOne('SELECT COUNT(*) as count FROM transactions');
  const txnId = `TXN-${String(Number(countTxnRow?.count || 0) + 1).padStart(6, '0')}`;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  await execute(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, 'Capital investment', ?, 'Credit', ?, 'Completed')
  `, [txnId, dateStr, partnerName || (existing ? existing.name : 'Capital Partner'), investAmount]);

  return {
    masterWallet: await getMasterWallet(),
    partners: await getWallets(),
    pnl: await getPnlDistribution()
  };
}

async function getLeads() {
  return await query('SELECT * FROM leads ORDER BY created_at DESC');
}

async function createLead(lead) {
  const countRow = await queryOne('SELECT COUNT(*) as count FROM leads');
  const id = lead.id || `LD-${Number(countRow?.count || 0) + 1001}`;

  const financerId = lead.financer_id || lead.financerId || '';
  const financerName = lead.financer_name || lead.financerName || '';
  const teamId = lead.team_id || lead.teamId || '';
  const teamName = lead.team_name || lead.teamName || '';
  const createdBy = lead.created_by || lead.createdBy || 'Admin';

  let attribution = 'Admin Direct';
  if (financerName) {
    if (teamName) {
      attribution = `${financerName} ➔ ${teamName}`;
    } else {
      attribution = `${financerName} (Direct)`;
    }
  }

  await execute(`
    INSERT INTO leads (id, business, contact_person, phone, email, requirement, source, status, financer_id, financer_name, team_id, team_name, attribution, created_by, utr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    lead.business,
    lead.contact_person || lead.contactPerson || '',
    lead.phone || '',
    lead.email || '',
    Number(lead.requirement) || 0,
    lead.source || 'Referral',
    lead.status || 'New',
    financerId,
    financerName,
    teamId,
    teamName,
    attribution,
    createdBy,
    lead.utr || ''
  ]);

  return await queryOne('SELECT * FROM leads WHERE id = ?', [id]);
}

async function convertLead(leadId, customTerms = {}) {
  const lead = await queryOne('SELECT * FROM leads WHERE id = ?', [leadId]);
  if (!lead) return null;

  const loanPayload = {
    ...customTerms,
    leadId,
    business: lead.business,
    customer: lead.contact_person || lead.business,
    principal: customTerms.principal || lead.requirement
  };

  const createdLoan = await createLoan(loanPayload);
  return { lead: await queryOne('SELECT * FROM leads WHERE id = ?', [leadId]), loanId: createdLoan.id };
}

async function getLoans() {
  return await query('SELECT * FROM loans ORDER BY created_at DESC');
}

async function createLoan(loan) {
  const countRow = await queryOne('SELECT COUNT(*) as count FROM loans');
  const count = Number(countRow?.count || 0);
  const id = loan.id || `GE-2025-${String(count + 1).padStart(3, '0')}`;
  const principal = Number(loan.principal) || 1000000;
  const multiplier = Number(loan.rateMultiplier || loan.roi) || 130;
  const totalReturn = Number(loan.totalReturn) || Math.round(principal * (multiplier / 100));
  const tenureDays = Number(loan.tenureDays) || (Number(loan.tenure) ? Number(loan.tenure) * 30 : 105);
  const cycleDays = Number(loan.cycleDays || loan.frequencyDays) || 15;
  const pfAmount = Number(loan.processingFee) || Math.round(principal * 0.05);
  const advanceDeducted = Number(loan.advanceDeducted) || 0;
  const netInHand = Number(loan.netInHand) || (principal - pfAmount - advanceDeducted);
  const payableEmis = Number(loan.payableEmis) || Math.max(1, Math.round(tenureDays / cycleDays));
  const remainingRepayment = totalReturn - advanceDeducted;
  const emiAmount = Number(loan.emi || loan.perEmi) || Math.round(remainingRepayment / payableEmis);

  const disburseAmount = Number(loan.netInHand) || principal;
  const hasUtr = Boolean(loan.utr && String(loan.utr).trim());
  const finalStatus = hasUtr ? 'Active' : (loan.status || 'Disbursal due');
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  await execute(`
    INSERT INTO loans (
      id, business, customer, principal, roi, tenure, emi, status,
      total_return, net_in_hand, advance_deducted, processing_fee, tenure_days, frequency_days, payable_emis,
      disbursement_amount, utr, payment_date, payment_method
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    loan.business || loan.customer,
    loan.customer || loan.business,
    principal,
    multiplier,
    Math.max(1, Math.round(tenureDays / 30)),
    emiAmount,
    finalStatus,
    totalReturn,
    netInHand,
    advanceDeducted,
    pfAmount,
    tenureDays,
    cycleDays,
    payableEmis,
    hasUtr ? disburseAmount : 0,
    hasUtr ? String(loan.utr).trim() : '',
    hasUtr ? (loan.paymentDate || dateStr) : '',
    hasUtr ? (loan.paymentMethod || 'NEFT / RTGS') : ''
  ]);

  // Mark lead converted if from lead
  if (loan.leadId) {
    try {
      await execute("UPDATE leads SET status = 'Converted', utr = ? WHERE id = ?", [hasUtr ? String(loan.utr).trim() : '', loan.leadId]);
    } catch {
      await execute("UPDATE leads SET status = 'Converted' WHERE id = ?", [loan.leadId]);
    }
  }

  // If UTR is entered at conversion, debit Central Pool and record transaction
  if (hasUtr) {
    await execute(`
      UPDATE master_wallet
      SET available_balance = CASE WHEN available_balance >= ? THEN available_balance - ? ELSE 0 END,
          allocated_capital = allocated_capital + ?
      WHERE id = 1
    `, [disburseAmount, disburseAmount, disburseAmount]);

    const countTxnRow = await queryOne('SELECT COUNT(*) as count FROM transactions');
    const txnId = `TXN-${String(Number(countTxnRow?.count || 0) + 1).padStart(6, '0')}`;

    await execute(`
      INSERT INTO transactions (id, date, description, party, type, amount, status)
      VALUES (?, ?, ?, ?, 'Debit', ?, 'Completed')
    `, [txnId, dateStr, `Loan Disbursal (UTR: ${String(loan.utr).trim()})`, loan.business || loan.customer, disburseAmount]);
  }

  // Create all EMIs for this loan
  const countEmisRow = await queryOne('SELECT COUNT(*) as count FROM emis');
  const countEmis = Number(countEmisRow?.count || 0);

  if (Array.isArray(loan.emiSchedule) && loan.emiSchedule.length > 0) {
    for (let idx = 0; idx < loan.emiSchedule.length; idx++) {
      const item = loan.emiSchedule[idx];
      const emiId = `EMI-${countEmis + idx + 1}`;
      const amount = Number(item.amount) || emiAmount;
      const principalPart = Number(item.principal) || Math.round(amount * 0.74);
      const interestPart = Number(item.interest) || (amount - principalPart);

      await execute(`
        INSERT INTO emis (
          id, due_date, customer, loan_id, principal, interest, amount, status,
          installment_num, total_return, balance, cumulative_paid
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Upcoming', ?, ?, ?, ?)
      `, [
        emiId,
        item.dueDate || `${cycleDays * (idx + 1)} Days`,
        loan.business || loan.customer,
        id,
        principalPart,
        interestPart,
        amount,
        Number(item.num) || (idx + 1),
        totalReturn,
        Number(item.balance) || 0,
        Number(item.cumulativePaid) || 0
      ]);
    }
  } else {
    const startDate = loan.startDate ? new Date(loan.startDate) : new Date();
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const principalPart = Math.round((principal - advanceDeducted) / payableEmis);
    const interestPart = emiAmount - principalPart;

    let cumulative = 0;
    for (let i = 1; i <= payableEmis; i++) {
      const emiId = `EMI-${countEmis + i}`;
      const dueDate = new Date(startDate.getTime() + (i * cycleDays * 24 * 60 * 60 * 1000));
      const dateStrEmi = `${String(dueDate.getDate()).padStart(2, '0')} ${months[dueDate.getMonth()]} ${dueDate.getFullYear()} (${daysArr[dueDate.getDay()]})`;
      cumulative += emiAmount;
      const balance = Math.max(0, remainingRepayment - cumulative);

      await execute(`
        INSERT INTO emis (
          id, due_date, customer, loan_id, principal, interest, amount, status,
          installment_num, total_return, balance, cumulative_paid
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Upcoming', ?, ?, ?, ?)
      `, [
        emiId,
        dateStrEmi,
        loan.business || loan.customer,
        id,
        principalPart,
        interestPart,
        emiAmount,
        i,
        totalReturn,
        balance,
        cumulative
      ]);
    }
  }

  return await queryOne('SELECT * FROM loans WHERE id = ?', [id]);
}

async function disburseLoan(id, { amount, utr, paymentDate, paymentMethod, proofFile }) {
  const loan = await queryOne('SELECT * FROM loans WHERE id = ?', [id]);
  if (!loan) return null;

  const disburseAmount = Number(amount) || loan.principal;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  await execute(`
    UPDATE loans
    SET status = 'Active', disbursement_amount = ?, utr = ?, payment_date = ?, payment_method = ?, proof_file = ?
    WHERE id = ?
  `, [
    disburseAmount,
    utr || '',
    paymentDate || dateStr,
    paymentMethod || 'NEFT / RTGS',
    proofFile || '',
    id
  ]);

  await execute(`
    UPDATE master_wallet
    SET available_balance = CASE WHEN available_balance >= ? THEN available_balance - ? ELSE 0 END,
        allocated_capital = allocated_capital + ?
    WHERE id = 1
  `, [disburseAmount, disburseAmount, disburseAmount]);

  const countTxnRow = await queryOne('SELECT COUNT(*) as count FROM transactions');
  const txnId = `TXN-${String(Number(countTxnRow?.count || 0) + 1).padStart(6, '0')}`;

  await execute(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, 'Loan disbursement', ?, 'Debit', ?, 'Completed')
  `, [txnId, dateStr, loan.business, disburseAmount]);

  return await queryOne('SELECT * FROM loans WHERE id = ?', [id]);
}

async function getEmis() {
  return await query('SELECT * FROM emis ORDER BY created_at DESC');
}

async function payEmi(id, { utr, paymentDate, paymentMethod, proofFile } = {}) {
  const emi = await queryOne('SELECT * FROM emis WHERE id = ?', [id]);
  if (!emi) return null;

  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const defaultDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const finalPaidDate = paymentDate || defaultDate;
  const finalUtr = utr || '';
  const finalMethod = paymentMethod || 'NEFT / RTGS';
  const finalProof = proofFile || '';

  await execute(`
    UPDATE emis
    SET status = 'Paid',
        paid_date = ?,
        utr = ?,
        payment_method = ?,
        proof_file = ?
    WHERE id = ?
  `, [finalPaidDate, finalUtr, finalMethod, finalProof, id]);

  await execute(`
    UPDATE master_wallet
    SET available_balance = available_balance + ?
    WHERE id = 1
  `, [emi.amount]);

  const countTxnRow = await queryOne('SELECT COUNT(*) as count FROM transactions');
  const txnId = `TXN-${String(Number(countTxnRow?.count || 0) + 1).padStart(6, '0')}`;
  const desc = finalUtr ? `EMI received (UTR: ${finalUtr})` : 'EMI received';

  await execute(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, ?, ?, 'Credit', ?, 'Completed')
  `, [txnId, finalPaidDate, desc, emi.customer, emi.amount]);

  return await queryOne('SELECT * FROM emis WHERE id = ?', [id]);
}

async function getExpenses() {
  return await query('SELECT * FROM expenses ORDER BY created_at DESC');
}

async function createExpense({ description, category, amount, submittedBy, receiptFile, date }) {
  const countRow = await queryOne('SELECT COUNT(*) as count FROM expenses');
  const id = `EXP-${String(Number(countRow?.count || 0) + 1).padStart(4, '0')}`;
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const finalDate = date || `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const finalAmount = Number(amount) || 0;
  const submitter = submittedBy || 'Enterprise Admin';

  await execute(`
    INSERT INTO expenses (id, date, description, category, amount, submitted_by, status, receipt_file)
    VALUES (?, ?, ?, ?, ?, ?, 'Approved', ?)
  `, [id, finalDate, description, category, finalAmount, submitter, receiptFile || '']);

  const countTxnRow = await queryOne('SELECT COUNT(*) as count FROM transactions');
  const txnId = `TXN-${String(Number(countTxnRow?.count || 0) + 1).padStart(6, '0')}`;

  await execute(`
    INSERT INTO transactions (id, date, description, party, type, amount, status)
    VALUES (?, ?, ?, ?, 'Debit', ?, 'Approved')
  `, [txnId, finalDate, `Operating expense: ${description}`, `Central Balance / ${category}`, finalAmount]);

  await execute(`
    UPDATE master_wallet
    SET available_balance = CASE WHEN available_balance >= ? THEN available_balance - ? ELSE 0 END
    WHERE id = 1
  `, [finalAmount, finalAmount]);

  return await queryOne('SELECT * FROM expenses WHERE id = ?', [id]);
}

async function approveExpense(id) {
  await execute("UPDATE expenses SET status = 'Approved' WHERE id = ?", [id]);
  return await queryOne('SELECT * FROM expenses WHERE id = ?', [id]);
}

async function getTransactions() {
  return await query('SELECT * FROM transactions ORDER BY created_at DESC');
}

// -------------------------------------------------------------
// Real Dynamic Profit & Loss (Pure Math - Zero Hardcoded Seed Fallbacks)
// -------------------------------------------------------------
async function getPnlDistribution() {
  const emiPaidRes = await queryOne("SELECT COALESCE(SUM(interest), 0) as interest FROM emis WHERE status = 'Paid'");
  const totalInterestEarned = Number(emiPaidRes?.interest || 0);

  const txFeesRes = await queryOne("SELECT COALESCE(SUM(amount), 0) as fees FROM transactions WHERE description LIKE '%Processing fee%'");
  const totalProcessingFees = Number(txFeesRes?.fees || 0);

  const grossRevenue = totalInterestEarned + totalProcessingFees;

  const expenseRes = await queryOne("SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE status = 'Approved'");
  const totalExpenses = Number(expenseRes?.total || 0);

  const netProfit = grossRevenue - totalExpenses;

  const partners = await query('SELECT * FROM wallets ORDER BY capital_invested DESC');
  const totalCapitalInvested = partners.reduce((sum, p) => sum + (Number(p.capital_invested) || 0), 0);

  const distribution = partners.map(p => {
    const capital = Number(p.capital_invested) || 0;
    const sharePct = totalCapitalInvested > 0 ? Number(((capital / totalCapitalInvested) * 100).toFixed(2)) : 0;
    const grossShare = totalCapitalInvested > 0 ? Math.round((grossRevenue * sharePct) / 100) : 0;
    const expenseShare = totalCapitalInvested > 0 ? Math.round((totalExpenses * sharePct) / 100) : 0;
    const netProfitShare = totalCapitalInvested > 0 ? Math.round((netProfit * sharePct) / 100) : 0;
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
    profitMargin: grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(1)) : 0,
    totalCapitalInvested,
    distribution
  };
}

async function getInitialData() {
  const masterWallet = await getMasterWallet();
  const wallets = await getWallets();
  const financers = await getFinancersWithTeams();
  const leads = await getLeads();
  const loans = await getLoans();
  const emis = await getEmis();
  const expenses = await getExpenses();
  const transactions = await getTransactions();
  const pnl = await getPnlDistribution();

  return {
    masterWallet,
    partners: wallets,
    wallets,
    financers,
    leads,
    loans,
    emis,
    expenses,
    transactions,
    pnl,
    databaseEngine: isMySql ? 'MySQL (Hostinger)' : 'SQLite (Local)'
  };
}

// Kick off initialization
const initPromise = initDb();

module.exports = {
  initPromise,
  getMasterWallet,
  getWallets,
  getFinancersWithTeams,
  addFinancer,
  addFinancerTeam,
  deleteFinancerTeam,
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
