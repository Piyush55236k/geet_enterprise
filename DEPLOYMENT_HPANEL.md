# Geet Enterprise Finance ERP — Hostinger hPanel Deployment Guide

This guide explains how to deploy Geet Enterprise to **Hostinger Web / Cloud Hosting** using **hPanel** and connect to your newly created MySQL database (`u368199755_geetenterprise`).

---

## 1. Quick Overview

- **Database**: Hostinger MySQL (`u368199755_geetenterprise`)
- **Backend**: Node.js (Express 5 + `mysql2`)
- **Frontend**: Pre-compiled React + Vite (located in `server/public/`, ready to serve without building on the server)
- **Startup File**: `server.js` or `app.js`

---

## 2. Setting Up Node.js in Hostinger hPanel

1. Log in to **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Websites** and click **Manage** on your domain (e.g. `geetenterprise.in`).
3. Search for **"Node.js"** in the left sidebar under the **Advanced** section.
4. Click **Create Application** (or Edit if already exists):
   - **Node.js Version**: Select `20.x` or `18.x` (Recommended: `20.x`).
   - **Application Mode**: `Production`.
   - **Application Root**: `/home/u368199755/domains/yourdomain.com/public_html` (or your chosen directory).
   - **Application Startup File**: `server.js` (or `app.js` — both work identically).
   - **Application URL**: Select your primary domain / subdomain.
5. Click **Create** / **Save**.

---

## 3. Uploading Code to Hostinger

You can deploy using either **Git (Recommended)** or **File Manager ZIP**:

### Option A: Via Hostinger Git (Recommended — 1-Click Sync)
1. In hPanel, go to **Advanced** -> **Git**.
2. Select repository:
   - **Repository URL**: `https://github.com/Piyush55236k/geet_enterprise.git`
   - **Branch**: `main`
   - **Install directory**: `public_html` (or your application folder)
3. Click **Create**.
4. Whenever you push to GitHub, click **Deploy** to pull the latest changes automatically.

### Option B: Via Hostinger File Manager (ZIP Upload)
1. Zip the project folder (excluding `node_modules` and `.git`).
2. In hPanel, open **Files** -> **File Manager**.
3. Upload the ZIP to `public_html/` and click **Extract**.

---

## 4. Configuring Database Credentials (.env)

In your application root or `server/` directory, create or edit the `.env` file with your credentials:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=u368199755_geetenterprise
DB_PASSWORD=+&+fdVHSe/5
DB_NAME=u368199755_geetenterprise
PORT=3000
```

> **Note on `DB_HOST`**:
> - When your Node.js app runs on Hostinger, the database host is always `localhost`.
> - If you ever want to connect from your local PC to this database remotely, whitelist your IP in hPanel -> **Databases** -> **Remote MySQL**, and replace `localhost` with your Hostinger database server hostname / IP.

---

## 5. Installing Dependencies & Starting the Application

1. In hPanel's **Node.js** panel, click **NPM Install** (or access via **SSH Terminal** and run `npm install --production`).
2. Click **Restart Application**.
3. The server will:
   - Connect automatically to MySQL `u368199755_geetenterprise`.
   - Create all fresh, clean tables (`master_wallet`, `wallets`, `financer_teams`, `leads`, `loans`, `emis`, `expenses`, `transactions`) with zero dummy seed data.
   - Serve the pre-compiled mobile/desktop frontend from `server/public/`.

---

## 6. Verifying Deployment

Visit your domain or test the health check:
- Frontend: `https://yourdomain.com/`
- API Health Check: `https://yourdomain.com/api/health`
- Initial Data: `https://yourdomain.com/api/initial-data` (returns `{ success: true, data: { ... } }`)

---

## 7. Useful NPM Scripts

If you make modifications locally, you can use these commands before committing:

- `npm run build`: Re-builds the React client and copies the production bundle directly into `server/public/`.
- `npm start`: Starts the production server (`node server/server.js`).
