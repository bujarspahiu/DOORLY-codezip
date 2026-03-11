import React, { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'al';

interface Translations {
  [key: string]: { en: string; al: string };
}

const translations: Translations = {
  // Navbar
  'nav.home': { en: 'Home', al: 'Kryefaqja' },
  'nav.features': { en: 'Features', al: 'Veçoritë' },
  'nav.pricing': { en: 'Pricing', al: 'Çmimet' },
  'nav.about': { en: 'About', al: 'Rreth Nesh' },
  'nav.contact': { en: 'Contact', al: 'Kontakti' },
  'nav.login': { en: 'Business Login', al: 'Hyrje Biznesi' },
  
  // Hero
  'hero.title': { en: 'Professional Window & Door', al: 'Platforma Profesionale për' },
  'hero.title2': { en: 'Business Platform', al: 'Dyer & Dritare' },
  'hero.subtitle': { en: 'Calculate projects, generate professional quotes and invoices, manage customers — all with your own branding.', al: 'Llogaritni projekte, gjeneroni oferta dhe fatura profesionale, menaxhoni klientët — të gjitha me markën tuaj.' },
  'hero.cta': { en: 'Get Started Free', al: 'Filloni Falas' },
  'hero.cta2': { en: 'Watch Demo', al: 'Shikoni Demo' },
  'hero.stat1': { en: 'Business Users', al: 'Përdorues Biznesi' },
  'hero.stat2': { en: 'Quotes Generated', al: 'Oferta të Gjeneruara' },
  'hero.stat3': { en: 'Countries', al: 'Vende' },
  
  // Features
  'features.title': { en: 'Everything You Need', al: 'Gjithçka që Ju Nevojitet' },
  'features.subtitle': { en: 'Powerful tools designed specifically for window and door manufacturers', al: 'Mjete të fuqishme të dizajnuara posaçërisht për prodhuesit e dritareve dhe dyerve' },
  'features.calc.title': { en: 'Smart Calculator', al: 'Kalkulator i Zgjuar' },
  'features.calc.desc': { en: 'Calculate costs per m² for any material, glass type, and service combination instantly.', al: 'Llogaritni kostot për m² për çdo material, lloj xhami dhe kombinim shërbimi menjëherë.' },
  'features.quote.title': { en: 'Professional Quotes', al: 'Oferta Profesionale' },
  'features.quote.desc': { en: 'Generate beautiful, branded PDF quotes ready for print in A4 and A3 formats.', al: 'Gjeneroni oferta PDF të bukura me markën tuaj, gati për printim në formate A4 dhe A3.' },
  'features.invoice.title': { en: 'Invoice Management', al: 'Menaxhimi i Faturave' },
  'features.invoice.desc': { en: 'Create and track invoices with automatic VAT calculation and payment status.', al: 'Krijoni dhe ndiqni faturat me llogaritje automatike të TVSH-së dhe statusin e pagesës.' },
  'features.brand.title': { en: 'Custom Branding', al: 'Markë e Personalizuar' },
  'features.brand.desc': { en: 'Upload your logo, choose accent colors, and add stamps for professional documents.', al: 'Ngarkoni logon tuaj, zgjidhni ngjyrat dhe shtoni vula për dokumente profesionale.' },
  'features.multi.title': { en: 'Multi-Language', al: 'Shumë-Gjuhësh' },
  'features.multi.desc': { en: 'Full support for English and Albanian with easy language switching.', al: 'Mbështetje e plotë për Anglisht dhe Shqip me ndërrim të lehtë gjuhe.' },
  'features.customer.title': { en: 'Customer Database', al: 'Databaza e Klientëve' },
  'features.customer.desc': { en: 'Save and manage customer contacts for quick quote and invoice creation.', al: 'Ruani dhe menaxhoni kontaktet e klientëve për krijim të shpejtë ofertash dhe faturash.' },
  
  // How it works
  'how.title': { en: 'How It Works', al: 'Si Funksionon' },
  'how.step1.title': { en: 'Create Account', al: 'Krijoni Llogarinë' },
  'how.step1.desc': { en: 'Sign up and complete your company profile with branding details.', al: 'Regjistrohuni dhe plotësoni profilin e kompanisë me detajet e markës.' },
  'how.step2.title': { en: 'Set Your Prices', al: 'Vendosni Çmimet' },
  'how.step2.desc': { en: 'Configure material prices, glass types, and service costs.', al: 'Konfiguroni çmimet e materialeve, llojet e xhamit dhe kostot e shërbimeve.' },
  'how.step3.title': { en: 'Calculate & Quote', al: 'Llogaritni & Ofertoni' },
  'how.step3.desc': { en: 'Use the calculator to build projects and generate professional quotes.', al: 'Përdorni kalkulatorin për të ndërtuar projekte dhe gjeneruar oferta profesionale.' },
  'how.step4.title': { en: 'Send & Track', al: 'Dërgoni & Ndiqni' },
  'how.step4.desc': { en: 'Send quotes to customers and track invoice payments.', al: 'Dërgoni ofertat te klientët dhe ndiqni pagesat e faturave.' },
  
  // Pricing
  'pricing.title': { en: 'Simple, Transparent Pricing', al: 'Çmime të Thjeshta, Transparente' },
  'pricing.subtitle': { en: 'Choose the plan that fits your business', al: 'Zgjidhni planin që i përshtatet biznesit tuaj' },
  'pricing.starter': { en: 'Starter', al: 'Fillestar' },
  'pricing.professional': { en: 'Professional', al: 'Profesional' },
  'pricing.enterprise': { en: 'Enterprise', al: 'Ndërmarrje' },
  'pricing.mo': { en: '/month', al: '/muaj' },
  'pricing.cta': { en: 'Get Started', al: 'Filloni' },
  'pricing.popular': { en: 'Most Popular', al: 'Më i Popullarizuari' },
  
  // Contact
  'contact.title': { en: 'Get In Touch', al: 'Na Kontaktoni' },
  'contact.subtitle': { en: 'Have questions? We\'d love to hear from you.', al: 'Keni pyetje? Do të donim t\'ju dëgjojmë.' },
  'contact.name': { en: 'Full Name', al: 'Emri i Plotë' },
  'contact.email': { en: 'Email Address', al: 'Adresa Email' },
  'contact.message': { en: 'Message', al: 'Mesazhi' },
  'contact.send': { en: 'Send Message', al: 'Dërgo Mesazhin' },
  'contact.sent': { en: 'Message sent successfully!', al: 'Mesazhi u dërgua me sukses!' },
  
  // Footer
  'footer.desc': { en: 'The professional platform for window and door manufacturers to calculate, quote, and invoice with confidence.', al: 'Platforma profesionale për prodhuesit e dritareve dhe dyerve për të llogaritur, ofertuar dhe faturuar me besim.' },
  'footer.product': { en: 'Product', al: 'Produkti' },
  'footer.company': { en: 'Company', al: 'Kompania' },
  'footer.support': { en: 'Support', al: 'Mbështetja' },
  'footer.rights': { en: 'All rights reserved.', al: 'Të gjitha të drejtat e rezervuara.' },
  
  // Login
  'login.title': { en: 'Business Login', al: 'Hyrje Biznesi' },
  'login.email': { en: 'Username', al: 'Emri i Përdoruesit' },
  'login.password': { en: 'Password', al: 'Fjalëkalimi' },
  'login.submit': { en: 'Sign In', al: 'Hyni' },
  'login.forgot': { en: 'Forgot password?', al: 'Keni harruar fjalëkalimin?' },
  'login.register': { en: 'Don\'t have an account? Register', al: 'Nuk keni llogari? Regjistrohuni' },
  'login.error': { en: 'Invalid username or password', al: 'Emri ose fjalëkalimi i pavlefshëm' },
  
  // Dashboard
  'dash.welcome': { en: 'Welcome back', al: 'Mirë se u kthyet' },
  'dash.overview': { en: 'Dashboard', al: 'Paneli' },
  'dash.calculator': { en: 'Calculator', al: 'Kalkulatori' },
  'dash.quotes': { en: 'Quotes', al: 'Ofertat' },
  'dash.invoices': { en: 'Invoices', al: 'Faturat' },
  'dash.customers': { en: 'Customers', al: 'Klientët' },
  'dash.prices': { en: 'Price Management', al: 'Menaxhimi i Çmimeve' },
  'dash.profile': { en: 'Company Profile', al: 'Profili i Kompanisë' },
  'dash.settings': { en: 'Settings', al: 'Cilësimet' },
  'dash.logout': { en: 'Logout', al: 'Dilni' },
  'dash.totalQuotes': { en: 'Total Quotes', al: 'Gjithsej Oferta' },
  'dash.totalInvoices': { en: 'Total Invoices', al: 'Gjithsej Fatura' },
  'dash.revenue': { en: 'Revenue', al: 'Të Ardhurat' },
  'dash.customers.count': { en: 'Active Customers', al: 'Klientë Aktivë' },
  
  // Calculator
  'calc.title': { en: 'Project Calculator', al: 'Kalkulatori i Projektit' },
  'calc.productType': { en: 'Product Type', al: 'Lloji i Produktit' },
  'calc.window': { en: 'Window', al: 'Dritare' },
  'calc.door': { en: 'Door', al: 'Derë' },
  'calc.slidingDoor': { en: 'Sliding Door', al: 'Derë Rrëshqitëse' },
  'calc.width': { en: 'Width (m)', al: 'Gjerësia (m)' },
  'calc.height': { en: 'Height (m)', al: 'Lartësia (m)' },
  'calc.quantity': { en: 'Quantity', al: 'Sasia' },
  'calc.material': { en: 'Material', al: 'Materiali' },
  'calc.pvc': { en: 'PVC', al: 'PVC' },
  'calc.aluminum': { en: 'Aluminum', al: 'Alumin' },
  'calc.wood': { en: 'Wood', al: 'Dru' },
  'calc.steel': { en: 'Steel', al: 'Çelik' },
  'calc.glassType': { en: 'Glass Type', al: 'Lloji i Xhamit' },
  'calc.single': { en: 'Single Glass', al: 'Xham i Thjeshtë' },
  'calc.double': { en: 'Double Glass', al: 'Xham Dyfish' },
  'calc.triple': { en: 'Triple Glass', al: 'Xham Trefish' },
  'calc.services': { en: 'Additional Services', al: 'Shërbime Shtesë' },
  'calc.installation': { en: 'Installation', al: 'Instalimi' },
  'calc.transport': { en: 'Transport', al: 'Transporti' },
  'calc.removal': { en: 'Old Frame Removal', al: 'Heqja e Kornizës së Vjetër' },
  'calc.calculate': { en: 'Calculate Total', al: 'Llogarit Totalin' },
  'calc.addToQuote': { en: 'Add to Quote', al: 'Shto në Ofertë' },
  'calc.totalArea': { en: 'Total Area', al: 'Sipërfaqja Totale' },
  'calc.materialCost': { en: 'Material Cost', al: 'Kosto e Materialit' },
  'calc.glassCost': { en: 'Glass Cost', al: 'Kosto e Xhamit' },
  'calc.serviceCost': { en: 'Service Cost', al: 'Kosto e Shërbimeve' },
  'calc.subtotal': { en: 'Subtotal', al: 'Nëntotali' },
  'calc.vat': { en: 'VAT (20%)', al: 'TVSH (20%)' },
  'calc.total': { en: 'Total', al: 'Totali' },
  
  // Quotes
  'quote.new': { en: 'New Quote', al: 'Ofertë e Re' },
  'quote.customer': { en: 'Customer Name', al: 'Emri i Klientit' },
  'quote.phone': { en: 'Phone', al: 'Telefoni' },
  'quote.address': { en: 'Address', al: 'Adresa' },
  'quote.items': { en: 'Items', al: 'Artikujt' },
  'quote.save': { en: 'Save Quote', al: 'Ruaj Ofertën' },
  'quote.pdf': { en: 'Generate PDF', al: 'Gjenero PDF' },
  'quote.duplicate': { en: 'Duplicate', al: 'Dupliko' },
  'quote.edit': { en: 'Edit', al: 'Ndrysho' },
  'quote.delete': { en: 'Delete', al: 'Fshi' },
  'quote.status.draft': { en: 'Draft', al: 'Draft' },
  'quote.status.sent': { en: 'Sent', al: 'Dërguar' },
  'quote.status.accepted': { en: 'Accepted', al: 'Pranuar' },
  'quote.status.rejected': { en: 'Rejected', al: 'Refuzuar' },
  
  // Profile
  'profile.title': { en: 'Company Profile', al: 'Profili i Kompanisë' },
  'profile.companyName': { en: 'Company Name', al: 'Emri i Kompanisë' },
  'profile.regNumber': { en: 'Business Registration Number', al: 'Numri i Regjistrimit të Biznesit' },
  'profile.vatNumber': { en: 'VAT Number', al: 'Numri i TVSH-së' },
  'profile.address': { en: 'Address', al: 'Adresa' },
  'profile.city': { en: 'City', al: 'Qyteti' },
  'profile.country': { en: 'Country', al: 'Shteti' },
  'profile.phone': { en: 'Phone', al: 'Telefoni' },
  'profile.email': { en: 'Email', al: 'Email' },
  'profile.website': { en: 'Website (optional)', al: 'Faqja Web (opsionale)' },
  'profile.logo': { en: 'Company Logo', al: 'Logo e Kompanisë' },
  'profile.accentColor': { en: 'Accent Color', al: 'Ngjyra Thelbësore' },
  'profile.stamp': { en: 'Stamp/Signature (optional)', al: 'Vula/Nënshkrimi (opsionale)' },
  'profile.save': { en: 'Save Profile', al: 'Ruaj Profilin' },
  'profile.saved': { en: 'Profile saved successfully!', al: 'Profili u ruajt me sukses!' },
  
  // Admin
  'admin.title': { en: 'Super Admin Panel', al: 'Paneli i Super Adminit' },
  'admin.users': { en: 'Business Users', al: 'Përdoruesit e Biznesit' },
  'admin.stats': { en: 'System Statistics', al: 'Statistikat e Sistemit' },
  'admin.plans': { en: 'Subscription Plans', al: 'Planet e Abonimit' },
  'admin.config': { en: 'Configuration', al: 'Konfigurimi' },
  'admin.activity': { en: 'Activity Log', al: 'Regjistri i Aktivitetit' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>('en');

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
