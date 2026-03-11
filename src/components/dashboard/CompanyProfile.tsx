import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth, CompanyProfile as CompanyProfileType } from '../../contexts/AuthContext';

const CompanyProfile: React.FC = () => {
  const { t, lang } = useLanguage();
  const { user, updateCompanyProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CompanyProfileType>(
    user?.company || {
      companyName: '', regNumber: '', vatNumber: '', address: '', city: '', country: '',
      phone: '', email: '', website: '', logoUrl: '', accentColor: '#2563EB', stampUrl: '', isComplete: false,
      bankName: '', bankAccount: '', bankSwift: '',
    }
  );

  const handleChange = (field: keyof CompanyProfileType, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(lang === 'en' ? 'Logo must be under 2MB' : 'Logo duhet të jetë nën 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm({ ...form, logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setForm({ ...form, logoUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateCompanyProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = ['#2563EB', '#059669', '#7C3AED', '#DC2626', '#EA580C', '#0891B2', '#4F46E5', '#BE185D'];

  return (
    <div className="max-w-4xl mx-auto">
      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {t('profile.saved')}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{lang === 'en' ? 'Company Logo' : 'Logo e Kompanisë'}</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              )}
            </div>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors" style={{ backgroundColor: form.accentColor }}>
                {form.logoUrl ? (lang === 'en' ? 'Change Logo' : 'Ndrysho Logon') : (lang === 'en' ? 'Upload Logo' : 'Ngarko Logon')}
              </button>
              {form.logoUrl && (
                <button type="button" onClick={removeLogo} className="ml-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  {lang === 'en' ? 'Remove' : 'Fshi'}
                </button>
              )}
              <p className="text-xs text-gray-500 mt-2">{lang === 'en' ? 'PNG, JPG up to 2MB. Will appear on quotes and invoices.' : 'PNG, JPG deri 2MB. Do të shfaqet në oferta dhe fatura.'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{lang === 'en' ? 'Company Information' : 'Informacioni i Kompanisë'}</h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { key: 'companyName', label: t('profile.companyName'), required: true },
              { key: 'regNumber', label: t('profile.regNumber'), required: true },
              { key: 'vatNumber', label: t('profile.vatNumber'), required: true },
              { key: 'address', label: t('profile.address'), required: true },
              { key: 'city', label: t('profile.city'), required: true },
              { key: 'country', label: t('profile.country'), required: true },
              { key: 'phone', label: t('profile.phone'), required: true },
              { key: 'email', label: t('profile.email'), required: true, type: 'email' },
              { key: 'website', label: t('profile.website'), required: false, colSpan: true },
            ].map((field) => (
              <div key={field.key} className={field.colSpan ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input type={field.type || 'text'} value={(form as any)[field.key] || ''} onChange={(e) => handleChange(field.key as keyof CompanyProfileType, e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required={field.required} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            {lang === 'en' ? 'Bank Account Details' : 'Të Dhënat Bankare'}
          </h3>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { key: 'bankName', label: lang === 'en' ? 'Bank Name' : 'Emri i Bankës', required: true },
              { key: 'bankSwift', label: 'SWIFT / BIC', required: true },
              { key: 'bankAccount', label: 'IBAN', required: true, colSpan: true },
            ].map((field) => (
              <div key={field.key} className={field.colSpan ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input type="text" value={(form as any)[field.key] || ''} onChange={(e) => handleChange(field.key as keyof CompanyProfileType, e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono" required={field.required} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{lang === 'en' ? 'Branding' : 'Marka'}</h3>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.accentColor')}</label>
            <div className="flex items-center gap-3 flex-wrap">
              {colorPresets.map((color) => (
                <button key={color} type="button" onClick={() => handleChange('accentColor', color)} className={`w-10 h-10 rounded-xl transition-all ${form.accentColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color }} />
              ))}
              <div className="flex items-center gap-2 ml-2">
                <input type="color" value={form.accentColor} onChange={(e) => handleChange('accentColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                <span className="text-sm text-gray-500 font-mono">{form.accentColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{lang === 'en' ? 'Document Preview' : 'Parashikimi i Dokumentit'}</h3>
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <div className="flex items-start justify-between border-b pb-4 mb-4" style={{ borderColor: form.accentColor }}>
              <div className="flex items-start gap-4">
                {form.logoUrl && (
                  <img src={form.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                )}
                <div>
                  <h4 className="text-xl font-bold" style={{ color: form.accentColor }}>{form.companyName || 'Your Company Name'}</h4>
                  <p className="text-sm text-gray-600 mt-1">{form.address || '123 Street'}, {form.city || 'City'}, {form.country || 'Country'}</p>
                  <p className="text-sm text-gray-600">{form.phone || '+355 69 000 0000'} | {form.email || 'info@company.com'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">VAT: {form.vatNumber || 'AL000000000'}</p>
                <p className="text-sm text-gray-500">Reg: {form.regNumber || 'REG-000'}</p>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400 py-8">
              {lang === 'en' ? 'Quote/Invoice content will appear here' : 'Përmbajtja e ofertës/faturës do të shfaqet këtu'}
            </div>
            {(form.bankName || form.bankAccount) && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{lang === 'en' ? 'Bank Details' : 'Të Dhënat Bankare'}</p>
                <p className="text-sm text-gray-600">{form.bankName} | IBAN: {form.bankAccount}</p>
                {form.bankSwift && <p className="text-sm text-gray-600">SWIFT: {form.bankSwift}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="px-8 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: form.accentColor }}>
            {saving ? (lang === 'en' ? 'Saving...' : 'Duke ruajtur...') : t('profile.save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
