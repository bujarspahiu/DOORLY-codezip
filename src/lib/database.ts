import { supabase } from './supabase';

// ============ PROFILES ============
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  const profileComplete = !!(
    updates.company_name && updates.reg_number && updates.vat_number &&
    updates.address && updates.city && updates.country &&
    updates.phone && updates.company_email
  );
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, profile_complete: profileComplete, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============ CUSTOMERS ============
export async function getCustomers(userId: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createCustomer(userId: string, customer: { name: string; email?: string; phone?: string; address?: string; city?: string }) {
  const { data, error } = await supabase
    .from('customers')
    .insert({ user_id: userId, ...customer })
    .select()
    .single();
  if (error) throw error;
  await logActivity(userId, `Added customer: ${customer.name}`, 'customer', data.id);
  return data;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ============ PRICE CONFIGS ============
export async function getPriceConfig(userId: string) {
  const { data, error } = await supabase
    .from('price_configs')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function savePriceConfig(userId: string, config: { materials: any[]; glass_types: any[]; services: any[]; accessories: any[] }) {
  const { data: existing } = await supabase
    .from('price_configs')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('price_configs')
      .update({ ...config, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('price_configs')
      .insert({ user_id: userId, ...config })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// ============ QUOTES & INVOICES ============
export async function getQuotes(userId: string, docType: 'quote' | 'invoice') {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .eq('doc_type', docType)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getRecentQuotes(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .eq('doc_type', 'quote')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function createQuote(userId: string, quote: {
  quote_number: string; doc_type: string; customer_name: string; customer_phone?: string;
  customer_email?: string; customer_address?: string; items: any[];
  subtotal: number; vat: number; total: number; notes?: string; valid_until?: string;
}) {
  const { data, error } = await supabase
    .from('quotes')
    .insert({ user_id: userId, ...quote })
    .select()
    .single();
  if (error) throw error;
  await logActivity(userId, `Created ${quote.doc_type}: ${quote.quote_number}`, quote.doc_type, data.id);
  return data;
}

export async function updateQuote(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('quotes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuote(id: string) {
  const { error } = await supabase.from('quotes').delete().eq('id', id);
  if (error) throw error;
}

export async function getNextQuoteNumber(userId: string, docType: 'quote' | 'invoice') {
  const prefix = docType === 'quote' ? 'Q' : 'INV';
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('doc_type', docType);
  const num = (count || 0) + 1;
  return `${prefix}-${year}-${String(num).padStart(3, '0')}`;
}

// ============ DASHBOARD STATS ============
export async function getDashboardStats(userId: string) {
  const { count: totalQuotes } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('doc_type', 'quote');

  const { count: totalInvoices } = await supabase
    .from('quotes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('doc_type', 'invoice');

  const { data: revenueData } = await supabase
    .from('quotes')
    .select('total')
    .eq('user_id', userId)
    .eq('doc_type', 'invoice');

  const revenue = (revenueData || []).reduce((sum, q) => sum + (parseFloat(q.total) || 0), 0);

  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    totalQuotes: totalQuotes || 0,
    totalInvoices: totalInvoices || 0,
    revenue,
    customerCount: customerCount || 0,
  };
}

// ============ ACTIVITY LOGS ============
export async function logActivity(userId: string, action: string, entityType = '', entityId = '') {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    await supabase.from('activity_logs').insert({
      user_id: userId,
      user_name: profile?.full_name || '',
      action,
      entity_type: entityType,
      entity_id: entityId,
    });
  } catch {
    // Non-critical, don't throw
  }
}

export async function getActivityLogs(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ============ ADMIN OPERATIONS (via edge function) ============
export async function adminGetUsers() {
  const { data, error } = await supabase.functions.invoke('admin-operations', {
    body: { action: 'get_users' },
  });
  if (error) throw error;
  return data?.users || [];
}

export async function adminCreateUser(email: string, fullName: string, companyName: string, plan: string) {
  const { data, error } = await supabase.functions.invoke('admin-operations', {
    body: { action: 'create_user', email, password: 'Welcome123!', full_name: fullName, company_name: companyName, plan },
  });
  if (error) throw error;
  return data;
}

export async function adminUpdateStatus(userId: string, status: 'active' | 'suspended') {
  const { data, error } = await supabase.functions.invoke('admin-operations', {
    body: { action: 'update_status', user_id: userId, status },
  });
  if (error) throw error;
  return data;
}

export async function adminDeleteUser(userId: string) {
  const { data, error } = await supabase.functions.invoke('admin-operations', {
    body: { action: 'delete_user', user_id: userId },
  });
  if (error) throw error;
  return data;
}

export async function adminGetActivity() {
  const { data, error } = await supabase.functions.invoke('admin-operations', {
    body: { action: 'get_activity' },
  });
  if (error) throw error;
  return data?.logs || [];
}

export async function adminGetStats() {
  const { data, error } = await supabase.functions.invoke('admin-operations', {
    body: { action: 'get_stats' },
  });
  if (error) throw error;
  return data?.stats || {};
}
