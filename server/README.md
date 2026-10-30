# Geet Enterprise — Mobile-First Finance, Loan & Expense ERP

A comprehensive, dynamic, full-stack financial management system for Geet Enterprise, featuring real-time Profit & Loss reporting, upcoming and delayed EMI collection tracking, operational expense ledger with receipt uploads, and category budgeting.

---

## 🚀 Quick Start

### 1. Requirements
- **Node.js**: v18+ (Node v24+ recommended with built-in `node:sqlite`)
- **npm**: v8+

### 2. Start the Server
```bash
npm start
```

Open your browser at:
**[http://localhost:3000](http://localhost:3000)** or **[http://localhost:3000/geet.html](http://localhost:3000/geet.html)**

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express.js
- **Database**: Persistent SQLite (`database.sqlite`) powered by Node's native `DatabaseSync` engine (zero extra database servers or native C++ compilers required)
- **File Uploads**: Multer middleware storing receipts in the `/uploads/` directory
- **Frontend**: Mobile-first responsive single-page application built with Tailwind CSS, Chart.js, Lucide Icons, and native Fetch API

---

## 📊 Core Features

1. **Executive Dashboard**:
   - Total Income, Operating Expenses, Net Profit, Profit Margin %
   - Upcoming EMIs and Overdue Accounts KPIs
   - Interactive 6-Month Profit vs. Expense Bar Chart
   - Category-wise Expense Distribution Donut Chart
   - Live Overdue and Upcoming EMI alerts with 1-click **Collect EMI** action

2. **Profit & Loss (P&L) Report**:
   - Monthly breakdown of Interest Income, Fee Income, Operating Expenses, and Net Profit
   - Dynamic Month-over-Month (MoM) growth calculations
   - Filter by date range and search keywords
   - 1-click CSV export and print-ready PDF view

3. **Upcoming EMI Report**:
   - Schedule of installments due with borrower details
   - Live **Record Payment** / **Collect** action that updates loan balances in real-time
   - Quick **+ New Loan** account registration modal
   - Filtering by status, date range, and customer name/phone

4. **Delayed EMI Report (Recovery Management)**:
   - Delinquent borrower accounts with calculated days delayed
   - Click-to-Call direct dialer integration (`tel:`)
   - 1-click EMI payment collection updating overdue status instantly
   - Average days delayed calculation and total delinquent balance

5. **Expense Management & Ledger**:
   - Multi-category operational expenses with payment mode tracking
   - Receipt file upload support (PDF, PNG, JPG, WebP) saved to `/uploads/`
   - Clickable receipt preview and download links
   - Category-wise expense breakdown and monthly trend comparison
   - 1-click delete with instant server synchronization

6. **Expense Categories Management**:
   - Create, edit, and deactivate expense categories
   - Monthly guideline budget tracking vs. actual total spent
   - Active/Inactive toggling preventing disabled categories in new entries

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server status and uptime check |
| `GET` | `/api/initial-data` | Bundled initial data for fast single-roundtrip app hydration |
| `GET` | `/api/categories` | List all categories with computed spent totals |
| `POST` | `/api/categories` | Create a new category |
| `PUT` | `/api/categories/:id` | Update an existing category |
| `PATCH` | `/api/categories/:id/toggle` | Toggle category active/inactive status |
| `DELETE` | `/api/categories/:id` | Delete category (or deactivate if records exist) |
| `GET` | `/api/expenses` | Filter expenses by `startDate`, `endDate`, `categoryId`, `search` |
| `POST` | `/api/expenses` | Add new expense (supports `multipart/form-data` for receipts) |
| `DELETE` | `/api/expenses/:id` | Delete an expense record |
| `GET` | `/api/revenue` | Monthly interest and fee income records |
| `POST` | `/api/revenue` | Upsert monthly revenue figures |
| `GET` | `/api/emis` | Filter EMIs by date, status, search, or overdue-only |
| `POST` | `/api/emis` | Register a new loan/EMI account |
| `PATCH` | `/api/emis/:id/pay` | Record payment against an installment |
| `PATCH` | `/api/emis/:id` | Update EMI details |
| `DELETE` | `/api/emis/:id` | Delete an EMI record |

---

## 📁 Project Structure

```
geet enterprise/
├── server.js            # Express server & REST API routes
├── db.js                # SQLite database schema, queries & CRUD helpers
├── database.sqlite      # Persistent SQLite database file
├── geet.html            # Main dynamic single-page web application
├── index.html           # Mirror of geet.html for root access
├── seed_data.json       # Initial seed data for fresh database bootstrap
├── uploads/             # Stored receipt attachments (PDFs / Images)
├── package.json         # Node.js dependencies & run scripts
└── README.md            # Project documentation
```

