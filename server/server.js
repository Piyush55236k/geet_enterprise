const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const db = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration for receipt uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, uniqueSuffix + '-' + cleanName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets and uploads
app.use('/uploads', express.static(uploadsDir));

// Serve client dist if built
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}
app.use(express.static(__dirname));

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Geet Enterprise Finance ERP',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Initial Data Bundle for Fast Hydration
app.get('/api/initial-data', (req, res) => {
  try {
    const categories = db.getCategories();
    const monthlyRevenue = db.getMonthlyRevenue();
    const expenses = db.getExpenses();
    const emis = db.getEMIs();
    const calculations = db.getCalculations();

    res.json({
      success: true,
      data: {
        categories,
        monthlyRevenue,
        expenses,
        emis,
        calculations
      }
    });
  } catch (error) {
    console.error('Error fetching initial data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ------------------------------------------
// CATEGORIES ENDPOINTS
// ------------------------------------------
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const { name, budget, desc, active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }
    const created = db.createCategory({
      name: name.trim(),
      budget: Number(budget) || 0,
      desc: desc ? desc.trim() : '',
      active: active !== false
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, desc, active } = req.body;
    const updated = db.updateCategory(id, { name, budget, desc, active });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/categories/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.toggleCategory(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Category not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = db.deleteCategory(id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ------------------------------------------
// EXPENSES ENDPOINTS
// ------------------------------------------
app.get('/api/expenses', (req, res) => {
  try {
    const { startDate, endDate, categoryId, search } = req.query;
    const expenses = db.getExpenses({ startDate, endDate, categoryId, search });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Middleware supporting both multipart file uploads and regular JSON
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
    const { title, categoryId, category, amount, date, method, paymentMethod, desc, description } = req.body;
    let receipt = req.body.receipt || '';

    if (req.file) {
      receipt = req.file.filename;
    }

    const finalTitle = title ? title.trim() : '';
    const finalAmount = Number(amount);
    const finalDate = date || new Date().toISOString().slice(0, 10);
    const finalMethod = method || paymentMethod || 'Bank transfer';
    const finalDesc = desc || description || '';

    const cats = db.getCategories();
    let resolvedCategoryId = null;

    if (categoryId) {
      const match = cats.find(c => c.id === categoryId);
      if (match) resolvedCategoryId = match.id;
    }

    if (!resolvedCategoryId && (category || categoryId)) {
      const searchTarget = String(category || categoryId).toLowerCase().trim();
      const match = cats.find(c => c.id.toLowerCase() === searchTarget || c.name.toLowerCase() === searchTarget || c.name.toLowerCase().includes(searchTarget));
      if (match) {
        resolvedCategoryId = match.id;
      } else {
        // Auto-create category so foreign key never fails
        const newCat = db.createCategory({
          name: category || categoryId,
          budget: 20000,
          desc: 'Auto-created category'
        });
        resolvedCategoryId = newCat.id;
      }
    }

    if (!resolvedCategoryId) {
      resolvedCategoryId = cats.length > 0 ? cats[0].id : 'cat-1';
    }

    if (!finalTitle || isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (valid title, amount > 0).'
      });
    }

    const created = db.createExpense({
      title: finalTitle,
      categoryId: resolvedCategoryId,
      amount: finalAmount,
      date: finalDate,
      method: finalMethod,
      paymentMethod: finalMethod,
      desc: finalDesc,
      description: finalDesc,
      receipt
    });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteExpense(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Expense not found.' });
    }
    res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ------------------------------------------
// MONTHLY REVENUE ENDPOINTS
// ------------------------------------------
app.get('/api/revenue', (req, res) => {
  try {
    const revenue = db.getMonthlyRevenue();
    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/revenue', (req, res) => {
  try {
    const { monthKey, label, interestIncome, feeIncome } = req.body;
    if (!monthKey || !label) {
      return res.status(400).json({ success: false, error: 'monthKey and label are required.' });
    }
    const saved = db.upsertMonthlyRevenue({ monthKey, label, interestIncome, feeIncome });
    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ------------------------------------------
// EMI RECORDS ENDPOINTS
// ------------------------------------------
app.get('/api/emis', (req, res) => {
  try {
    const { startDate, endDate, status, search, delinquentOnly } = req.query;
    const emis = db.getEMIs({
      startDate,
      endDate,
      status,
      search,
      delinquentOnly: delinquentOnly === 'true' || delinquentOnly === '1'
    });
    res.json({ success: true, data: emis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/emis', (req, res) => {
  try {
    const { loanId, customer, phone, dueDate, installmentNo, emiAmount, amount, paidAmount, amountPaid, outstandingLoan, outstanding, status } = req.body;
    const finalAmount = Number(emiAmount || amount || 0);

    if (!loanId || !customer || !dueDate || finalAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Missing required EMI fields (loanId, customer, dueDate, amount).' });
    }

    const created = db.createEMI({
      loanId,
      customer,
      phone,
      dueDate,
      installmentNo: installmentNo || '1 / 12',
      emiAmount: finalAmount,
      amount: finalAmount,
      paidAmount: paidAmount || amountPaid || 0,
      outstandingLoan: outstandingLoan || outstanding || finalAmount,
      status: status || 'Upcoming'
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/emis/:id/pay', (req, res) => {
  try {
    const { id } = req.params;
    const rawAmt = req.body.paymentAmount ?? req.body.amount;
    const paymentAmount = Number(rawAmt);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
    }
    const updated = db.payEMI(id, paymentAmount);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'EMI record not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.patch('/api/emis/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateEMI(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'EMI record not found.' });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/emis/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteEMI(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'EMI record not found.' });
    }
    res.json({ success: true, message: 'EMI record deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ------------------------------------------
// CALCULATIONS ENDPOINTS (Funding Calculator)
// ------------------------------------------
app.get('/api/calculations', (req, res) => {
  try {
    const calculations = db.getCalculations();
    res.json({ success: true, data: calculations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/calculations', (req, res) => {
  try {
    const calc = req.body;
    const customer = calc.customer || calc.title || 'Client Calculation';
    const amount = Number(calc.amount ?? calc.loanAmount);
    const rate = Number(calc.rate);
    const tenure = Number(calc.tenure);

    if (!customer || isNaN(amount) || amount <= 0 || isNaN(rate) || isNaN(tenure) || tenure <= 0) {
      return res.status(400).json({ success: false, error: 'Missing required calculation parameters (customer, amount, rate, tenure).' });
    }

    const payload = {
      ...calc,
      customer,
      amount,
      rate,
      tenure,
      tenureUnit: calc.tenureUnit || 'months',
      fee: Number(calc.fee || 0),
      charges: Number(calc.charges || 0),
      months: Number(calc.months || (calc.tenureUnit === 'years' ? tenure * 12 : tenure)),
      emi: Number(calc.emi || 0),
      totalInterest: Number(calc.totalInterest || 0),
      totalFees: Number(calc.totalFees || 0)
    };

    const saved = db.createCalculation(payload);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/calculations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteCalculation(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Calculation not found.' });
    }
    res.json({ success: true, message: 'Calculation deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback SPA routing / static index
app.use((req, res, next) => {
  // If it's an API route that wasn't handled, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, error: 'Endpoint not found' });
  }

  // Serve client dist index.html if it exists
  const clientIndex = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(clientIndex)) {
    return res.sendFile(clientIndex);
  }

  // Otherwise serve server index.html (geet.html)
  const serverIndex = path.join(__dirname, 'index.html');
  if (fs.existsSync(serverIndex)) {
    return res.sendFile(serverIndex);
  }

  next();
});

// Error handling middleware
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
