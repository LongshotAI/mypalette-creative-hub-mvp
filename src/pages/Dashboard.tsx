
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PortfolioManager from '@/components/dashboard/PortfolioManager';
import UserProfile from '@/components/dashboard/UserProfile';
import OrderHistory from '@/components/dashboard/OrderHistory';
import { useLocation } from 'react-router-dom';

const Dashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  // Set default tab based on URL parameter or 'portfolios'
  const [activeTab, setActiveTab] = useState(
    tabParam === 'profile' || tabParam === 'orders' ? tabParam : 'portfolios'
  );
  
  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        <h1 className="text-3xl font-bold mb-6">Creator Dashboard</h1>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
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
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
