const express = require('express');
const cors = require('cors');
const path = require('node:path');
const fs = require('node:fs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(uploadsDir));

// Serve static frontend if built
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

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
app.get('/api/initial-data', (req, res) => {
  try {
    const data = db.getInitialData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Wallets & Partners
app.get('/api/wallets', (req, res) => {
  try {
    const master = db.getMasterWallet();
    const partners = db.getWallets();
    res.json({ success: true, master, users: partners, partners });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Capital Investment (Partner equity injection)
app.post('/api/capital/invest', (req, res) => {
  try {
    const { partnerId, partnerName, amount, role } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, error: 'Valid investment amount is required.' });
    }
    const result = db.addCapitalInvestment({ partnerId, partnerName, amount: Number(amount), role });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Profit and Loss Distribution
app.get('/api/pnl', (req, res) => {
  try {
    const pnl = db.getPnlDistribution();
    res.json({ success: true, data: pnl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Leads
app.get('/api/leads', (req, res) => {
  try {
    const leads = db.getLeads();
    res.json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/leads', (req, res) => {
  try {
    const { business, contactPerson, contact_person, phone, email, requirement, source, status } = req.body;
    if (!business) {
      return res.status(400).json({ success: false, error: 'Business name is required.' });
    }
    const created = db.createLead({
      business,
      contact_person: contactPerson || contact_person || business,
      phone,
      email,
      requirement: Number(requirement) || 0,
      source: source || 'Referral',
      status: status || 'New'
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/leads/:id/convert', (req, res) => {
  try {
    const result = db.convertLead(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Loans
app.get('/api/loans', (req, res) => {
  try {
    const loans = db.getLoans();
    res.json({ success: true, data: loans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/loans', (req, res) => {
  try {
    const { business, customer, principal, roi, tenure, emi, status } = req.body;
    if (!business && !customer) {
      return res.status(400).json({ success: false, error: 'Customer / business name is required.' });
    }
    const created = db.createLoan({
      business: business || customer,
      customer: customer || business,
      principal: Number(principal) || 500000,
      roi: Number(roi) || 18,
      tenure: Number(tenure) || 12,
      emi: Number(emi) || 0,
      status: status || 'Active'
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

app.post('/api/loans/:id/disburse', handleDisburseUpload, (req, res) => {
  try {
    const { id } = req.params;
    const { amount, utr, paymentDate, paymentMethod } = req.body;
    const proofFile = req.file ? req.file.filename : (req.body.proofFile || '');

    const updated = db.disburseLoan(id, {
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
app.get('/api/emis', (req, res) => {
  try {
    const emis = db.getEmis();
    res.json({ success: true, data: emis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/emis/:id/pay', (req, res) => {
  try {
    const { id } = req.params;
    const paid = db.payEmi(id);
    if (!paid) {
      return res.status(404).json({ success: false, error: 'EMI record not found.' });
    }
    res.json({ success: true, data: paid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Expenses
app.get('/api/expenses', (req, res) => {
  try {
    const expenses = db.getExpenses();
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

app.post('/api/expenses', handleExpenseUpload, (req, res) => {
  try {
    const { description, category, amount, submittedBy, date } = req.body;
    const receiptFile = req.file ? req.file.filename : (req.body.receiptFile || '');

    if (!description || !amount) {
      return res.status(400).json({ success: false, error: 'Description and amount are required.' });
    }

    const created = db.createExpense({
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

app.patch('/api/expenses/:id/approve', (req, res) => {
  try {
    const approved = db.approveExpense(req.params.id);
    if (!approved) {
      return res.status(404).json({ success: false, error: 'Expense record not found.' });
    }
    res.json({ success: true, data: approved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transactions
app.get('/api/transactions', (req, res) => {
  try {
    const transactions = db.getTransactions();
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
  const clientIndex = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(clientIndex)) {
    return res.sendFile(clientIndex);
  }
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Geet Enterprise Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`📁 Database: SQLite (database.sqlite)`);
  console.log(`📂 Receipts directory: ${uploadsDir}`);
  console.log(`====================================================`);
});

module.exports = app;

