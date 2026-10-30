# Geet Enterprise — Finance, Funding Calculator & Expense ERP

A full-stack financial enterprise application featuring a **Precision Funding Calculator Engine**, **EMI Schedule Generator**, **Profit & Loss Tracking**, **Operational Expense Management with Receipt Uploads**, and **Delinquent Account Recovery Management**.

---

## 🏗️ Architecture

- **Frontend (`client/`)**: Modern React 19 + TypeScript + Vite single-page application with responsive financial dashboards, interactive data tables, and print-ready PDF statements.
- **Backend (`server/`)**: Node.js + Express 5 REST API with native SQLite database (`node:sqlite`), supporting multipart receipt file uploads and automated initial seed data.
- **Root Workspace**: Orchestrated monorepo scripts allowing single-command startup for both development and production.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (Node v22+ or v24+ recommended with native `node:sqlite`)
- **npm**: v8+

### 1. Installation
Install dependencies for both client and server:
```bash
# Install root, server, and client dependencies
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Run in Production Mode
Builds the client and serves both frontend and REST API from the Express server:
```bash
npm run build
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run in Development Mode (Hot Reloading)
Open two terminal windows:
```bash
# Terminal 1: Backend Server (Watches server/server.js)
npm run server

# Terminal 2: Frontend Vite Dev Server (Proxies API to port 3000)
npm run client
```

---

## 🧮 Core Features

### 1. Funding Calculator & Statement Engine
- **Multiplier Calculation**: Enter loan amount and return rate (e.g. Rate `130` $\rightarrow$ 130% Total Return).
- **Custom Tenure & Frequency**: Calculates base EMI count dynamically from loan tenure days and frequency days.
- **6 Advance EMI / Net Hand Deduction Modes**:
  - `By Net In-Hand (₹)`: Dynamically calculates advance deduction based on client cash in-hand.
  - `None`: Zero advance deduction.
  - `Full 1 EMI`: 1 Base EMI deducted upfront.
  - `Half EMI (0.5)`: Half EMI deducted upfront.
  - `By Advance (₹)`: Exact custom advance amount deduction.
  - `By Days`: Days-based advance deduction.
- **Complete EMI Schedule**: Generates exact calendar due dates (e.g. 15-day cycles), cumulative paid amounts, remaining balances, and status tracking.

### 2. Operational Expense Ledger
- Multi-category expense tracking with payment methods (Bank transfer, UPI, Cash, Cheque).
- Receipt uploads (PDF, PNG, JPG) stored securely in `server/uploads/` with preview links.
- Category budget guidelines with live spent totals and MoM comparisons.

### 3. EMI & Loan Collections
- Upcoming installments schedule with real-time **Collect** action that updates loan balances in SQLite.
- Delinquent account recovery tracking with days delayed calculations and one-click payment recordings.

---

## 📡 REST API Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & uptime |
| `GET` | `/api/initial-data` | Bundled initial hydration data (categories, expenses, emis, calculations) |
| `GET` / `POST` | `/api/calculations` | List / Save funding calculations |
| `DELETE` | `/api/calculations/:id` | Delete saved calculation |
| `GET` / `POST` | `/api/expenses` | List / Record expense (supports `multipart/form-data`) |
| `DELETE` | `/api/expenses/:id` | Delete expense record |
| `GET` / `POST` | `/api/categories` | List / Create expense categories |
| `PATCH` | `/api/categories/:id/toggle` | Toggle category active status |
| `GET` / `POST` | `/api/emis` | List / Register loans & EMI schedules |
| `PATCH` | `/api/emis/:id/pay` | Record payment against an installment |

---

## 📄 License
ISC © Geet Enterprise

