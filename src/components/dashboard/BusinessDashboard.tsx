import React, { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome';
import Calculator, { CalcItem } from './Calculator';
import QuoteManager from './QuoteManager';
import CustomerManager from './CustomerManager';
import PriceManagement from './PriceManagement';
import CompanyProfile from './CompanyProfile';

const BusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingCalcItems, setPendingCalcItems] = useState<CalcItem[] | null>(null);

  const handleAddToQuote = (items: CalcItem[]) => {
    setPendingCalcItems(items);
    setActiveTab('quotes');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardHome />;
      case 'calculator':
        return <Calculator onAddToQuote={handleAddToQuote} />;
      case 'quotes':
        return <QuoteManager type="quote" initialCalcItems={pendingCalcItems} onCalcItemsConsumed={() => setPendingCalcItems(null)} />;
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
