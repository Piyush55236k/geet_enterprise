# Geet Enterprise — Finance, Capital & Lending ERP

A modern, full-stack financial workspace and lending ERP built for Geet Enterprise, featuring **Central & Individual User Wallets**, **Customer Leads Pipeline**, **Loan Origination & Funding Calculator**, **Scheduled EMI Repayments**, **Operating Expenses with Receipt Uploads**, **Consolidated & Per-User Profit & Loss**, and **Financial Ledger Transactions**.

---

## 🏗️ Architecture

- **Frontend (`client/`)**: React 19 + TypeScript + Vite responsive single-page application with multi-user workspace theming, interactive financial dashboards, and print-ready statements.
- **Backend (`server/`)**: Node.js + Express 5 with native SQLite database (`node:sqlite`), multipart file uploads (`multer`), live data hydration, and hot-reload development powered by `nodemon`.
- **Root Workspace**: Orchestrated scripts for full-stack development, builds, and production execution.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all
```

### 2. Run in Development Mode
Start both backend (with `nodemon`) and frontend (with Vite proxy):

**Terminal 1 — Backend (Nodemon):**
```bash
npm run server
```
Server runs on **[http://localhost:3000](http://localhost:3000)**.

**Terminal 2 — Frontend (Vite Dev Server):**
```bash
npm run client
```
Frontend runs on **[http://localhost:5173](http://localhost:5173)** with `/api` and `/uploads` proxy to port 3000.

### 3. Run in Production Mode
Build the client and serve everything from Express:
```bash
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)**.

---

## 📊 Modules & Features

1. **Dashboard**: Live financial KPIs (Total Capital, Available Balance, Allocated Funds, Disbursed Loans, Interest Income, Expenses, Net Profit), 6-Month Cash Flow chart, Capital Utilization donut, and Upcoming EMI alerts.
2. **Central Wallet**: Master wallet balance, central capital reserve, allocation across credit managers, and master transaction history.
3. **My Wallet**: Role-tailored user wallets (Amit Sharma - Credit Manager, Priya Mehta - Loan Officer, Rohan Khanna - Collections) with individual balances, utilization meters, monthly movement, and personal transactions.
4. **Leads Pipeline**: Add leads, track acquisition source, filter prospects, and 1-click **Convert to Loan**.
5. **Loans & Funding Calculator**: Active loans portfolio, loan proposal generation, **Disburse Loan** modal with payment proof upload, and reducing-balance funding calculator.
6. **Scheduled EMIs**: Complete repayment schedule, status tabs (All, Paid, Upcoming, Overdue, Partial), and 1-click **Record Payment** updating loan balances in SQLite.
7. **Operating Expenses**: Multi-category expenses (Operations, Legal, Tech, Travel, Marketing) with receipt file uploads, approval reviews, and automatic wallet deductions.
8. **Profit & Loss**: Consolidated and individual user performance tabs with monthly income vs. expenses comparisons and portfolio health indicators.
9. **Financial Ledger (Transactions)**: Complete credits and debits ledger with real-time search, pagination, and CSV export.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server uptime and health check |
| `GET` | `/api/initial-data` | Complete data hydration bundle |
| `GET` | `/api/wallets` | Master and user wallets |
| `GET` / `POST` | `/api/leads` | List leads / Add new lead |
| `PATCH` | `/api/leads/:id/convert` | Convert lead to loan proposal |
| `GET` / `POST` | `/api/loans` | List loans / Create loan |
| `POST` | `/api/loans/:id/disburse` | Disburse loan with proof file |
| `GET` | `/api/emis` | List EMI repayment schedule |
| `PATCH` | `/api/emis/:id/pay` | Record payment against installment |
| `GET` / `POST` | `/api/expenses` | List expenses / Add expense with receipt |
| `PATCH` | `/api/expenses/:id/approve` | Approve pending expense |
| `GET` | `/api/transactions` | Full ledger transactions |

---

## 📄 License
ISC © Geet Enterprise

