
import React, { useState } from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, Image, Users, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import UserProfile from '@/components/dashboard/UserProfile';
import PortfolioManager from '@/components/dashboard/PortfolioManager';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('portfolio');
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <ProtectedRoute>
      <DefaultLayout>
        <div className="py-16 md:py-24">
          <div className="container-custom">
            <div className="mb-8 md:mb-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome, {user?.user_metadata?.full_name || 'Artist'}!
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Manage your portfolio, track analytics, and handle sales
                  </p>
                </div>
              </div>
            </div>
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Portfolio Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">1,234</div>
                    <div className="p-2 bg-green-100 text-green-800 rounded-full">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-xs text-green-600 mt-2 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>12% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Artwork Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">16</div>
                    <div className="p-2 bg-blue-100 text-blue-800 rounded-full">
                      <Image className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last updated 2 days ago
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Sales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">$580</div>
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-full">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-xs text-green-600 mt-2 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>8% from last month</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Followers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">47</div>
                    <div className="p-2 bg-orange-100 text-orange-800 rounded-full">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-xs text-green-600 mt-2 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    <span>5 new this week</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Dashboard Tabs */}
            <Tabs 
              defaultValue="portfolio" 
              value={activeTab} 
              onValueChange={handleTabChange} 
              className="mt-12"
            >
              <TabsList className="mb-8 w-full justify-start border-b bg-transparent p-0 rounded-none">
                <TabsTrigger 
                  value="portfolio" 
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Portfolio
                </TabsTrigger>
                <TabsTrigger 
                  value="profile" 
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="sales" 
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Sales
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="submissions" 
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Submissions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio">
                <PortfolioManager />
              </TabsContent>
              
              <TabsContent value="profile">
                <UserProfile />
              </TabsContent>
              
              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>
                      Track and manage your artwork sales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        No sales data available yet. Start selling your artwork to see statistics here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Analytics</CardTitle>
                    <CardDescription>
                      View detailed statistics about your portfolio performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        Analytics dashboard is coming soon. Check back for detailed insights about your portfolio.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="submissions">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Submissions</CardTitle>
                    <CardDescription>
                      Track the status of your open call applications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">
                        You haven't submitted any applications to open calls yet.
                      </p>
                      <Button className="mt-4">
                        Browse Open Calls
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DefaultLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
