import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getPriceConfig, savePriceConfig } from '../../lib/database';

export interface PriceConfig {
  materials: { id: string; name: string; nameAl: string; pricePerSqm: number; enabled?: boolean }[];
  glassTypes: { id: string; name: string; nameAl: string; pricePerSqm: number; enabled?: boolean }[];
  services: { id: string; name: string; nameAl: string; price: number; unit: string; enabled?: boolean }[];
  accessories: { id: string; name: string; nameAl: string; price: number; enabled?: boolean }[];
}

export const defaultPrices: PriceConfig = {
  materials: [
    { id: 'pvc', name: 'PVC', nameAl: 'PVC', pricePerSqm: 120, enabled: true },
    { id: 'aluminum', name: 'Aluminum', nameAl: 'Alumin', pricePerSqm: 180, enabled: true },
    { id: 'wood', name: 'Wood', nameAl: 'Dru', pricePerSqm: 220, enabled: true },
    { id: 'steel', name: 'Steel', nameAl: 'Çelik', pricePerSqm: 280, enabled: true },
  ],
  glassTypes: [
    { id: 'single', name: 'Single Glass (4mm)', nameAl: 'Xham i Thjeshtë (4mm)', pricePerSqm: 25, enabled: true },
    { id: 'double', name: 'Double Glass (4-16-4)', nameAl: 'Xham Dyfish (4-16-4)', pricePerSqm: 55, enabled: true },
    { id: 'triple', name: 'Triple Glass (4-12-4-12-4)', nameAl: 'Xham Trefish (4-12-4-12-4)', pricePerSqm: 95, enabled: true },
  ],
  services: [
    { id: 'installation', name: 'Installation', nameAl: 'Instalimi', price: 35, unit: 'per unit', enabled: true },
    { id: 'transport', name: 'Transport', nameAl: 'Transporti', price: 50, unit: 'flat', enabled: true },
    { id: 'removal', name: 'Old Frame Removal', nameAl: 'Heqja e Kornizës së Vjetër', price: 25, unit: 'per unit', enabled: true },
    { id: 'sealant', name: 'Sealant & Finishing', nameAl: 'Silikoni & Përfundimi', price: 15, unit: 'per unit', enabled: true },
  ],
  accessories: [
    { id: 'handle-standard', name: 'Standard Handle', nameAl: 'Dorezë Standarde', price: 15, enabled: true },
    { id: 'handle-premium', name: 'Premium Handle', nameAl: 'Dorezë Premium', price: 35, enabled: true },
    { id: 'lock', name: 'Security Lock', nameAl: 'Bravë Sigurie', price: 45, enabled: true },
    { id: 'mosquito', name: 'Mosquito Net', nameAl: 'Rrjetë Mushkonjash', price: 30, enabled: true },
    { id: 'blinds', name: 'Built-in Blinds', nameAl: 'Grila të Integruara', price: 85, enabled: true },
    { id: 'sill', name: 'Window Sill', nameAl: 'Prag Dritareje', price: 25, enabled: true },
    { id: 'roller', name: 'Roller Shutter', nameAl: 'Roletë', price: 120, enabled: true },
    { id: 'ventilation', name: 'Ventilation System', nameAl: 'Sistem Ventilimi', price: 55, enabled: true },
  ],
};

function ensureEnabled<T extends { enabled?: boolean }>(items: T[]): T[] {
  return items.map(item => ({ ...item, enabled: item.enabled !== false }));
}

const PriceManagement: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const accent = user?.company?.accentColor || '#2563EB';
  const [prices, setPrices] = useState<PriceConfig>(defaultPrices);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'materials' | 'glass' | 'services' | 'accessories'>('materials');

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const config = await getPriceConfig(user.id);
        if (config) {
          setPrices({
            materials: ensureEnabled(config.materials || defaultPrices.materials),
            glassTypes: ensureEnabled(config.glass_types || defaultPrices.glassTypes),
            services: ensureEnabled(config.services || defaultPrices.services),
            accessories: ensureEnabled(config.accessories || defaultPrices.accessories),
          });
        }
      } catch (err) {
        console.error('Error loading prices:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await savePriceConfig(user.id, {
        materials: prices.materials,
        glass_types: prices.glassTypes,
        services: prices.services,
        accessories: prices.accessories,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving prices:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateMaterialPrice = (id: string, price: number) => {
    setPrices({ ...prices, materials: prices.materials.map(m => m.id === id ? { ...m, pricePerSqm: price } : m) });
  };
  const updateGlassPrice = (id: string, price: number) => {
    setPrices({ ...prices, glassTypes: prices.glassTypes.map(g => g.id === id ? { ...g, pricePerSqm: price } : g) });
  };
  const updateServicePrice = (id: string, price: number) => {
    setPrices({ ...prices, services: prices.services.map(s => s.id === id ? { ...s, price } : s) });
  };
  const updateAccessoryPrice = (id: string, price: number) => {
    setPrices({ ...prices, accessories: prices.accessories.map(a => a.id === id ? { ...a, price } : a) });
  };

  const toggleMaterial = (id: string) => {
    setPrices({ ...prices, materials: prices.materials.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m) });
  };
  const toggleGlass = (id: string) => {
    setPrices({ ...prices, glassTypes: prices.glassTypes.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g) });
  };
  const toggleService = (id: string) => {
    setPrices({ ...prices, services: prices.services.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s) });
  };
  const toggleAccessory = (id: string) => {
    setPrices({ ...prices, accessories: prices.accessories.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a) });
  };

  const sections = [
    { id: 'materials' as const, label: lang === 'en' ? 'Materials' : 'Materialet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { id: 'glass' as const, label: lang === 'en' ? 'Glass Types' : 'Llojet e Xhamit', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { id: 'services' as const, label: lang === 'en' ? 'Services' : 'Shërbimet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'accessories' as const, label: lang === 'en' ? 'Accessories' : 'Aksesorët', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  const renderPriceList = (items: any[], updateFn: (id: string, price: number) => void, toggleFn: (id: string) => void, priceKey: string, unitLabel?: string) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-500">
          {lang === 'en'
            ? 'Toggle the eye icon to show/hide items in the calculator. Hidden items are not deleted.'
            : 'Klikoni ikonën e syrit për të shfaqur/fshehur artikujt në kalkulator. Artikujt e fshehur nuk fshihen përgjithmonë.'}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => {
          const isEnabled = item.enabled !== false;
          return (
            <div key={item.id} className={`px-6 py-4 flex items-center justify-between transition-all ${!isEnabled ? 'opacity-50 bg-gray-50' : ''}`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleFn(item.id)}
                  className={`p-1.5 rounded-lg transition-all ${isEnabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={isEnabled ? (lang === 'en' ? 'Visible in calculator' : 'E dukshme në kalkulator') : (lang === 'en' ? 'Hidden from calculator' : 'E fshehur nga kalkulatori')}
                >
                  {isEnabled ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                  )}
                </button>
                <div>
                  <p className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{lang === 'en' ? item.name : item.nameAl}</p>
                  {item.unit && <p className="text-sm text-gray-500">{item.unit === 'flat' ? (lang === 'en' ? 'Flat rate' : 'Çmim fiks') : (lang === 'en' ? 'Per unit' : 'Për njësi')}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">€</span>
                <input type="number" value={item[priceKey]} onChange={(e) => updateFn(item.id, parseFloat(e.target.value) || 0)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" step="0.01" />
                {unitLabel && <span className="text-sm text-gray-500">{unitLabel}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {lang === 'en' ? 'Prices saved successfully!' : 'Çmimet u ruajtën me sukses!'}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === s.id ? 'text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`} style={activeSection === s.id ? { backgroundColor: accent } : {}}>
            {s.icon}{s.label}
          </button>
        ))}
      </div>

      {activeSection === 'materials' && renderPriceList(prices.materials, updateMaterialPrice, toggleMaterial, 'pricePerSqm', '/m²')}
      {activeSection === 'glass' && renderPriceList(prices.glassTypes, updateGlassPrice, toggleGlass, 'pricePerSqm', '/m²')}
      {activeSection === 'services' && renderPriceList(prices.services, updateServicePrice, toggleService, 'price')}
      {activeSection === 'accessories' && renderPriceList(prices.accessories, updateAccessoryPrice, toggleAccessory, 'price')}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: accent }}>
          {saving ? (lang === 'en' ? 'Saving...' : 'Duke ruajtur...') : (lang === 'en' ? 'Save Prices' : 'Ruaj Çmimet')}
        </button>
      </div>
    </div>
  );
};

export default PriceManagement;
