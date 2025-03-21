
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminUsers from '@/components/admin/AdminUsers';
import AdminPortfolios from '@/components/admin/AdminPortfolios';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminEducation from '@/components/admin/AdminEducation';
import AdminStats from '@/components/admin/AdminStats';
import AdminOpenCalls from '@/components/admin/AdminOpenCalls';
import AdminTemplates from '@/components/admin/AdminTemplates';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BeakerIcon } from 'lucide-react';

// Import BeakerIcon if not available in lucide-react
const BeakerIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 2v7.31" />
    <path d="M14 9.3V2" />
    <path d="M8.5 2h7" />
    <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
    <path d="M5.58 16.5h12.85" />
  </svg>
);

interface AdminTabsProps {
  adminType?: string | null;
  lastLogin?: string | null;
}

const AdminTabs = ({ adminType, lastLogin }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="opencalls">Open Calls</TabsTrigger>
        <TabsTrigger value="settings">Platform Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-lg mb-4">Welcome to the Admin Dashboard</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Review new user signups</li>
                <li>Approve pending portfolios</li>
                <li>Moderate reported content</li>
                <li>Update platform announcements</li>
                <li>Manage featured artists on homepage</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Testing Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Use our simulation tools to test platform functionality:</p>
              <Link to="/admin?tab=simulation">
                <Button variant="outline" size="sm" className="w-full">
                  <BeakerIcon className="mr-2 h-4 w-4" />
                  Launch Simulation Mode
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Admin Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>Use the tabs above to navigate between different management sections. Each section provides tools to manage specific aspects of the platform.</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="users">
        <AdminUsers />
      </TabsContent>
      <TabsContent value="portfolios">
        <AdminPortfolios />
      </TabsContent>
      <TabsContent value="templates">
        <AdminTemplates />
      </TabsContent>
      <TabsContent value="education">
        <AdminEducation />
      </TabsContent>
      <TabsContent value="opencalls">
        <AdminOpenCalls />
      </TabsContent>
      <TabsContent value="settings">
        <AdminSettings />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
