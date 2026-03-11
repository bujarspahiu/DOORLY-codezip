import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome';
import Calculator, { CalcItem } from './Calculator';
import QuoteManager from './QuoteManager';
import CustomerManager from './CustomerManager';
import PriceManagement from './PriceManagement';
import CompanyProfile from './CompanyProfile';
import { createQuote, getNextQuoteNumber } from '../../lib/database';
import { useAuth } from '../../contexts/AuthContext';

const BusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingCalcItems, setPendingCalcItems] = useState<CalcItem[] | null>(null);
  const { user } = useAuth();

  const handleAddToQuote = (items: CalcItem[]) => {
    setPendingCalcItems(items);
    setActiveTab('quotes');
  };

  const handleConvertToInvoice = async (quote: any) => {
    if (!user) return;
    try {
      const invNum = await getNextQuoteNumber(user.id, 'invoice');
      await createQuote(user.id, {
        quote_number: invNum,
        doc_type: 'invoice',
        customer_name: quote.customer_name,
        customer_phone: quote.customer_phone,
        customer_email: quote.customer_email,
        customer_address: quote.customer_address,
        customer_city: quote.customer_city,
        customer_country: quote.customer_country,
        customer_vat: quote.customer_vat,
        customer_reg: quote.customer_reg,
        customer_bank_name: quote.customer_bank_name,
        customer_bank_account: quote.customer_bank_account,
        customer_bank_swift: quote.customer_bank_swift,
        items: quote.items,
        subtotal: quote.subtotal,
        vat: quote.vat,
        total: quote.total,
        notes: quote.notes,
        valid_until: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      });
      setActiveTab('invoices');
    } catch (err) {
      console.error('Error converting to invoice:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardHome />;
      case 'calculator':
        return <Calculator onAddToQuote={handleAddToQuote} />;
      case 'quotes':
        return <QuoteManager type="quote" initialCalcItems={pendingCalcItems} onCalcItemsConsumed={() => setPendingCalcItems(null)} onConvertToInvoice={handleConvertToInvoice} />;
      case 'invoices':
        return <QuoteManager type="invoice" />;
      case 'customers':
        return <CustomerManager />;
      case 'prices':
        return <PriceManagement />;
      case 'profile':
        return <CompanyProfile />;
      case 'settings':
        return <CompanyProfile />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  );
};

export default BusinessDashboard;
