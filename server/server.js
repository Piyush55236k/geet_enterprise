require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads setup for payment proofs and receipts
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve built frontend assets (supports hPanel production, standalone upload, and monorepo)
const possibleStaticDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../dist')
];

let staticDir = possibleStaticDirs.find(dir => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html')));

if (staticDir) {
  app.use(express.static(staticDir));
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB max
});

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Geet Enterprise Finance ERP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Full Initial Data Hydration
app.get('/api/initial-data', async (req, res) => {
  try {
    const data = await db.getInitialData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Wallets & Partners
app.get('/api/wallets', async (req, res) => {
  try {
    const master = await db.getMasterWallet();
    const partners = await db.getWallets();
    res.json({ success: true, master, users: partners, partners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Capital Investment (Partner equity injection)
app.post('/api/capital/invest', async (req, res) => {
  try {
    const { partnerId, partnerName, amount, role } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid investment amount is required.' });
    }
    const result = await db.addCapitalInvestment({ partnerId, partnerName, amount: Number(amount), role });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Profit and Loss Distribution
app.get('/api/pnl', async (req, res) => {
  try {
    const pnl = await db.getPnlDistribution();
    res.json({ success: true, data: pnl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Financers & Teams (Chain Reaction Hierarchy)
app.get('/api/financers', async (req, res) => {
  try {
    const financers = await db.getFinancersWithTeams();
    res.json({ success: true, data: financers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/financers', async (req, res) => {
  try {
    const { name, role, phone, email, capitalInvested } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Financer name is required.' });
    }
    const created = await db.addFinancer({ name, role, phone, email, capitalInvested });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/financers/:id/teams', async (req, res) => {
  try {
    const { name, role, phone, email } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Team / Agent name is required.' });
    }
    const created = await db.addFinancerTeam({
      financerId: req.params.id,
      name,
      role,
      phone,
      email
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/financer-teams/:id', async (req, res) => {
  try {
    await db.deleteFinancerTeam(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leads
app.get('/api/leads', async (req, res) => {
  try {
    const leads = await db.getLeads();
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const {
      business,
      contactPerson,
      contact_person,
      phone,
      email,
      requirement,
      source,
      status,
      financerId,
      financerName,
      teamId,
      teamName,
      createdBy
    } = req.body;

    if (!business) {
      return res.status(400).json({ success: false, error: 'Business name is required.' });
    }
    const created = await db.createLead({
      business,
      contact_person: contactPerson || contact_person || business,
      phone,
      email,
      requirement: Number(requirement) || 0,
      source: source || 'Referral',
      status: status || 'New',
      financerId,
      financerName,
      teamId,
      teamName,
      createdBy: createdBy || 'Admin'
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/leads/:id/convert', async (req, res) => {
  try {
    const result = await db.convertLead(req.params.id, req.body);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Loans
app.get('/api/loans', async (req, res) => {
  try {
    const loans = await db.getLoans();
    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/loans', async (req, res) => {
  try {
    const { business, customer } = req.body;
    if (!business && !customer) {
      return res.status(400).json({ success: false, error: 'Customer / business name is required.' });
    }
    const created = await db.createLoan({
      ...req.body,
      business: business || customer,
      customer: customer || business
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Middleware for file upload handling
const handleDisburseUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('proofFile')(req, res, next);
  } else {
    next();
  }
};

app.post('/api/loans/:id/disburse', handleDisburseUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, utr, paymentDate, paymentMethod } = req.body;
    const proofFile = req.file ? req.file.filename : (req.body.proofFile || '');

    const updated = await db.disburseLoan(id, {
      amount,
      utr,
      paymentDate,
      paymentMethod,
      proofFile
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Loan not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// EMIs
app.get('/api/emis', async (req, res) => {
  try {
    const emis = await db.getEmis();
    res.json({ success: true, data: emis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Middleware for EMI payment proof upload handling
const handleEmiUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('proofFile')(req, res, next);
  } else {
    next();
  }
};

app.post('/api/emis/:id/pay', handleEmiUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const { utr, paymentDate, paymentMethod } = req.body;
    const proofFile = req.file ? req.file.filename : (req.body.proofFile || '');

    const paid = await db.payEmi(id, {
      utr,
      paymentDate,
      paymentMethod,
      proofFile
    });

    if (!paid) {
      return res.status(404).json({ success: false, error: 'EMI record not found.' });
    }
    res.json({ success: true, data: paid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/emis/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const { utr, paymentDate, paymentMethod, proofFile } = req.body;
    const paid = await db.payEmi(id, { utr, paymentDate, paymentMethod, proofFile });
    if (!paid) {
      return res.status(404).json({ success: false, error: 'EMI record not found.' });
    }
    res.json({ success: true, data: paid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await db.getExpenses();
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const handleExpenseUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single('receiptFile')(req, res, next);
  } else {
    next();
  }
};

app.post('/api/expenses', handleExpenseUpload, async (req, res) => {
  try {
    const { description, category, amount, submittedBy, date } = req.body;
    const receiptFile = req.file ? req.file.filename : (req.body.receiptFile || '');

    if (!description || !amount) {
      return res.status(400).json({ success: false, error: 'Description and amount are required.' });
    }

    const created = await db.createExpense({
      description,
      category: category || 'Operations',
      amount: Number(amount) || 0,
      submittedBy: submittedBy || 'Enterprise Admin',
      receiptFile,
      date
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/expenses/:id/approve', async (req, res) => {
  try {
    const approved = await db.approveExpense(req.params.id);
    if (!approved) {
      return res.status(404).json({ success: false, error: 'Expense record not found.' });
    }
    res.json({ success: true, data: approved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.getTransactions();
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback SPA routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }
  if (staticDir) {
    const indexPath = path.join(staticDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server after database initialization
db.initPromise.then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Geet Enterprise Server running on port ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`📁 Database: ${process.env.DB_NAME || 'u368199755_geetenterprise'}`);
    console.log(`📂 Receipts directory: ${uploadsDir}`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
  app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT} with fallback.`);
  });
});

module.exports = app;
