import React from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import AdminTabs from '@/components/admin/navigation/AdminTabs';
import { useLocation } from 'react-router-dom';
import AdminSimulationTabs from '@/components/admin/simulation/AdminSimulationTabs';

const Admin = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab');

  // If the tab is 'simulation', show the simulation interface
  if (tab === 'simulation') {
    return (
      <AdminLayout>
        <AdminSimulationTabs />
      </AdminLayout>
    );
  }

  // Otherwise, show the regular admin tabs
  return (
    <AdminLayout>
      <AdminTabs />
    </AdminLayout>
  );
};

export default Admin;
