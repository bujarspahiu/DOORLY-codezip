import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getPriceConfig, savePriceConfig } from '../../lib/database';

export interface PriceConfig {
  materials: { id: string; name: string; nameAl: string; pricePerSqm: number }[];
  glassTypes: { id: string; name: string; nameAl: string; pricePerSqm: number }[];
  services: { id: string; name: string; nameAl: string; price: number; unit: string }[];
  accessories: { id: string; name: string; nameAl: string; price: number }[];
}

export const defaultPrices: PriceConfig = {
  materials: [
    { id: 'pvc', name: 'PVC', nameAl: 'PVC', pricePerSqm: 120 },
    { id: 'aluminum', name: 'Aluminum', nameAl: 'Alumin', pricePerSqm: 180 },
    { id: 'wood', name: 'Wood', nameAl: 'Dru', pricePerSqm: 220 },
    { id: 'steel', name: 'Steel', nameAl: 'Çelik', pricePerSqm: 280 },
  ],
  glassTypes: [
    { id: 'single', name: 'Single Glass (4mm)', nameAl: 'Xham i Thjeshtë (4mm)', pricePerSqm: 25 },
    { id: 'double', name: 'Double Glass (4-16-4)', nameAl: 'Xham Dyfish (4-16-4)', pricePerSqm: 55 },
    { id: 'triple', name: 'Triple Glass (4-12-4-12-4)', nameAl: 'Xham Trefish (4-12-4-12-4)', pricePerSqm: 95 },
  ],
  services: [
    { id: 'installation', name: 'Installation', nameAl: 'Instalimi', price: 35, unit: 'per unit' },
    { id: 'transport', name: 'Transport', nameAl: 'Transporti', price: 50, unit: 'flat' },
    { id: 'removal', name: 'Old Frame Removal', nameAl: 'Heqja e Kornizës së Vjetër', price: 25, unit: 'per unit' },
    { id: 'sealant', name: 'Sealant & Finishing', nameAl: 'Silikoni & Përfundimi', price: 15, unit: 'per unit' },
  ],
  accessories: [
    { id: 'handle-standard', name: 'Standard Handle', nameAl: 'Dorezë Standarde', price: 15 },
    { id: 'handle-premium', name: 'Premium Handle', nameAl: 'Dorezë Premium', price: 35 },
    { id: 'lock', name: 'Security Lock', nameAl: 'Bravë Sigurie', price: 45 },
    { id: 'mosquito', name: 'Mosquito Net', nameAl: 'Rrjetë Mushkonjash', price: 30 },
    { id: 'blinds', name: 'Built-in Blinds', nameAl: 'Grila të Integruara', price: 85 },
    { id: 'sill', name: 'Window Sill', nameAl: 'Prag Dritareje', price: 25 },
    { id: 'roller', name: 'Roller Shutter', nameAl: 'Roletë', price: 120 },
    { id: 'ventilation', name: 'Ventilation System', nameAl: 'Sistem Ventilimi', price: 55 },
  ],
};

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
            materials: config.materials || defaultPrices.materials,
            glassTypes: config.glass_types || defaultPrices.glassTypes,
            services: config.services || defaultPrices.services,
            accessories: config.accessories || defaultPrices.accessories,
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

  const sections = [
    { id: 'materials' as const, label: lang === 'en' ? 'Materials' : 'Materialet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
    { id: 'glass' as const, label: lang === 'en' ? 'Glass Types' : 'Llojet e Xhamit', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { id: 'services' as const, label: lang === 'en' ? 'Services' : 'Shërbimet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { id: 'accessories' as const, label: lang === 'en' ? 'Accessories' : 'Aksesorët', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  const renderPriceList = (items: any[], updateFn: (id: string, price: number) => void, priceKey: string, unitLabel?: string) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{lang === 'en' ? item.name : item.nameAl}</p>
              {item.unit && <p className="text-sm text-gray-500">{item.unit === 'flat' ? (lang === 'en' ? 'Flat rate' : 'Çmim fiks') : (lang === 'en' ? 'Per unit' : 'Për njësi')}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">€</span>
              <input type="number" value={item[priceKey]} onChange={(e) => updateFn(item.id, parseFloat(e.target.value) || 0)} className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500" min="0" step="0.01" />
              {unitLabel && <span className="text-sm text-gray-500">{unitLabel}</span>}
            </div>
          </div>
        ))}
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

      {activeSection === 'materials' && renderPriceList(prices.materials, updateMaterialPrice, 'pricePerSqm', '/m²')}
      {activeSection === 'glass' && renderPriceList(prices.glassTypes, updateGlassPrice, 'pricePerSqm', '/m²')}
      {activeSection === 'services' && renderPriceList(prices.services, updateServicePrice, 'price')}
      {activeSection === 'accessories' && renderPriceList(prices.accessories, updateAccessoryPrice, 'price')}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50" style={{ backgroundColor: accent }}>
          {saving ? (lang === 'en' ? 'Saving...' : 'Duke ruajtur...') : (lang === 'en' ? 'Save Prices' : 'Ruaj Çmimet')}
        </button>
      </div>
    </div>
  );
};

export default PriceManagement;
