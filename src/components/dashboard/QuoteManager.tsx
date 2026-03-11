import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getQuotes, createQuote, updateQuote, deleteQuote as dbDeleteQuote, getNextQuoteNumber, getCustomers } from '../../lib/database';
import type { CalcItem } from './Calculator';

interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  customer_city: string;
  customer_country: string;
  customer_vat: string;
  customer_reg: string;
  customer_bank_name: string;
  customer_bank_account: string;
  customer_bank_swift: string;
  items: QuoteItem[];
  subtotal: number;
  vat: number;
  total: number;
  status: string;
  doc_type: string;
  notes: string;
  valid_until: string;
  created_at: string;
}

interface QuoteManagerProps {
  type?: 'quote' | 'invoice';
  initialCalcItems?: CalcItem[] | null;
  onCalcItemsConsumed?: () => void;
  onConvertToInvoice?: (quote: any) => void;
}

function calcItemsToQuoteItems(items: CalcItem[]): QuoteItem[] {
  const result: QuoteItem[] = [];
  items.forEach(item => {
    const typeLabel = item.productType === 'window' ? 'Window' : item.productType === 'door' ? 'Door' : 'Sliding Door';
    const productCost = item.materialCost + item.glassCost;
    result.push({
      description: `${typeLabel} ${item.width}x${item.height}m — ${item.materialName}, ${item.glassName}`,
      quantity: item.quantity,
      unitPrice: Math.round((productCost / item.quantity) * 100) / 100,
      total: Math.round(productCost * 100) / 100,
    });
    if (item.serviceDetails && item.serviceDetails.length > 0) {
      item.serviceDetails.forEach(svc => {
        const qty = svc.unit === 'flat' ? 1 : item.quantity;
        result.push({
          description: `  ${svc.name}`,
          quantity: qty,
          unitPrice: svc.price,
          total: Math.round(svc.price * qty * 100) / 100,
        });
      });
    }
    if (item.accessoryDetails && item.accessoryDetails.length > 0) {
      item.accessoryDetails.forEach(acc => {
        result.push({
          description: `  ${acc.name}`,
          quantity: item.quantity,
          unitPrice: acc.price,
          total: Math.round(acc.price * item.quantity * 100) / 100,
        });
      });
    }
  });
  return result;
}

const QuoteManager: React.FC<QuoteManagerProps> = ({ type = 'quote', initialCalcItems, onCalcItemsConsumed, onConvertToInvoice }) => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const accent = user?.company?.accentColor || '#2563EB';
  const isInvoice = type === 'invoice';

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
    customerCity: '', customerCountry: '', customerVat: '', customerReg: '',
    customerBankName: '', customerBankAccount: '', customerBankSwift: '',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] as QuoteItem[],
  });

  useEffect(() => {
    if (initialCalcItems && initialCalcItems.length > 0) {
      const quoteItems = calcItemsToQuoteItems(initialCalcItems);
      setForm(prev => ({
        ...prev,
        items: quoteItems,
      }));
      setShowForm(true);
      setEditingId(null);
      onCalcItemsConsumed?.();
    }
  }, [initialCalcItems]);

  useEffect(() => {
    if (!user) return;
    loadQuotes();
    loadCustomers();
  }, [user, type]);

  const loadQuotes = async () => {
    if (!user) return;
    try {
      const data = await getQuotes(user.id, type);
      setQuotes(data.map((q: any) => ({ ...q, items: q.items || [] })));
    } catch (err) {
      console.error('Error loading quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    if (!user) return;
    try {
      const data = await getCustomers(user.id);
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const selectCustomer = (customerId: string) => {
    const c = customers.find(cust => cust.id === customerId);
    if (!c) return;
    setForm({
      ...form,
      customerName: c.name || '',
      customerPhone: c.phone || '',
      customerEmail: c.email || '',
      customerAddress: c.address || '',
      customerCity: c.city || '',
      customerCountry: c.country || '',
      customerVat: c.vat_number || '',
      customerReg: c.reg_number || '',
      customerBankName: c.bank_name || '',
      customerBankAccount: c.bank_account || '',
      customerBankSwift: c.bank_swift || '',
    });
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
    paid: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700',
  };

  const addFormItem = () => setForm({ ...form, items: [...form.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] });
  const updateFormItem = (idx: number, field: keyof QuoteItem, value: string | number) => {
    const items = [...form.items];
    (items[idx] as any)[field] = value;
    if (field === 'quantity' || field === 'unitPrice') items[idx].total = items[idx].quantity * items[idx].unitPrice;
    setForm({ ...form, items });
  };
  const removeFormItem = (idx: number) => { if (form.items.length > 1) setForm({ ...form, items: form.items.filter((_, i) => i !== idx) }); };

  const formSubtotal = form.items.reduce((s, i) => s + i.total, 0);
  const formVat = formSubtotal * 0.18;
  const formTotal = formSubtotal + formVat;

  const handleSave = async () => {
    if (!user || !form.customerName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        customer_name: form.customerName, customer_phone: form.customerPhone,
        customer_email: form.customerEmail, customer_address: form.customerAddress,
        customer_city: form.customerCity, customer_country: form.customerCountry,
        customer_vat: form.customerVat, customer_reg: form.customerReg,
        customer_bank_name: form.customerBankName, customer_bank_account: form.customerBankAccount,
        customer_bank_swift: form.customerBankSwift,
        items: form.items, subtotal: formSubtotal, vat: formVat, total: formTotal, notes: form.notes,
      };
      if (editingId) {
        await updateQuote(user.id, editingId, payload);
      } else {
        const qNum = await getNextQuoteNumber(user.id, type);
        await createQuote(user.id, {
          ...payload, quote_number: qNum, doc_type: type,
          valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        });
      }
      setShowForm(false); setEditingId(null);
      setForm({ customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', customerCity: '', customerCountry: '', customerVat: '', customerReg: '', customerBankName: '', customerBankAccount: '', customerBankSwift: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] });
      await loadQuotes();
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  const duplicateQuote = async (q: Quote) => {
    if (!user) return;
    try {
      const qNum = await getNextQuoteNumber(user.id, type);
      await createQuote(user.id, {
        quote_number: qNum, doc_type: type, customer_name: q.customer_name,
        customer_phone: q.customer_phone, customer_email: q.customer_email,
        customer_address: q.customer_address, customer_city: q.customer_city,
        customer_country: q.customer_country, customer_vat: q.customer_vat,
        customer_reg: q.customer_reg, customer_bank_name: q.customer_bank_name,
        customer_bank_account: q.customer_bank_account, customer_bank_swift: q.customer_bank_swift,
        items: q.items, subtotal: q.subtotal, vat: q.vat, total: q.total, notes: q.notes,
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      await loadQuotes();
    } catch (err) { console.error(err); }
  };

  const editQuote = (q: Quote) => {
    setEditingId(q.id);
    setForm({
      customerName: q.customer_name, customerPhone: q.customer_phone || '',
      customerEmail: q.customer_email || '', customerAddress: q.customer_address || '',
      customerCity: q.customer_city || '', customerCountry: q.customer_country || '',
      customerVat: q.customer_vat || '', customerReg: q.customer_reg || '',
      customerBankName: q.customer_bank_name || '', customerBankAccount: q.customer_bank_account || '',
      customerBankSwift: q.customer_bank_swift || '',
      notes: q.notes || '', items: q.items.length ? q.items : [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try { await dbDeleteQuote(user.id, id); setQuotes(quotes.filter(q => q.id !== id)); } catch (err) { console.error(err); }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('quote-preview-content');
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=800,height=1000');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${typeLabel}</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #111; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 8px 12px; text-align: left; }
      .text-right { text-align: right; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-mono { font-family: 'SF Mono', 'Courier New', monospace; }
      .text-sm { font-size: 0.875rem; }
      .text-xs { font-size: 0.75rem; }
      .text-gray-600 { color: #4B5563; }
      .text-gray-500 { color: #6B7280; }
      .mb-6 { margin-bottom: 1.5rem; }
      .mt-8 { margin-top: 2rem; }
      .p-4 { padding: 1rem; }
      .bg-gray-50 { background: #F9FAFB; }
      .rounded-lg { border-radius: 0.5rem; }
      .border-gray-200 { border: 1px solid #E5E7EB; }
      @media print { body { padding: 0; } }
    </style></head><body>${printContent.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  const typeLabel = isInvoice ? (lang === 'en' ? 'Invoice' : 'Faturë') : (lang === 'en' ? 'Quote' : 'Ofertë');

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isInvoice ? (lang === 'en' ? 'Invoices' : 'Faturat') : (lang === 'en' ? 'Quotes' : 'Ofertat')}</h2>
          <p className="text-sm text-gray-500">{quotes.length} {typeLabel.toLowerCase()}s</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', customerCity: '', customerCountry: '', customerVat: '', customerReg: '', customerBankName: '', customerBankAccount: '', customerBankSwift: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }] }); }} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg" style={{ backgroundColor: accent }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {lang === 'en' ? `New ${typeLabel}` : `${typeLabel} e Re`}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">{editingId ? `${lang === 'en' ? 'Edit' : 'Ndrysho'} ${typeLabel}` : `${lang === 'en' ? 'New' : 'E Re'} ${typeLabel}`}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          {customers.length > 0 && !editingId && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-blue-800 mb-2">{lang === 'en' ? 'Select Existing Customer' : 'Zgjidh Klientin Ekzistues'}</label>
              <select onChange={(e) => e.target.value && selectCustomer(e.target.value)} className="w-full px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-sm" defaultValue="">
                <option value="">{lang === 'en' ? '-- Select a customer --' : '-- Zgjidh një klient --'}</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.city ? ` (${c.city})` : ''}</option>)}
              </select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Customer Name' : 'Emri i Klientit'} *</label><input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Phone' : 'Telefoni'}</label><input type="text" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Address' : 'Adresa'}</label><input type="text" value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'City' : 'Qyteti'}</label><input type="text" value={form.customerCity} onChange={(e) => setForm({ ...form, customerCity: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Country' : 'Shteti'}</label><input type="text" value={form.customerCountry} onChange={(e) => setForm({ ...form, customerCountry: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'VAT Number' : 'Numri TVSH'}</label><input type="text" value={form.customerVat} onChange={(e) => setForm({ ...form, customerVat: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Reg. Number' : 'Nr. Regjistrimit'}</label><input type="text" value={form.customerReg} onChange={(e) => setForm({ ...form, customerReg: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{lang === 'en' ? 'Line Items' : 'Artikujt'}</h4>
              <button onClick={addFormItem} className="text-sm font-medium flex items-center gap-1" style={{ color: accent }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {lang === 'en' ? 'Add Item' : 'Shto Artikull'}
              </button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">{idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Description' : 'Përshkrimi'}</label>}<input type="text" value={item.description} onChange={(e) => updateFormItem(idx, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" /></div>
                  <div className="col-span-2">{idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Qty' : 'Sasia'}</label>}<input type="number" value={item.quantity} onChange={(e) => updateFormItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right font-mono focus:ring-2 focus:ring-blue-500" min="1" /></div>
                  <div className="col-span-2">{idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">{lang === 'en' ? 'Price' : 'Çmimi'}</label>}<input type="number" value={item.unitPrice} onChange={(e) => updateFormItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-right font-mono focus:ring-2 focus:ring-blue-500" min="0" step="0.01" /></div>
                  <div className="col-span-2">{idx === 0 && <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>}<div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-right font-mono font-semibold">€{item.total.toFixed(2)}</div></div>
                  <div className="col-span-1"><button onClick={() => removeFormItem(idx)} className="p-2 text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-600">{lang === 'en' ? 'Subtotal' : 'Nëntotali'}</span><span className="font-mono font-semibold">€{formSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">VAT (18%)</span><span className="font-mono font-semibold">€{formVat.toFixed(2)}</span></div>
              <div className="flex justify-between pt-2 border-t-2" style={{ borderColor: accent }}><span className="font-bold">Total</span><span className="font-mono font-extrabold text-lg" style={{ color: accent }}>€{formTotal.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'en' ? 'Notes' : 'Shënime'}</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm" /></div>
          <div className="flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">{lang === 'en' ? 'Cancel' : 'Anulo'}</button>
            <button onClick={handleSave} disabled={saving || !form.customerName.trim()} className="px-6 py-2.5 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: accent }}>
              {saving ? (lang === 'en' ? 'Saving...' : 'Duke ruajtur...') : (lang === 'en' ? `Save ${typeLabel}` : `Ruaj ${typeLabel}n`)}
            </button>
          </div>
        </div>
      )}

      {quotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p className="font-medium text-lg">{lang === 'en' ? `No ${typeLabel.toLowerCase()}s yet` : `Ende pa ${typeLabel.toLowerCase()}`}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{lang === 'en' ? 'Customer' : 'Klienti'}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{lang === 'en' ? 'Date' : 'Data'}</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{lang === 'en' ? 'Actions' : 'Veprime'}</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-gray-900">{q.quote_number}</td>
                    <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{q.customer_name}</p><p className="text-xs text-gray-500">{q.customer_phone}</p></td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">€{parseFloat(String(q.total)).toFixed(2)}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[q.status] || ''}`}>{q.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(q.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreviewQuote(q)} className="p-2 text-gray-400 hover:text-blue-600" title={lang === 'en' ? 'Preview' : 'Shiko'}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                        <button onClick={() => editQuote(q)} className="p-2 text-gray-400 hover:text-yellow-600" title={lang === 'en' ? 'Edit' : 'Ndrysho'}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => duplicateQuote(q)} className="p-2 text-gray-400 hover:text-green-600" title={lang === 'en' ? 'Duplicate' : 'Dupliko'}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                        {!isInvoice && onConvertToInvoice && (
                          <button onClick={() => onConvertToInvoice(q)} className="p-2 text-gray-400 hover:text-purple-600" title={lang === 'en' ? 'Convert to Invoice' : 'Konverto në Faturë'}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg></button>
                        )}
                        <button onClick={() => handleDelete(q.id)} className="p-2 text-gray-400 hover:text-red-600" title={lang === 'en' ? 'Delete' : 'Fshij'}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewQuote(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="font-bold text-gray-900">{typeLabel} {previewQuote.quote_number}</h3>
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: accent }}>{lang === 'en' ? 'Print' : 'Printo'}</button>
                {!isInvoice && onConvertToInvoice && (
                  <button onClick={() => { onConvertToInvoice(previewQuote); setPreviewQuote(null); }} className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-purple-600 hover:bg-purple-700">{lang === 'en' ? 'Convert to Invoice' : 'Konverto në Faturë'}</button>
                )}
                <button onClick={() => setPreviewQuote(null)} className="p-2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            </div>
            <div id="quote-preview-content" className="p-8">
              <div className="flex justify-between items-start border-b-2 pb-6 mb-6" style={{ borderColor: accent }}>
                <div className="flex items-start gap-4">
                  {user?.company?.logoUrl && (
                    <img src={user.company.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                  )}
                  <div>
                    <h2 className="text-2xl font-extrabold" style={{ color: accent }}>{user?.company?.companyName || 'Doorly'}</h2>
                    <p className="text-sm text-gray-600 mt-1">{user?.company?.address}{user?.company?.city ? `, ${user?.company?.city}` : ''}{user?.company?.country ? `, ${user?.company?.country}` : ''}</p>
                    <p className="text-sm text-gray-600">{user?.company?.phone} | {user?.company?.email}</p>
                    <p className="text-xs text-gray-500 mt-1">VAT: {user?.company?.vatNumber} | Reg: {user?.company?.regNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-3xl font-extrabold uppercase tracking-wider" style={{ color: accent }}>{typeLabel}</h3>
                  <p className="text-sm text-gray-600 mt-2 font-mono">{previewQuote.quote_number}</p>
                  <p className="text-sm text-gray-600">{new Date(previewQuote.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{lang === 'en' ? 'From' : 'Nga'}</p>
                  <p className="font-bold text-gray-900">{user?.company?.companyName}</p>
                  <p className="text-sm text-gray-600">{user?.company?.address}{user?.company?.city ? `, ${user?.company?.city}` : ''}</p>
                  <p className="text-sm text-gray-600">{user?.company?.phone}</p>
                  <p className="text-sm text-gray-600">{user?.company?.email}</p>
                  {user?.company?.vatNumber && <p className="text-xs text-gray-500 mt-1">VAT: {user?.company?.vatNumber}</p>}
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{lang === 'en' ? 'Bill To' : 'Faturuar Për'}</p>
                  <p className="font-bold text-gray-900">{previewQuote.customer_name}</p>
                  {previewQuote.customer_address && <p className="text-sm text-gray-600">{previewQuote.customer_address}{previewQuote.customer_city ? `, ${previewQuote.customer_city}` : ''}{previewQuote.customer_country ? `, ${previewQuote.customer_country}` : ''}</p>}
                  {previewQuote.customer_phone && <p className="text-sm text-gray-600">{previewQuote.customer_phone}</p>}
                  {previewQuote.customer_email && <p className="text-sm text-gray-600">{previewQuote.customer_email}</p>}
                  {previewQuote.customer_vat && <p className="text-xs text-gray-500 mt-1">VAT: {previewQuote.customer_vat}</p>}
                  {previewQuote.customer_reg && <p className="text-xs text-gray-500">Reg: {previewQuote.customer_reg}</p>}
                </div>
              </div>

              <table className="w-full mb-6">
                <thead><tr style={{ backgroundColor: accent }}><th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">#</th><th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">{lang === 'en' ? 'Description' : 'Përshkrimi'}</th><th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">{lang === 'en' ? 'Qty' : 'Sasia'}</th><th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">{lang === 'en' ? 'Price' : 'Çmimi'}</th><th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">Total</th></tr></thead>
                <tbody>{(previewQuote.items || []).map((item: QuoteItem, idx: number) => (<tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}><td className="px-4 py-3 text-sm">{idx + 1}</td><td className="px-4 py-3 text-sm font-medium">{item.description}</td><td className="px-4 py-3 text-sm text-right font-mono">{item.quantity}</td><td className="px-4 py-3 text-sm text-right font-mono">€{item.unitPrice?.toFixed(2)}</td><td className="px-4 py-3 text-sm text-right font-mono font-semibold">€{item.total?.toFixed(2)}</td></tr>))}</tbody>
              </table>
              <div className="flex justify-end">
                <div className="w-72">
                  <div className="flex justify-between py-2 text-sm"><span className="text-gray-600">{lang === 'en' ? 'Subtotal' : 'Nëntotali'}</span><span className="font-mono font-semibold">€{parseFloat(String(previewQuote.subtotal)).toFixed(2)}</span></div>
                  <div className="flex justify-between py-2 text-sm"><span className="text-gray-600">VAT (18%)</span><span className="font-mono font-semibold">€{parseFloat(String(previewQuote.vat)).toFixed(2)}</span></div>
                  <div className="flex justify-between py-3 border-t-2 mt-2" style={{ borderColor: accent }}><span className="font-bold text-lg">{lang === 'en' ? 'Total Due' : 'Totali'}</span><span className="font-mono font-extrabold text-xl" style={{ color: accent }}>€{parseFloat(String(previewQuote.total)).toFixed(2)}</span></div>
                </div>
              </div>

              {(user?.company?.bankName || user?.company?.bankAccount) && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{lang === 'en' ? 'Payment Details' : 'Detajet e Pagesës'}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{lang === 'en' ? 'Bank' : 'Banka'}</p>
                      <p className="font-medium text-gray-900">{user?.company?.bankName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">SWIFT / BIC</p>
                      <p className="font-medium text-gray-900 font-mono">{user?.company?.bankSwift}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">IBAN</p>
                      <p className="font-medium text-gray-900 font-mono">{user?.company?.bankAccount}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">{lang === 'en' ? 'Thank you for your business!' : 'Faleminderit për bashkëpunimin!'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteManager;
