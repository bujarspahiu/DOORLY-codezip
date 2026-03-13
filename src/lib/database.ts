const API_BASE = '/api';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export async function getProfile(userId: string) {
  return apiFetch<any>(`/${userId}/company-profile`);
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  return apiFetch<any>(`/${userId}/company-profile`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function getCustomers(userId: string) {
  return apiFetch<any[]>(`/${userId}/customers`);
}

export async function createCustomer(userId: string, customer: { name: string; email?: string; phone?: string; address?: string; city?: string; country?: string; reg_number?: string; vat_number?: string; bank_name?: string; bank_account?: string; bank_swift?: string }) {
  return apiFetch<any>(`/${userId}/customers`, {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}

export async function deleteCustomer(userId: string, id: string) {
  await apiFetch(`/${userId}/customers/${id}`, { method: 'DELETE' });
}

export async function getPriceConfig(userId: string) {
  return apiFetch<any>(`/${userId}/price-config`);
}

export async function savePriceConfig(userId: string, config: { materials: any[]; glass_types: any[]; services: any[]; accessories: any[] }) {
  return apiFetch<any>(`/${userId}/price-config`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

export async function getQuotes(userId: string, docType: 'quote' | 'invoice') {
  return apiFetch<any[]>(`/${userId}/quotes?doc_type=${docType}`);
}

export async function getRecentQuotes(userId: string, limit = 5) {
  return apiFetch<any[]>(`/${userId}/quotes/recent?limit=${limit}`);
}

export async function createQuote(userId: string, quote: {
  quote_number: string; doc_type: string; customer_name: string; customer_phone?: string;
  customer_email?: string; customer_address?: string; customer_city?: string; customer_country?: string;
  customer_vat?: string; customer_reg?: string; customer_bank_name?: string;
  customer_bank_account?: string; customer_bank_swift?: string;
  items: any[]; subtotal: number; vat: number; total: number; notes?: string; valid_until?: string;
}) {
  return apiFetch<any>(`/${userId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(quote),
  });
}

export async function updateQuote(userId: string, id: string, updates: Record<string, any>) {
  return apiFetch<any>(`/${userId}/quotes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteQuote(userId: string, id: string) {
  await apiFetch(`/${userId}/quotes/${id}`, { method: 'DELETE' });
}

export async function getNextQuoteNumber(userId: string, docType: 'quote' | 'invoice') {
  const result = await apiFetch<{ number: string }>(`/${userId}/quotes/next-number?doc_type=${docType}`);
  return result.number;
}

export async function getDashboardStats(userId: string) {
  return apiFetch<{ totalQuotes: number; totalInvoices: number; revenue: number; customerCount: number }>(`/${userId}/dashboard-stats`);
}

export async function logActivity(_userId: string, _action: string, _entityType = '', _entityId = '') {}
export async function getActivityLogs(_userId: string, _limit = 20) { return []; }
export async function adminGetUsers() { return []; }
export async function adminCreateUser(_email: string, _fullName: string, _companyName: string, _plan: string) { return {}; }
export async function adminUpdateStatus(_userId: string, _status: 'active' | 'suspended') { return {}; }
export async function adminDeleteUser(_userId: string) { return {}; }
export async function adminGetActivity() { return []; }
export async function adminGetStats() { return {}; }
