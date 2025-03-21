
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Briefcase, 
  Layers, 
  BookOpen, 
  Settings, 
  FileSpreadsheet,
  FlaskConical
} from 'lucide-react';

const AdminTabs = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');
  
  return (
    <div className="w-full py-4">
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger 
            value="users" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=users" className={tab === 'users' ? 'data-[state=active]' : ''}>
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </Link>
          </TabsTrigger>
          
          <TabsTrigger 
            value="portfolios" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=portfolios" className={tab === 'portfolios' ? 'data-[state=active]' : ''}>
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolios</span>
            </Link>
          </TabsTrigger>
          
          <TabsTrigger 
            value="templates" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=templates" className={tab === 'templates' ? 'data-[state=active]' : ''}>
              <Layers className="h-4 w-4" />
              <span className="hidden sm:inline">Templates</span>
            </Link>
          </TabsTrigger>
          
          <TabsTrigger 
            value="education" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=education" className={tab === 'education' ? 'data-[state=active]' : ''}>
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Education</span>
            </Link>
          </TabsTrigger>
          
          <TabsTrigger 
            value="opencalls" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=opencalls" className={tab === 'opencalls' ? 'data-[state=active]' : ''}>
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Open Calls</span>
            </Link>
          </TabsTrigger>
          
          <TabsTrigger 
            value="simulation" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=simulation" className={tab === 'simulation' ? 'data-[state=active]' : ''}>
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Simulation</span>
            </Link>
          </TabsTrigger>
          
          <TabsTrigger 
            value="settings" 
            className="flex items-center gap-2"
            asChild
          >
            <Link to="/admin?tab=settings" className={tab === 'settings' ? 'data-[state=active]' : ''}>
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default AdminTabs;
