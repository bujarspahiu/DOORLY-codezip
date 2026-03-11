const LS_PREFIX = 'doorly_';

function getKey(userId: string, entity: string) {
  return `${LS_PREFIX}${entity}_${userId}`;
}

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function writeLS(key: string, data: any) {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function getProfile(userId: string) {
  return readLS(getKey(userId, 'profile'), null);
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  const existing = readLS(getKey(userId, 'profile'), {});
  const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
  writeLS(getKey(userId, 'profile'), merged);
  return merged;
}

export async function getCustomers(userId: string) {
  return readLS<any[]>(getKey(userId, 'customers'), []);
}

export async function createCustomer(userId: string, customer: { name: string; email?: string; phone?: string; address?: string; city?: string; country?: string; reg_number?: string; vat_number?: string; bank_name?: string; bank_account?: string; bank_swift?: string }) {
  const customers = readLS<any[]>(getKey(userId, 'customers'), []);
  const newCustomer = {
    id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    ...customer,
    created_at: new Date().toISOString(),
  };
  customers.unshift(newCustomer);
  writeLS(getKey(userId, 'customers'), customers);
  return newCustomer;
}

export async function deleteCustomer(userId: string, id: string) {
  const key = getKey(userId, 'customers');
  const arr = readLS<any[]>(key, []);
  writeLS(key, arr.filter((c: any) => c.id !== id));
}

export async function getPriceConfig(userId: string) {
  return readLS(getKey(userId, 'priceconfig'), null);
}

export async function savePriceConfig(userId: string, config: { materials: any[]; glass_types: any[]; services: any[]; accessories: any[] }) {
  const data = { ...config, user_id: userId, updated_at: new Date().toISOString() };
  writeLS(getKey(userId, 'priceconfig'), data);
  return data;
}

export async function getQuotes(userId: string, docType: 'quote' | 'invoice') {
  const all = readLS<any[]>(getKey(userId, 'quotes'), []);
  return all.filter((q: any) => q.doc_type === docType).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getRecentQuotes(userId: string, limit = 5) {
  const all = readLS<any[]>(getKey(userId, 'quotes'), []);
  return all.filter((q: any) => q.doc_type === 'quote').sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, limit);
}

export async function createQuote(userId: string, quote: {
  quote_number: string; doc_type: string; customer_name: string; customer_phone?: string;
  customer_email?: string; customer_address?: string; customer_city?: string; customer_country?: string;
  customer_vat?: string; customer_reg?: string; customer_bank_name?: string;
  customer_bank_account?: string; customer_bank_swift?: string;
  items: any[]; subtotal: number; vat: number; total: number; notes?: string; valid_until?: string;
}) {
  const all = readLS<any[]>(getKey(userId, 'quotes'), []);
  const newQuote = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    status: 'draft',
    ...quote,
    created_at: new Date().toISOString(),
  };
  all.unshift(newQuote);
  writeLS(getKey(userId, 'quotes'), all);
  return newQuote;
}

export async function updateQuote(userId: string, id: string, updates: Record<string, any>) {
  const key = getKey(userId, 'quotes');
  const arr = readLS<any[]>(key, []);
  const idx = arr.findIndex((q: any) => q.id === id);
  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...updates, updated_at: new Date().toISOString() };
    writeLS(key, arr);
    return arr[idx];
  }
  return null;
}

export async function deleteQuote(userId: string, id: string) {
  const key = getKey(userId, 'quotes');
  const arr = readLS<any[]>(key, []);
  writeLS(key, arr.filter((q: any) => q.id !== id));
}

export async function getNextQuoteNumber(userId: string, docType: 'quote' | 'invoice') {
  const prefix = docType === 'quote' ? 'Q' : 'INV';
  const year = new Date().getFullYear();
  const all = readLS<any[]>(getKey(userId, 'quotes'), []);
  const count = all.filter((q: any) => q.doc_type === docType).length;
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

export async function getDashboardStats(userId: string) {
  const all = readLS<any[]>(getKey(userId, 'quotes'), []);
  const customers = readLS<any[]>(getKey(userId, 'customers'), []);
  const quotes = all.filter((q: any) => q.doc_type === 'quote');
  const invoices = all.filter((q: any) => q.doc_type === 'invoice');
  const revenue = invoices.reduce((sum: number, q: any) => sum + (parseFloat(q.total) || 0), 0);
  return {
    totalQuotes: quotes.length,
    totalInvoices: invoices.length,
    revenue,
    customerCount: customers.length,
  };
}

export async function logActivity(_userId: string, _action: string, _entityType = '', _entityId = '') {
}

export async function getActivityLogs(_userId: string, _limit = 20) {
  return [];
}

export async function adminGetUsers() { return []; }
export async function adminCreateUser(_email: string, _fullName: string, _companyName: string, _plan: string) { return {}; }
export async function adminUpdateStatus(_userId: string, _status: 'active' | 'suspended') { return {}; }
export async function adminDeleteUser(_userId: string) { return {}; }
export async function adminGetActivity() { return []; }
export async function adminGetStats() { return {}; }
