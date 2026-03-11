import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LoginModal from './LoginModal';

const HERO_IMG = 'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216297055_376f3e42.jpg';
const PRODUCT_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216314257_917318b2.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216316814_510bcf60.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216317563_87dd6862.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216372879_71402444.png',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216340112_171ea098.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216385447_ed9cdc00.png',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216403586_e030393c.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216404663_9562a1e5.jpg',
  'https://d64gsuwffb70l.cloudfront.net/69b121b520fe93705068f032_1773216405157_e1500b94.jpg',
];

const Homepage: React.FC = () => {
  const { lang, setLang, t } = useLanguage();
  const [loginOpen, setLoginOpen] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSent(false), 3000);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const featureIcons = [
    <svg key="calc" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={1.5}/><path d="M8 6h8M8 10h8M8 14h3M13 14h3M8 18h3" strokeWidth={1.5} strokeLinecap="round"/></svg>,
    <svg key="quote" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>,
    <svg key="inv" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>,
    <svg key="brand" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>,
    <svg key="lang" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>,
    <svg key="cust" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ];

  const featureKeys = ['calc', 'quote', 'invoice', 'brand', 'multi', 'customer'];

  const pricingPlans = [
    {
      name: t('pricing.starter'),
      price: '29',
      features: lang === 'en'
        ? ['Up to 50 quotes/month', 'Basic calculator', 'PDF generation', 'Email support', '1 user']
        : ['Deri në 50 oferta/muaj', 'Kalkulator bazë', 'Gjenerim PDF', 'Mbështetje me email', '1 përdorues'],
    },
    {
      name: t('pricing.professional'),
      price: '79',
      popular: true,
      features: lang === 'en'
        ? ['Unlimited quotes', 'Advanced calculator', 'Custom branding', 'Invoice management', 'Customer database', '5 users', 'Priority support']
        : ['Oferta pa limit', 'Kalkulator i avancuar', 'Markë e personalizuar', 'Menaxhim faturash', 'Databazë klientësh', '5 përdorues', 'Mbështetje prioritare'],
    },
    {
      name: t('pricing.enterprise'),
      price: '199',
      features: lang === 'en'
        ? ['Everything in Professional', 'Unlimited users', 'API access', 'White-label documents', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee']
        : ['Gjithçka në Profesional', 'Përdorues pa limit', 'Qasje API', 'Dokumente white-label', 'Menaxher i dedikuar', 'Integrime të personalizuara', 'Garanci SLA'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">GlazePro</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('features')} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">{t('nav.features')}</button>
              <button onClick={() => scrollTo('pricing')} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">{t('nav.pricing')}</button>
              <button onClick={() => scrollTo('about')} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">{t('nav.about')}</button>
              <button onClick={() => scrollTo('contact')} className="text-gray-600 hover:text-blue-600 font-medium text-sm transition-colors">{t('nav.contact')}</button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLang(lang === 'en' ? 'al' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                {lang === 'en' ? 'AL' : 'EN'}
              </button>
              <button
                onClick={() => setLoginOpen(true)}
                className="hidden sm:flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/25"
              >
                {t('nav.login')}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
              <button onClick={() => scrollTo('features')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.features')}</button>
              <button onClick={() => scrollTo('pricing')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.pricing')}</button>
              <button onClick={() => scrollTo('contact')} className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.contact')}</button>
              <button onClick={() => { setLoginOpen(true); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg">{t('nav.login')}</button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-blue-200 text-sm mb-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
              {lang === 'en' ? 'Trusted by 500+ businesses across Europe' : 'Besuar nga 500+ biznese në Evropë'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight">
              {t('hero.title')}
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{t('hero.title2')}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100/80 max-w-2xl leading-relaxed">{t('hero.subtitle')}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button onClick={() => setLoginOpen(true)} className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl shadow-black/20">
                {t('hero.cta')}
              </button>
              <button onClick={() => scrollTo('about')} className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                {t('hero.cta2')}
              </button>
            </div>
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
              {[{ num: '500+', label: t('hero.stat1') }, { num: '25K+', label: t('hero.stat2') }, { num: '12+', label: t('hero.stat3') }].map((s, i) => (
                <div key={i}>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white">{s.num}</div>
                  <div className="text-sm text-blue-200/70 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Product Showcase */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-9 gap-4">
            {PRODUCT_IMAGES.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
                <img src={img} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('features.title')}</h2>
            <p className="mt-4 text-lg text-gray-600">{t('features.subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureKeys.map((key, i) => (
              <div key={key} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  {featureIcons[i]}
                </div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{t(`features.${key}.title`)}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{t(`features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('how.title')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold mx-auto shadow-lg shadow-blue-500/25">
                  {step}
                </div>
                {step < 4 && <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-transparent" />}
                <h3 className="mt-6 text-lg font-bold text-gray-900">{t(`how.step${step}.title`)}</h3>
                <p className="mt-2 text-gray-600 text-sm">{t(`how.step${step}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('pricing.title')}</h2>
            <p className="mt-4 text-lg text-gray-600">{t('pricing.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-8 ${plan.popular ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-500/30 scale-105' : 'bg-white border border-gray-200 shadow-sm'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">{t('pricing.popular')}</div>
                )}
                <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-5xl font-extrabold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>${plan.price}</span>
                  <span className={plan.popular ? 'text-blue-200' : 'text-gray-500'}>{t('pricing.mo')}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-blue-200' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setLoginOpen(true)}
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition-all ${plan.popular ? 'bg-white text-blue-700 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  {t('pricing.cta')}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('contact.title')}</h2>
              <p className="mt-4 text-lg text-gray-600">{t('contact.subtitle')}</p>
              <div className="mt-10 space-y-6">
                {[
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, text: 'Tirana, Albania' },
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>, text: 'info@glazepro.com' },
                  { icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, text: '+355 69 000 0000' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">{item.icon}</div>
                    <span className="text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              {contactSent && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {t('contact.sent')}
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.name')}</label>
                  <input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.email')}</label>
                  <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('contact.message')}</label>
                  <textarea value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} rows={5} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/25">
                  {t('contact.send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Business Login Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {lang === 'en' ? 'Ready to Transform Your Business?' : 'Gati të Transformoni Biznesin Tuaj?'}
          </h2>
          <p className="mt-4 text-lg text-blue-200">
            {lang === 'en' ? 'Join hundreds of window and door professionals who trust GlazePro.' : 'Bashkohuni me qindra profesionistë të dritareve dhe dyerve që besojnë GlazePro.'}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button onClick={() => setLoginOpen(true)} className="px-10 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl">
              {t('nav.login')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <span className="text-lg font-bold text-white">GlazePro</span>
              </div>
              <p className="text-sm leading-relaxed">{t('footer.desc')}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm">
                {[t('nav.features'), t('dash.calculator'), t('dash.quotes'), t('dash.invoices')].map((item, i) => (
                  <li key={i}><button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm">
                {[t('nav.about'), 'Blog', lang === 'en' ? 'Careers' : 'Karriera', lang === 'en' ? 'Privacy Policy' : 'Politika e Privatësisë'].map((item, i) => (
                  <li key={i}><button onClick={() => scrollTo('about')} className="hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2 text-sm">
                {[t('nav.contact'), 'FAQ', lang === 'en' ? 'Documentation' : 'Dokumentacioni', lang === 'en' ? 'Status' : 'Statusi'].map((item, i) => (
                  <li key={i}><button onClick={() => scrollTo('contact')} className="hover:text-white transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2026 GlazePro. {t('footer.rights')}</p>
            <div className="flex items-center gap-4">
              {['M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
                'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z',
                'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z'
              ].map((path, i) => (
                <button key={i} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={path} /></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
};

export default Homepage;
