
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PortfolioManager from '@/components/dashboard/PortfolioManager';
import UserProfile from '@/components/dashboard/UserProfile';
import { useLocation, useNavigate } from 'react-router-dom';
import OrderHistory from '@/components/dashboard/OrderHistory';
import SalesHistory from '@/components/dashboard/SalesHistory';
import ArtistAnalyticsDashboard from '@/components/dashboard/ArtistAnalyticsDashboard';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('portfolios');
  
  // Parse the tab parameter from the URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['portfolios', 'profile', 'orders', 'sales', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard?tab=${value}`, { replace: true });
  };

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-8">
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolios">
            <PortfolioManager />
          </TabsContent>
          
          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>
          
          <TabsContent value="orders">
            <OrderHistory />
          </TabsContent>
          
          <TabsContent value="sales">
            <SalesHistory />
          </TabsContent>
          
          <TabsContent value="analytics">
            <ArtistAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
