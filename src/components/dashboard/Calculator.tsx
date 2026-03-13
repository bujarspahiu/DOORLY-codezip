import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { defaultPrices, PriceConfig } from './PriceManagement';
import { getPriceConfig } from '../../lib/database';

export interface CalcItemService {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export interface CalcItemAccessory {
  id: string;
  name: string;
  price: number;
}

export interface CalcItem {
  id: string;
  productType: string;
  templateId: string;
  width: number;
  height: number;
  quantity: number;
  material: string;
  materialName: string;
  glassType: string;
  glassName: string;
  services: string[];
  serviceDetails: CalcItemService[];
  accessories: string[];
  accessoryDetails: CalcItemAccessory[];
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

interface TemplateItem {
  id: string;
  row: number;
  col: number;
  label: string;
  labelAl: string;
}

const WINDOW_TEMPLATES: TemplateItem[] = [
  { id: 'w1', row: 0, col: 0, label: 'Single Tilt', labelAl: 'Njëshe Tilt' },
  { id: 'w2', row: 0, col: 1, label: 'Single Turn', labelAl: 'Njëshe Turn' },
  { id: 'w3', row: 0, col: 2, label: 'Single Tilt-Turn', labelAl: 'Njëshe Tilt-Turn' },
  { id: 'w4', row: 0, col: 3, label: 'Double Fixed-Turn', labelAl: 'Dyshe Fiks-Turn' },
  { id: 'w5', row: 0, col: 4, label: 'Double Tilt-Turn', labelAl: 'Dyshe Tilt-Turn' },
  { id: 'w6', row: 0, col: 5, label: 'Double Turn-Turn', labelAl: 'Dyshe Turn-Turn' },
  { id: 'w7', row: 0, col: 6, label: 'Triple Fixed', labelAl: 'Treshe Fiks' },
  { id: 'w8', row: 0, col: 7, label: 'Triple Turn', labelAl: 'Treshe Turn' },
  { id: 'w9', row: 1, col: 0, label: 'Double Casement L', labelAl: 'Dyshe Casement M' },
  { id: 'w10', row: 1, col: 1, label: 'Double Casement R', labelAl: 'Dyshe Casement Dj' },
  { id: 'w11', row: 1, col: 2, label: 'Double Tilt-Turn L', labelAl: 'Dyshe Tilt-Turn M' },
  { id: 'w12', row: 1, col: 3, label: 'Double Tilt-Turn R', labelAl: 'Dyshe Tilt-Turn Dj' },
  { id: 'w13', row: 1, col: 4, label: 'Double Fixed-Tilt', labelAl: 'Dyshe Fiks-Tilt' },
  { id: 'w14', row: 1, col: 5, label: 'Double Fixed-Fixed', labelAl: 'Dyshe Fiks-Fiks' },
  { id: 'w15', row: 1, col: 6, label: 'Triple Casement', labelAl: 'Treshe Casement' },
  { id: 'w16', row: 1, col: 7, label: 'Triple Mixed', labelAl: 'Treshe Mikse' },
  { id: 'w17', row: 2, col: 0, label: 'Single Pivot', labelAl: 'Njëshe Pivot' },
  { id: 'w18', row: 2, col: 1, label: 'Double Pivot', labelAl: 'Dyshe Pivot' },
  { id: 'w19', row: 2, col: 2, label: 'Double Tilt-Fixed', labelAl: 'Dyshe Tilt-Fiks' },
  { id: 'w20', row: 2, col: 3, label: 'Double Turn-Fixed', labelAl: 'Dyshe Turn-Fiks' },
  { id: 'w21', row: 2, col: 4, label: 'Double Turn-Turn', labelAl: 'Dyshe Turn-Turn' },
  { id: 'w22', row: 2, col: 5, label: 'Triple Turn-Fixed', labelAl: 'Treshe Turn-Fiks' },
  { id: 'w23', row: 2, col: 6, label: 'Triple Turn-Turn', labelAl: 'Treshe Turn-Turn' },
  { id: 'w24', row: 2, col: 7, label: 'Triple Tilt-Turn', labelAl: 'Treshe Tilt-Turn' },
  { id: 'w25', row: 3, col: 0, label: 'Double Side-Hung', labelAl: 'Dyshe Anësore' },
  { id: 'w26', row: 3, col: 1, label: 'Double Centre', labelAl: 'Dyshe Qendrore' },
  { id: 'w27', row: 3, col: 2, label: 'Double Opposed', labelAl: 'Dyshe Kundërta' },
  { id: 'w28', row: 3, col: 3, label: 'Triple Centre', labelAl: 'Treshe Qendrore' },
  { id: 'w29', row: 3, col: 4, label: 'Triple Side', labelAl: 'Treshe Anësore' },
  { id: 'w30', row: 3, col: 5, label: 'Triple Opposed', labelAl: 'Treshe Kundërta' },
  { id: 'w31', row: 3, col: 6, label: 'Quad Centre', labelAl: 'Katërshe Qendrore' },
  { id: 'w32', row: 3, col: 7, label: 'Quad Side', labelAl: 'Katërshe Anësore' },
  { id: 'w33', row: 4, col: 0, label: 'Vent-Fixed', labelAl: 'Ventilim-Fiks' },
  { id: 'w34', row: 4, col: 1, label: 'Vent-Turn', labelAl: 'Ventilim-Turn' },
  { id: 'w35', row: 4, col: 2, label: 'Vent-Tilt', labelAl: 'Ventilim-Tilt' },
  { id: 'w36', row: 4, col: 3, label: 'Double Vent', labelAl: 'Dyshe Ventilim' },
  { id: 'w37', row: 4, col: 4, label: 'Double Vent-Turn', labelAl: 'Dyshe Ventilim-Turn' },
  { id: 'w38', row: 4, col: 5, label: 'Triple Vent', labelAl: 'Treshe Ventilim' },
  { id: 'w39', row: 4, col: 6, label: 'Quad Vent', labelAl: 'Katërshe Ventilim' },
  { id: 'w40', row: 4, col: 7, label: 'Quad Mixed', labelAl: 'Katërshe Mikse' },
  { id: 'w41', row: 5, col: 0, label: 'French Window', labelAl: 'Dritare Frënge' },
  { id: 'w42', row: 5, col: 1, label: 'French Double', labelAl: 'Dyshe Frënge' },
  { id: 'w43', row: 5, col: 2, label: 'French Tilt', labelAl: 'Frënge Tilt' },
  { id: 'w44', row: 5, col: 3, label: 'French Triple', labelAl: 'Treshe Frënge' },
  { id: 'w45', row: 5, col: 4, label: 'Bay Window', labelAl: 'Dritare Bay' },
  { id: 'w46', row: 5, col: 5, label: 'Corner Window', labelAl: 'Dritare Qoshe' },
  { id: 'w47', row: 5, col: 6, label: 'Arched Window', labelAl: 'Dritare Harku' },
  { id: 'w48', row: 5, col: 7, label: 'Custom Shape', labelAl: 'Formë Speciale' },
];

const DOOR_TEMPLATES: TemplateItem[] = [
  { id: 'd1', row: 0, col: 0, label: 'Single Left', labelAl: 'Njëshe Majtas' },
  { id: 'd2', row: 0, col: 1, label: 'Single Right', labelAl: 'Njëshe Djathtas' },
  { id: 'd3', row: 0, col: 2, label: 'Single Tilt-Turn', labelAl: 'Njëshe Tilt-Turn' },
  { id: 'd4', row: 0, col: 3, label: 'Single Fixed Top', labelAl: 'Njëshe Fiks Lart' },
  { id: 'd5', row: 0, col: 4, label: 'Single Turn Top', labelAl: 'Njëshe Turn Lart' },
  { id: 'd6', row: 0, col: 5, label: 'Single Pivot', labelAl: 'Njëshe Pivot' },
  { id: 'd7', row: 0, col: 6, label: 'Single Fanlight', labelAl: 'Njëshe Dritëz' },
  { id: 'd8', row: 0, col: 7, label: 'Single Panel', labelAl: 'Njëshe Panel' },
  { id: 'd9', row: 1, col: 0, label: 'Double Casement', labelAl: 'Dyshe Casement' },
  { id: 'd10', row: 1, col: 1, label: 'Double Turn', labelAl: 'Dyshe Turn' },
  { id: 'd11', row: 1, col: 2, label: 'Double Tilt', labelAl: 'Dyshe Tilt' },
  { id: 'd12', row: 1, col: 3, label: 'Double Fixed', labelAl: 'Dyshe Fiks' },
  { id: 'd13', row: 1, col: 4, label: 'Double Panel', labelAl: 'Dyshe Panel' },
  { id: 'd14', row: 1, col: 5, label: 'Double Turn-Fixed', labelAl: 'Dyshe Turn-Fiks' },
  { id: 'd15', row: 1, col: 6, label: 'Double Opposed', labelAl: 'Dyshe Kundërta' },
  { id: 'd16', row: 1, col: 7, label: 'Double Mixed', labelAl: 'Dyshe Mikse' },
  { id: 'd17', row: 2, col: 0, label: 'Door + Side L', labelAl: 'Derë + Anë M' },
  { id: 'd18', row: 2, col: 1, label: 'Door + Side R', labelAl: 'Derë + Anë Dj' },
  { id: 'd19', row: 2, col: 2, label: 'Door + Sides', labelAl: 'Derë + Anë Dyfish' },
  { id: 'd20', row: 2, col: 3, label: 'French Door', labelAl: 'Derë Frënge' },
  { id: 'd21', row: 2, col: 4, label: 'French + Sides', labelAl: 'Frënge + Anë' },
  { id: 'd22', row: 2, col: 5, label: 'Arched Door', labelAl: 'Derë Harku' },
  { id: 'd23', row: 2, col: 6, label: 'Full Glass', labelAl: 'Xham i Plotë' },
  { id: 'd24', row: 2, col: 7, label: 'Half Panel', labelAl: 'Gjysmë Panel' },
  { id: 'd25', row: 3, col: 0, label: 'Triple Door', labelAl: 'Treshe Derë' },
  { id: 'd26', row: 3, col: 1, label: 'Triple Mixed', labelAl: 'Treshe Mikse' },
  { id: 'd27', row: 3, col: 2, label: 'Triple Panel', labelAl: 'Treshe Panel' },
  { id: 'd28', row: 3, col: 3, label: 'Entrance Door', labelAl: 'Derë Hyrëse' },
  { id: 'd29', row: 3, col: 4, label: 'Georgian', labelAl: 'Georgian' },
  { id: 'd30', row: 3, col: 5, label: 'Classic Door', labelAl: 'Derë Klasike' },
  { id: 'd31', row: 3, col: 6, label: 'Modern Door', labelAl: 'Derë Moderne' },
  { id: 'd32', row: 3, col: 7, label: 'Security Door', labelAl: 'Derë Sigurie' },
  { id: 'd33', row: 4, col: 0, label: 'Quad Door L', labelAl: 'Katërshe M' },
  { id: 'd34', row: 4, col: 1, label: 'Quad Door R', labelAl: 'Katërshe Dj' },
  { id: 'd35', row: 4, col: 2, label: 'Quad Mixed', labelAl: 'Katërshe Mikse' },
  { id: 'd36', row: 4, col: 3, label: 'Quad Panel', labelAl: 'Katërshe Panel' },
  { id: 'd37', row: 4, col: 4, label: 'Wide Double', labelAl: 'Dyshe e Gjerë' },
  { id: 'd38', row: 4, col: 5, label: 'Wide Triple', labelAl: 'Treshe e Gjerë' },
];

const SLIDING_DOOR_TEMPLATES: TemplateItem[] = [
  { id: 's1', row: 0, col: 0, label: 'Double Slide L', labelAl: 'Dyshe Rrëshqitëse M' },
  { id: 's2', row: 0, col: 1, label: 'Double Slide R', labelAl: 'Dyshe Rrëshqitëse Dj' },
  { id: 's3', row: 0, col: 2, label: 'Double Slide Both', labelAl: 'Dyshe Rrëshqitëse Dyfish' },
  { id: 's4', row: 1, col: 0, label: 'Triple Slide L', labelAl: 'Treshe Rrëshqitëse M' },
  { id: 's5', row: 1, col: 1, label: 'Triple Slide C', labelAl: 'Treshe Rrëshqitëse Q' },
  { id: 's6', row: 1, col: 2, label: 'Triple Slide R', labelAl: 'Treshe Rrëshqitëse Dj' },
  { id: 's7', row: 2, col: 0, label: 'Quad Slide L', labelAl: 'Katërshe Rrëshqitëse M' },
  { id: 's8', row: 2, col: 1, label: 'Quad Slide C', labelAl: 'Katërshe Rrëshqitëse Q' },
  { id: 's9', row: 2, col: 2, label: 'Quad Slide R', labelAl: 'Katërshe Rrëshqitëse Dj' },
  { id: 's10', row: 3, col: 0, label: 'Wide Slide L', labelAl: 'Gjerë Rrëshqitëse M' },
  { id: 's11', row: 3, col: 1, label: 'Wide Slide C', labelAl: 'Gjerë Rrëshqitëse Q' },
  { id: 's12', row: 3, col: 2, label: 'Wide Slide R', labelAl: 'Gjerë Rrëshqitëse Dj' },
  { id: 's13', row: 4, col: 0, label: 'Panoramic L', labelAl: 'Panoramike M' },
  { id: 's14', row: 4, col: 1, label: 'Panoramic C', labelAl: 'Panoramike Q' },
  { id: 's15', row: 4, col: 2, label: 'Panoramic R', labelAl: 'Panoramike Dj' },
];

const TEMPLATE_SHEETS: Record<string, { src: string; cols: number; rows: number; templates: TemplateItem[] }> = {
  window: { src: '/templates/windows.png', cols: 8, rows: 6, templates: WINDOW_TEMPLATES },
  door: { src: '/templates/doors.png', cols: 8, rows: 5, templates: DOOR_TEMPLATES },
  slidingDoor: { src: '/templates/sliding-doors.png', cols: 3, rows: 5, templates: SLIDING_DOOR_TEMPLATES },
};

const MATERIAL_SUBCATEGORIES: Record<string, { id: string; name: string; nameAl: string }[]> = {
  pvc: [
    { id: 'pvc-white', name: 'White PVC', nameAl: 'PVC Bardhë' },
    { id: 'pvc-cream', name: 'Cream PVC', nameAl: 'PVC Krem' },
    { id: 'pvc-grey', name: 'Grey PVC', nameAl: 'PVC Gri' },
    { id: 'pvc-anthracite', name: 'Anthracite PVC', nameAl: 'PVC Antracit' },
    { id: 'pvc-golden-oak', name: 'Golden Oak PVC', nameAl: 'PVC Lis i Artë' },
    { id: 'pvc-walnut', name: 'Walnut PVC', nameAl: 'PVC Arrë' },
  ],
  aluminum: [
    { id: 'alu-natural', name: 'Natural Aluminum', nameAl: 'Alumin Natyral' },
    { id: 'alu-white', name: 'White Aluminum', nameAl: 'Alumin Bardhë' },
    { id: 'alu-black', name: 'Black Aluminum', nameAl: 'Alumin Zi' },
    { id: 'alu-bronze', name: 'Bronze Aluminum', nameAl: 'Alumin Bronzi' },
    { id: 'alu-grey', name: 'Grey Aluminum', nameAl: 'Alumin Gri' },
  ],
  wood: [
    { id: 'wood-pine', name: 'Pine Wood', nameAl: 'Dru Pisha' },
    { id: 'wood-oak', name: 'Oak Wood', nameAl: 'Dru Lisi' },
    { id: 'wood-meranti', name: 'Meranti Wood', nameAl: 'Dru Meranti' },
    { id: 'wood-larch', name: 'Larch Wood', nameAl: 'Dru Larice' },
  ],
  steel: [
    { id: 'steel-galvanized', name: 'Galvanized Steel', nameAl: 'Çelik Galvanizuar' },
    { id: 'steel-painted', name: 'Painted Steel', nameAl: 'Çelik i Lyer' },
    { id: 'steel-stainless', name: 'Stainless Steel', nameAl: 'Çelik Inoks' },
  ],
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
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showGallery, setShowGallery] = useState(false);
  const [width, setWidth] = useState(1.2);
  const [height, setHeight] = useState(1.4);
  const [quantity, setQuantity] = useState(1);
  const [material, setMaterial] = useState('pvc');
  const [materialSub, setMaterialSub] = useState('pvc-white');
  const [expandedMaterial, setExpandedMaterial] = useState<string>('pvc');
  const [glassType, setGlassType] = useState('double');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [accessoryQty, setAccessoryQty] = useState<Record<string, number>>({});
  const [serviceQty, setServiceQty] = useState<Record<string, number>>({});
  const [items, setItems] = useState<CalcItem[]>([]);

  const handleProductTypeChange = (type: string) => {
    setProductType(type);
    setSelectedTemplate('');
    setShowGallery(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setShowGallery(false);
  };

  const addService = (id: string) => {
    if (!selectedServices.includes(id)) {
      setSelectedServices([...selectedServices, id]);
      setServiceQty({ ...serviceQty, [id]: 1 });
    } else {
      setServiceQty({ ...serviceQty, [id]: (serviceQty[id] || 1) + 1 });
    }
  };

  const removeService = (id: string) => {
    const currentQty = serviceQty[id] || 1;
    if (currentQty <= 1) {
      setSelectedServices(selectedServices.filter(s => s !== id));
      const newQty = { ...serviceQty };
      delete newQty[id];
      setServiceQty(newQty);
    } else {
      setServiceQty({ ...serviceQty, [id]: currentQty - 1 });
    }
  };

  const addAccessory = (id: string) => {
    if (!selectedAccessories.includes(id)) {
      setSelectedAccessories([...selectedAccessories, id]);
      setAccessoryQty({ ...accessoryQty, [id]: 1 });
    } else {
      setAccessoryQty({ ...accessoryQty, [id]: (accessoryQty[id] || 1) + 1 });
    }
  };

  const removeAccessory = (id: string) => {
    const currentQty = accessoryQty[id] || 1;
    if (currentQty <= 1) {
      setSelectedAccessories(selectedAccessories.filter(a => a !== id));
      const newQty = { ...accessoryQty };
      delete newQty[id];
      setAccessoryQty(newQty);
    } else {
      setAccessoryQty({ ...accessoryQty, [id]: currentQty - 1 });
    }
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
        const qty = serviceQty[sid] || 1;
        serviceCost += svc.unit === 'flat' ? svc.price * qty : svc.price * quantity * qty;
      }
    });

    let accessoryCost = 0;
    selectedAccessories.forEach(aid => {
      const acc = prices.accessories.find(a => a.id === aid);
      if (acc) {
        const qty = accessoryQty[aid] || 1;
        accessoryCost += acc.price * quantity * qty;
      }
    });

    const subtotal = materialCost + glassCost + serviceCost + accessoryCost;
    const vat = subtotal * 0.18;
    const total = subtotal + vat;

    return { area, totalArea, materialCost, glassCost, serviceCost, accessoryCost, subtotal, vat, total };
  }, [width, height, quantity, material, glassType, selectedServices, selectedAccessories, prices, serviceQty, accessoryQty]);

  const addItem = () => {
    if (!selectedTemplate) {
      setShowGallery(true);
      return;
    }
    const mat = prices.materials.find(m => m.id === material);
    const glass = prices.glassTypes.find(g => g.id === glassType);
    const svcDetails: CalcItemService[] = selectedServices.map(sid => {
      const s = prices.services.find(sv => sv.id === sid);
      return s ? { id: s.id, name: s.name + (serviceQty[sid] > 1 ? ` x${serviceQty[sid]}` : ''), price: s.price, unit: s.unit } : null;
    }).filter(Boolean) as CalcItemService[];
    const accDetails: CalcItemAccessory[] = selectedAccessories.map(aid => {
      const a = prices.accessories.find(ac => ac.id === aid);
      return a ? { id: a.id, name: a.name + (accessoryQty[aid] > 1 ? ` x${accessoryQty[aid]}` : ''), price: a.price } : null;
    }).filter(Boolean) as CalcItemAccessory[];

    const subName = materialSub ? (MATERIAL_SUBCATEGORIES[material]?.find(s => s.id === materialSub)?.[lang === 'en' ? 'name' : 'nameAl'] || '') : '';

    const newItem: CalcItem = {
      id: `item-${Date.now()}`,
      productType,
      templateId: selectedTemplate,
      width, height, quantity, material,
      materialName: (mat ? (lang === 'en' ? mat.name : mat.nameAl) : material) + (subName ? ` - ${subName}` : ''),
      glassType,
      glassName: glass ? (lang === 'en' ? glass.name : glass.nameAl) : glassType,
      services: selectedServices,
      serviceDetails: svcDetails,
      accessories: selectedAccessories,
      accessoryDetails: accDetails,
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
    { id: 'window', label: t('calc.window'), img: '/products/window.png' },
    { id: 'door', label: t('calc.door'), img: '/products/door.png' },
    { id: 'slidingDoor', label: t('calc.slidingDoor'), img: '/products/sliding-door.png' },
  ];

  const currentSheet = TEMPLATE_SHEETS[productType];
  const selectedTemplateData = currentSheet?.templates.find(t => t.id === selectedTemplate);

  const grandTotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const grandVat = grandTotal * 0.18;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {lang === 'en' ? 'Select Template' : 'Zgjidhni Shabllonin'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {productType === 'window' ? (lang === 'en' ? 'Choose a window configuration' : 'Zgjidhni konfigurimin e dritares') :
                   productType === 'door' ? (lang === 'en' ? 'Choose a door configuration' : 'Zgjidhni konfigurimin e derës') :
                   (lang === 'en' ? 'Choose a sliding door configuration' : 'Zgjidhni konfigurimin e derës rrëshqitëse')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedTemplate('custom'); setShowGallery(false); }}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {lang === 'en' ? 'Custom / No Template' : 'Pa Shablon'}
                </button>
                <button onClick={() => setShowGallery(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(currentSheet.cols, 8)}, 1fr)` }}>
                {currentSheet.templates.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleTemplateSelect(tmpl.id)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all hover:shadow-md group ${
                      selectedTemplate === tmpl.id ? 'shadow-lg' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={selectedTemplate === tmpl.id ? { borderColor: accent, boxShadow: `0 0 0 2px ${accent}` } : {}}
                  >
                    <div
                      className="w-full aspect-square bg-no-repeat"
                      style={{
                        backgroundImage: `url(${currentSheet.src})`,
                        backgroundSize: `${currentSheet.cols * 100}% ${currentSheet.rows * 100}%`,
                        backgroundPosition: `${(tmpl.col / (currentSheet.cols - 1)) * 100}% ${(tmpl.row / (currentSheet.rows - 1)) * 100}%`,
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      <p className="text-[10px] text-white font-medium truncate">{lang === 'en' ? tmpl.label : tmpl.labelAl}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.productType')}</h3>
          <div className="grid grid-cols-3 gap-4">
            {productTypes.map((pt) => (
              <button
                key={pt.id}
                onClick={() => handleProductTypeChange(pt.id)}
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

        {selectedTemplate && selectedTemplate !== 'custom' && selectedTemplateData && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">{lang === 'en' ? 'Selected Template' : 'Shablloni i Zgjedhur'}</h3>
              <button onClick={() => setShowGallery(true)} className="text-sm font-medium hover:underline" style={{ color: accent }}>
                {lang === 'en' ? 'Change' : 'Ndrysho'}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-lg border border-gray-200 bg-no-repeat flex-shrink-0"
                style={{
                  backgroundImage: `url(${currentSheet.src})`,
                  backgroundSize: `${currentSheet.cols * 100}% ${currentSheet.rows * 100}%`,
                  backgroundPosition: `${(selectedTemplateData.col / (currentSheet.cols - 1)) * 100}% ${(selectedTemplateData.row / (currentSheet.rows - 1)) * 100}%`,
                }}
              />
              <div>
                <p className="font-semibold text-gray-900">{lang === 'en' ? selectedTemplateData.label : selectedTemplateData.labelAl}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {productType === 'window' ? t('calc.window') : productType === 'door' ? t('calc.door') : t('calc.slidingDoor')}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTemplate === 'custom' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900">{lang === 'en' ? 'Custom Configuration' : 'Konfigurim i Personalizuar'}</h3>
              <button onClick={() => setShowGallery(true)} className="text-sm font-medium hover:underline" style={{ color: accent }}>
                {lang === 'en' ? 'Use Template Instead' : 'Përdor Shablon'}
              </button>
            </div>
            <p className="text-sm text-gray-500">{lang === 'en' ? 'Configure dimensions and specifications manually' : 'Konfiguro dimensionet dhe specifikimet manualisht'}</p>
          </div>
        )}

        {!selectedTemplate && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            <p className="font-medium text-blue-800">
              {lang === 'en' ? 'Click a product type above to select a template' : 'Klikoni një lloj produkti më lart për të zgjedhur shabllonin'}
            </p>
            <button onClick={() => setShowGallery(true)} className="mt-3 px-5 py-2 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: accent }}>
              {lang === 'en' ? 'Browse Templates' : 'Shfletoni Shablonet'}
            </button>
          </div>
        )}

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

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.material')}</h3>
          <div className="space-y-2">
            {prices.materials.map((m) => {
              const isExpanded = expandedMaterial === m.id;
              const isSelected = material === m.id;
              const subs = MATERIAL_SUBCATEGORIES[m.id] || [];
              return (
                <div key={m.id} className="rounded-xl border-2 overflow-hidden transition-all" style={isSelected ? { borderColor: accent } : { borderColor: '#e5e7eb' }}>
                  <button
                    onClick={() => {
                      setMaterial(m.id);
                      setExpandedMaterial(isExpanded ? '' : m.id);
                      if (subs.length > 0 && !subs.some(s => s.id === materialSub)) {
                        setMaterialSub(subs[0].id);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-4 transition-all ${
                      isSelected ? 'text-white' : 'bg-white hover:bg-gray-50'
                    }`}
                    style={isSelected ? { backgroundColor: accent } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-sm">{lang === 'en' ? m.name : m.nameAl}</p>
                      {subs.length > 0 && (
                        <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                          ({subs.length} {lang === 'en' ? 'options' : 'opsione'})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>€{m.pricePerSqm}/m²</span>
                      {subs.length > 0 && (
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isSelected ? 'text-white/80' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  {isExpanded && subs.length > 0 && isSelected && (
                    <div className="p-3 bg-gray-50 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {subs.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setMaterialSub(sub.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            materialSub === sub.id ? 'text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                          style={materialSub === sub.id ? { backgroundColor: accent } : {}}
                        >
                          {lang === 'en' ? sub.name : sub.nameAl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{t('calc.services')}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {prices.services.map((s) => {
              const isActive = selectedServices.includes(s.id);
              const qty = serviceQty[s.id] || 0;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{lang === 'en' ? s.name : s.nameAl}</p>
                    <p className="text-xs text-gray-400">€{s.price} / {s.unit === 'flat' ? (lang === 'en' ? 'flat' : 'fiks') : (lang === 'en' ? 'per unit' : 'për copë')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => removeService(s.id)}
                      disabled={!isActive}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                        isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      -
                    </button>
                    <span className={`w-8 text-center text-sm font-bold ${isActive ? 'text-green-700' : 'text-gray-400'}`}>{qty}</span>
                    <button
                      onClick={() => addService(s.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Accessories' : 'Aksesorët'}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {prices.accessories.map((a) => {
              const isActive = selectedAccessories.includes(a.id);
              const qty = accessoryQty[a.id] || 0;
              return (
                <div
                  key={a.id}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700">{lang === 'en' ? a.name : a.nameAl}</p>
                    <p className="text-xs text-gray-400">€{a.price}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => removeAccessory(a.id)}
                      disabled={!isActive}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all ${
                        isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      -
                    </button>
                    <span className={`w-8 text-center text-sm font-bold ${isActive ? 'text-green-700' : 'text-gray-400'}`}>{qty}</span>
                    <button
                      onClick={() => addAccessory(a.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold bg-green-100 text-green-600 hover:bg-green-200 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
            {selectedServices.map(sid => {
              const svc = prices.services.find(s => s.id === sid);
              if (!svc) return null;
              const qty = serviceQty[sid] || 1;
              const cost = svc.unit === 'flat' ? svc.price * qty : svc.price * quantity * qty;
              return (
                <div key={sid} className="flex justify-between">
                  <span className="text-gray-600">{lang === 'en' ? svc.name : svc.nameAl} {qty > 1 ? `x${qty}` : ''}</span>
                  <span className="font-mono font-semibold">€{cost.toFixed(2)}</span>
                </div>
              );
            })}
            {selectedAccessories.map(aid => {
              const acc = prices.accessories.find(a => a.id === aid);
              if (!acc) return null;
              const qty = accessoryQty[aid] || 1;
              const cost = acc.price * quantity * qty;
              return (
                <div key={aid} className="flex justify-between">
                  <span className="text-gray-600">{lang === 'en' ? acc.name : acc.nameAl} {qty > 1 ? `x${qty}` : ''}</span>
                  <span className="font-mono font-semibold">€{cost.toFixed(2)}</span>
                </div>
              );
            })}
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

        {items.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">{lang === 'en' ? 'Added Items' : 'Artikujt e Shtuar'} ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{idx + 1} {item.productType === 'window' ? t('calc.window') : item.productType === 'door' ? t('calc.door') : t('calc.slidingDoor')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.width}x{item.height}m | {item.materialName} | {item.glassName} | x{item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">€{item.subtotal.toFixed(2)}</span>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                  {(item.serviceDetails.length > 0 || item.accessoryDetails.length > 0) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      {item.serviceDetails.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {item.serviceDetails.map(s => `${s.name} (€${s.price})`).join(', ')}
                        </p>
                      )}
                      {item.accessoryDetails.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {item.accessoryDetails.map(a => `${a.name} (€${a.price})`).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
