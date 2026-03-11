import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats, getRecentQuotes } from '../../lib/database';

const DashboardHome: React.FC = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const accent = user?.company?.accentColor || '#2563EB';

  const [stats, setStats] = useState({ totalQuotes: 0, totalInvoices: 0, revenue: 0, customerCount: 0 });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const [s, rq] = await Promise.all([
          getDashboardStats(user.id),
          getRecentQuotes(user.id, 5),
        ]);
        setStats(s);
        setRecentQuotes(rq);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
  }, [user]);

  const statCards = [
    { label: t('dash.totalQuotes'), value: stats.totalQuotes.toString(), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { label: t('dash.totalInvoices'), value: stats.totalInvoices.toString(), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> },
    { label: t('dash.revenue'), value: `€${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: t('dash.customers.count'), value: stats.customerCount.toString(), icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  ];

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700', sent: 'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {!user?.company?.isComplete && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          <div>
            <p className="font-semibold text-amber-800">{lang === 'en' ? 'Complete Your Company Profile' : 'Plotësoni Profilin e Kompanisë'}</p>
            <p className="text-sm text-amber-700 mt-1">{lang === 'en' ? 'Please complete your company profile to start generating branded quotes and invoices.' : 'Ju lutem plotësoni profilin e kompanisë për të filluar gjenerimin e ofertave dhe faturave me markën tuaj.'}</p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15`, color: accent }}>{stat.icon}</div>
            </div>
            <div className="mt-4">
              {loadingStats ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              ) : (
                <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">{lang === 'en' ? 'Recent Quotes' : 'Ofertat e Fundit'}</h3>
          {recentQuotes.length === 0 && !loadingStats ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <p className="font-medium">{lang === 'en' ? 'No quotes yet' : 'Ende pa oferta'}</p>
              <p className="text-sm mt-1">{lang === 'en' ? 'Create your first quote using the calculator' : 'Krijoni ofertën tuaj të parë duke përdorur kalkulatorin'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{lang === 'en' ? 'Customer' : 'Klienti'}</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{q.quote_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{q.customer_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">€{parseFloat(q.total).toFixed(2)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[q.status] || 'bg-gray-100 text-gray-700'}`}>{q.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{lang === 'en' ? 'Quick Actions' : 'Veprime të Shpejta'}</h3>
          <div className="space-y-3">
            {[
              { label: lang === 'en' ? 'New Calculation' : 'Llogaritje e Re', color: accent },
              { label: lang === 'en' ? 'Create Quote' : 'Krijo Ofertë', color: '#059669' },
              { label: lang === 'en' ? 'New Invoice' : 'Faturë e Re', color: '#7C3AED' },
              { label: lang === 'en' ? 'Add Customer' : 'Shto Klient', color: '#EA580C' },
            ].map((action, i) => (
              <button key={i} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: action.color }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
