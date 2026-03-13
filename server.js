import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'doorly.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'business',
    plan TEXT DEFAULT 'starter',
    status TEXT DEFAULT 'active',
    company_name TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    country TEXT DEFAULT '',
    reg_number TEXT DEFAULT '',
    vat_number TEXT DEFAULT '',
    bank_name TEXT DEFAULT '',
    bank_account TEXT DEFAULT '',
    bank_swift TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    quote_number TEXT NOT NULL,
    doc_type TEXT NOT NULL DEFAULT 'quote',
    status TEXT DEFAULT 'draft',
    customer_name TEXT DEFAULT '',
    customer_phone TEXT DEFAULT '',
    customer_email TEXT DEFAULT '',
    customer_address TEXT DEFAULT '',
    customer_city TEXT DEFAULT '',
    customer_country TEXT DEFAULT '',
    customer_vat TEXT DEFAULT '',
    customer_reg TEXT DEFAULT '',
    customer_bank_name TEXT DEFAULT '',
    customer_bank_account TEXT DEFAULT '',
    customer_bank_swift TEXT DEFAULT '',
    subtotal REAL DEFAULT 0,
    vat REAL DEFAULT 0,
    total REAL DEFAULT 0,
    notes TEXT DEFAULT '',
    valid_until TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    description TEXT DEFAULT '',
    quantity REAL DEFAULT 1,
    unit TEXT DEFAULT 'cope',
    unit_price REAL DEFAULT 0,
    total REAL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS price_configs (
    user_id TEXT PRIMARY KEY,
    config_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS company_profiles (
    user_id TEXT PRIMARY KEY,
    profile_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

const userCount = db.prepare('SELECT COUNT(*) as cnt FROM users').get();
if (userCount.cnt === 0) {
  const insertUser = db.prepare(`INSERT INTO users (id, username, password, full_name, email, role, plan, status, company_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  insertUser.run('admin-001', 'admin', 'admin', 'Super Admin', 'admin@doorly.com', 'admin', 'enterprise', 'active', 'Doorly Platform');
  insertUser.run('user-001', 'demo', 'demo', 'Demo User', 'demo@doorly.com', 'business', 'professional', 'active', 'Demo Windows & Doors');
  console.log('Default users created');
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });
  if (user.status === 'suspended') return res.status(403).json({ error: 'Account is suspended' });
  res.json(formatUser(user));
});

app.get('/api/users', (_req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  res.json(users.map(formatUser));
});

app.get('/api/users/business', (_req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE role = 'business' ORDER BY created_at DESC").all();
  res.json(users.map(formatUser));
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(formatUser(user));
});

app.post('/api/users', (req, res) => {
  const { username, password, fullName, companyName, plan } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return res.status(409).json({ error: 'Username already exists' });
  const id = `user-${Date.now()}`;
  db.prepare(`INSERT INTO users (id, username, password, full_name, email, role, plan, status, company_name) VALUES (?, ?, ?, ?, ?, 'business', ?, 'active', ?)`)
    .run(id, username, password, fullName, `${username}@doorly.com`, plan || 'starter', companyName || '');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.status(201).json(formatUser(user));
});

app.put('/api/users/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/users/:id', (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/:userId/customers', (req, res) => {
  const customers = db.prepare('SELECT * FROM customers WHERE user_id = ? ORDER BY created_at DESC').all(req.params.userId);
  res.json(customers);
});

app.post('/api/:userId/customers', (req, res) => {
  const { name, email, phone, address, city, country, reg_number, vat_number, bank_name, bank_account, bank_swift } = req.body;
  const id = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  db.prepare(`INSERT INTO customers (id, user_id, name, email, phone, address, city, country, reg_number, vat_number, bank_name, bank_account, bank_swift) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.params.userId, name, email || '', phone || '', address || '', city || '', country || '', reg_number || '', vat_number || '', bank_name || '', bank_account || '', bank_swift || '');
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.status(201).json(customer);
});

app.delete('/api/:userId/customers/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').run(req.params.id, req.params.userId);
  res.json({ success: true });
});

app.get('/api/:userId/quotes', (req, res) => {
  const docType = req.query.doc_type || 'quote';
  const quotes = db.prepare('SELECT * FROM quotes WHERE user_id = ? AND doc_type = ? ORDER BY created_at DESC').all(req.params.userId, docType);
  const stmtItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order');
  const result = quotes.map(q => ({ ...q, items: stmtItems.all(q.id) }));
  res.json(result);
});

app.get('/api/:userId/quotes/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const quotes = db.prepare("SELECT * FROM quotes WHERE user_id = ? AND doc_type = 'quote' ORDER BY created_at DESC LIMIT ?").all(req.params.userId, limit);
  const stmtItems = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order');
  const result = quotes.map(q => ({ ...q, items: stmtItems.all(q.id) }));
  res.json(result);
});

app.post('/api/:userId/quotes', (req, res) => {
  const data = req.body;
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  db.prepare(`INSERT INTO quotes (id, user_id, quote_number, doc_type, status, customer_name, customer_phone, customer_email, customer_address, customer_city, customer_country, customer_vat, customer_reg, customer_bank_name, customer_bank_account, customer_bank_swift, subtotal, vat, total, notes, valid_until) VALUES (?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.params.userId, data.quote_number, data.doc_type || 'quote',
      data.customer_name || '', data.customer_phone || '', data.customer_email || '',
      data.customer_address || '', data.customer_city || '', data.customer_country || '',
      data.customer_vat || '', data.customer_reg || '',
      data.customer_bank_name || '', data.customer_bank_account || '', data.customer_bank_swift || '',
      data.subtotal || 0, data.vat || 0, data.total || 0, data.notes || '', data.valid_until || '');

  if (data.items && Array.isArray(data.items)) {
    const insertItem = db.prepare(`INSERT INTO quote_items (id, quote_id, description, quantity, unit, unit_price, total, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    data.items.forEach((item, idx) => {
      const itemId = `qi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      insertItem.run(itemId, id, item.description || '', item.quantity || 1, item.unit || 'cope', item.unit_price || 0, item.total || 0, idx);
    });
  }

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(id);
  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').all(id);
  res.status(201).json({ ...quote, items });
});

app.put('/api/:userId/quotes/:id', (req, res) => {
  const updates = req.body;
  const fields = [];
  const values = [];
  const allowed = ['quote_number', 'doc_type', 'status', 'customer_name', 'customer_phone', 'customer_email', 'customer_address', 'customer_city', 'customer_country', 'customer_vat', 'customer_reg', 'customer_bank_name', 'customer_bank_account', 'customer_bank_swift', 'subtotal', 'vat', 'total', 'notes', 'valid_until'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  }
  fields.push("updated_at = datetime('now')");
  values.push(req.params.id, req.params.userId);
  db.prepare(`UPDATE quotes SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`).run(...values);

  if (updates.items && Array.isArray(updates.items)) {
    db.prepare('DELETE FROM quote_items WHERE quote_id = ?').run(req.params.id);
    const insertItem = db.prepare(`INSERT INTO quote_items (id, quote_id, description, quantity, unit, unit_price, total, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    updates.items.forEach((item, idx) => {
      const itemId = `qi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      insertItem.run(itemId, req.params.id, item.description || '', item.quantity || 1, item.unit || 'cope', item.unit_price || 0, item.total || 0, idx);
    });
  }

  const quote = db.prepare('SELECT * FROM quotes WHERE id = ?').get(req.params.id);
  const items = db.prepare('SELECT * FROM quote_items WHERE quote_id = ? ORDER BY sort_order').all(req.params.id);
  res.json({ ...quote, items });
});

app.delete('/api/:userId/quotes/:id', (req, res) => {
  db.prepare('DELETE FROM quotes WHERE id = ? AND user_id = ?').run(req.params.id, req.params.userId);
  res.json({ success: true });
});

app.get('/api/:userId/quotes/next-number', (req, res) => {
  const docType = req.query.doc_type || 'quote';
  const prefix = docType === 'quote' ? 'Q' : 'INV';
  const year = new Date().getFullYear();
  const row = db.prepare('SELECT COUNT(*) as cnt FROM quotes WHERE user_id = ? AND doc_type = ?').get(req.params.userId, docType);
  const num = (row.cnt || 0) + 1;
  res.json({ number: `${prefix}-${year}-${String(num).padStart(3, '0')}` });
});

app.get('/api/:userId/price-config', (req, res) => {
  const row = db.prepare('SELECT config_json FROM price_configs WHERE user_id = ?').get(req.params.userId);
  if (!row) return res.json(null);
  try { res.json(JSON.parse(row.config_json)); } catch { res.json(null); }
});

app.put('/api/:userId/price-config', (req, res) => {
  const config = req.body;
  const json = JSON.stringify(config);
  db.prepare(`INSERT INTO price_configs (user_id, config_json, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(user_id) DO UPDATE SET config_json = ?, updated_at = datetime('now')`)
    .run(req.params.userId, json, json);
  res.json({ ...config, updated_at: new Date().toISOString() });
});

app.get('/api/:userId/company-profile', (req, res) => {
  const row = db.prepare('SELECT profile_json FROM company_profiles WHERE user_id = ?').get(req.params.userId);
  if (!row) return res.json(null);
  try { res.json(JSON.parse(row.profile_json)); } catch { res.json(null); }
});

app.put('/api/:userId/company-profile', (req, res) => {
  const profile = req.body;
  const json = JSON.stringify(profile);
  db.prepare(`INSERT INTO company_profiles (user_id, profile_json, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(user_id) DO UPDATE SET profile_json = ?, updated_at = datetime('now')`)
    .run(req.params.userId, json, json);
  res.json(profile);
});

app.get('/api/:userId/dashboard-stats', (req, res) => {
  const userId = req.params.userId;
  const quoteCount = db.prepare("SELECT COUNT(*) as cnt FROM quotes WHERE user_id = ? AND doc_type = 'quote'").get(userId);
  const invoiceCount = db.prepare("SELECT COUNT(*) as cnt FROM quotes WHERE user_id = ? AND doc_type = 'invoice'").get(userId);
  const revenueRow = db.prepare("SELECT COALESCE(SUM(total), 0) as total FROM quotes WHERE user_id = ? AND doc_type = 'invoice'").get(userId);
  const customerCount = db.prepare('SELECT COUNT(*) as cnt FROM customers WHERE user_id = ?').get(userId);
  res.json({
    totalQuotes: quoteCount.cnt,
    totalInvoices: invoiceCount.cnt,
    revenue: revenueRow.total,
    customerCount: customerCount.cnt,
  });
});

const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

function formatUser(row) {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    plan: row.plan,
    status: row.status,
    companyName: row.company_name,
    createdAt: row.created_at,
  };
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Doorly API server running on port ${PORT}`);
  console.log(`Database: ${path.join(dataDir, 'doorly.db')}`);
});
