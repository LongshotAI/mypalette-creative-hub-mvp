
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

interface AdminTabsProps {
  adminType?: string | null;
  lastLogin?: string | null;
}

const AdminTabs = ({ adminType, lastLogin }: AdminTabsProps) => {
  const tabsId = React.useId(); // Generate unique ID for tabs

  return (
    <Tabs defaultValue="overview" id={tabsId}>
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
              <CardTitle className="text-base">Security Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>All admin actions are logged and audited for security purposes. Multi-factor authentication is recommended for all admin accounts.</p>
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
