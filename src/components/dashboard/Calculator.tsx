import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { defaultPrices, PriceConfig } from './PriceManagement';
import { getPriceConfig } from '../../lib/database';

export interface CalcItem {
  id: string;
  productType: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  glassType: string;
  services: string[];
  accessories: string[];
  area: number;
  materialCost: number;
  glassCost: number;
  serviceCost: number;
  accessoryCost: number;
  subtotal: number;
}

interface CalculatorProps {
  onAddToQuote?: (items: CalcItem[]) => void;
}

const PRODUCT_IMAGES: Record<string, string> = {
  window: 'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216314257_917318b2.jpg',
  door: 'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216403586_e030393c.jpg',
  slidingDoor: 'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216372879_71402444.png',
};

const Calculator: React.FC<CalculatorProps> = ({ onAddToQuote }) => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const accent = user?.company?.accentColor || '#2563EB';
  const [prices, setPrices] = useState<PriceConfig>(defaultPrices);

  useEffect(() => {
    if (!user) return;
    const loadPrices = async () => {
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
      } catch { /* use defaults */ }
    };
    loadPrices();
  }, [user]);


  const [productType, setProductType] = useState('window');
  const [width, setWidth] = useState(1.2);
  const [height, setHeight] = useState(1.4);
  const [quantity, setQuantity] = useState(1);
  const [material, setMaterial] = useState('pvc');
  const [glassType, setGlassType] = useState('double');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [items, setItems] = useState<CalcItem[]>([]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleAccessory = (id: string) => {
    setSelectedAccessories(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const calculation = useMemo(() => {
    const area = width * height;
    const totalArea = area * quantity;
    const mat = prices.materials.find(m => m.id === material);
    const glass = prices.glassTypes.find(g => g.id === glassType);
    const materialCost = totalArea * (mat?.pricePerSqm || 0);
    const glassCost = totalArea * (glass?.pricePerSqm || 0);
    
    let serviceCost = 0;
    selectedServices.forEach(sid => {
      const svc = prices.services.find(s => s.id === sid);
      if (svc) {
        serviceCost += svc.unit === 'flat' ? svc.price : svc.price * quantity;
      }
    });

    let accessoryCost = 0;
    selectedAccessories.forEach(aid => {
      const acc = prices.accessories.find(a => a.id === aid);
      if (acc) accessoryCost += acc.price * quantity;
    });

    const subtotal = materialCost + glassCost + serviceCost + accessoryCost;
    const vat = subtotal * 0.2;
    const total = subtotal + vat;

    return { area, totalArea, materialCost, glassCost, serviceCost, accessoryCost, subtotal, vat, total };
  }, [width, height, quantity, material, glassType, selectedServices, selectedAccessories, prices]);

  const addItem = () => {
    const newItem: CalcItem = {
      id: `item-${Date.now()}`,
      productType, width, height, quantity, material, glassType,
      services: selectedServices, accessories: selectedAccessories,
      area: calculation.totalArea,
      materialCost: calculation.materialCost,
      glassCost: calculation.glassCost,
      serviceCost: calculation.serviceCost,
      accessoryCost: calculation.accessoryCost,
      subtotal: calculation.subtotal,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const productTypes = [
    { id: 'window', label: t('calc.window'), img: PRODUCT_IMAGES.window },
    { id: 'door', label: t('calc.door'), img: PRODUCT_IMAGES.door },
    { id: 'slidingDoor', label: t('calc.slidingDoor'), img: PRODUCT_IMAGES.slidingDoor },
  ];

  const grandTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const grandVat = grandTotal * 0.2;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calculator Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Product Type */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.productType')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {productTypes.map((pt) => (
              <button
                key={pt.id}
                onClick={() => setProductType(pt.id)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  productType === pt.id ? 'shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={productType === pt.id ? { borderColor: accent } : {}}
              >
                <img src={pt.img} alt={pt.label} className="w-full aspect-square object-cover" />
                <div className={`absolute inset-0 flex items-end ${productType === pt.id ? 'bg-gradient-to-t from-black/60 to-transparent' : 'bg-gradient-to-t from-black/40 to-transparent'}`}>
                  <span className="text-white font-semibold text-sm p-3">{pt.label}</span>
                </div>
                {productType === pt.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: accent }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Dimensions & Quantity' : 'Dimensionet & Sasia'}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('calc.width')}</label>
              <input type="number" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0)} min="0.1" step="0.01" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('calc.height')}</label>
              <input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} min="0.1" step="0.01" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('calc.quantity')}</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="flex-1 text-center py-2.5 border-0 focus:ring-0 font-mono" />
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">{t('calc.totalArea')}: <span className="font-bold text-gray-900">{(width * height * quantity).toFixed(2)} m²</span></span>
          </div>
        </div>

        {/* Material */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.material')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {prices.materials.map((m) => (
              <button
                key={m.id}
                onClick={() => setMaterial(m.id)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  material === m.id ? 'text-white shadow-md' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                style={material === m.id ? { backgroundColor: accent, borderColor: accent } : {}}
              >
                <p className="font-semibold text-sm">{lang === 'en' ? m.name : m.nameAl}</p>
                <p className={`text-xs mt-1 ${material === m.id ? 'text-white/80' : 'text-gray-500'}`}>€{m.pricePerSqm}/m²</p>
              </button>
            ))}
          </div>
        </div>

        {/* Glass */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.glassType')}</h3>
          <div className="space-y-3">
            {prices.glassTypes.map((g) => (
              <button
                key={g.id}
                onClick={() => setGlassType(g.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  glassType === g.id ? 'text-white' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                style={glassType === g.id ? { backgroundColor: accent, borderColor: accent } : {}}
              >
                <span className="font-medium text-sm">{lang === 'en' ? g.name : g.nameAl}</span>
                <span className={`text-sm ${glassType === g.id ? 'text-white/80' : 'text-gray-500'}`}>€{g.pricePerSqm}/m²</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.services')}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {prices.services.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  selectedServices.includes(s.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedServices.includes(s.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {selectedServices.includes(s.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{lang === 'en' ? s.name : s.nameAl}</span>
                </div>
                <span className="text-sm text-gray-500">€{s.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Accessories' : 'Aksesorët'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {prices.accessories.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAccessory(a.id)}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                  selectedAccessories.includes(a.id) ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedAccessories.includes(a.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {selectedAccessories.includes(a.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{lang === 'en' ? a.name : a.nameAl}</span>
                </div>
                <span className="text-sm text-gray-500">€{a.price}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Summary Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
          <h3 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Price Breakdown' : 'Zbërthimi i Çmimit'}</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('calc.totalArea')}</span>
              <span className="font-mono font-semibold">{calculation.totalArea.toFixed(2)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('calc.materialCost')}</span>
              <span className="font-mono font-semibold">€{calculation.materialCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('calc.glassCost')}</span>
              <span className="font-mono font-semibold">€{calculation.glassCost.toFixed(2)}</span>
            </div>
            {calculation.serviceCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('calc.serviceCost')}</span>
                <span className="font-mono font-semibold">€{calculation.serviceCost.toFixed(2)}</span>
              </div>
            )}
            {calculation.accessoryCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{lang === 'en' ? 'Accessories' : 'Aksesorët'}</span>
                <span className="font-mono font-semibold">€{calculation.accessoryCost.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-gray-600">{t('calc.subtotal')}</span>
              <span className="font-mono font-bold">€{calculation.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('calc.vat')}</span>
              <span className="font-mono font-semibold">€{calculation.vat.toFixed(2)}</span>
            </div>
            <div className="border-t-2 pt-3 flex justify-between" style={{ borderColor: accent }}>
              <span className="font-bold text-gray-900 text-base">{t('calc.total')}</span>
              <span className="font-mono font-extrabold text-lg" style={{ color: accent }}>€{calculation.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={addItem}
            className="w-full mt-6 py-3 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: accent }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {lang === 'en' ? 'Add to List' : 'Shto në Listë'}
          </button>
        </div>

        {/* Items list */}
        {items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Added Items' : 'Artikujt e Shtuar'} ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const matName = prices.materials.find(m => m.id === item.material);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{idx + 1} {item.productType === 'window' ? t('calc.window') : item.productType === 'door' ? t('calc.door') : t('calc.slidingDoor')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.width}x{item.height}m | {lang === 'en' ? matName?.name : matName?.nameAl} | x{item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">€{item.subtotal.toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('calc.subtotal')}</span>
                <span className="font-bold">€{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">{t('calc.vat')}</span>
                <span className="font-bold">€{grandVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t" style={{ borderColor: accent }}>
                <span className="font-bold">{t('calc.total')}</span>
                <span className="font-extrabold text-lg" style={{ color: accent }}>€{(grandTotal + grandVat).toFixed(2)}</span>
              </div>
            </div>
            {onAddToQuote && (
              <button
                onClick={() => onAddToQuote(items)}
                className="w-full mt-4 py-3 border-2 rounded-xl font-semibold transition-all hover:shadow-md"
                style={{ borderColor: accent, color: accent }}
              >
                {t('calc.addToQuote')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
