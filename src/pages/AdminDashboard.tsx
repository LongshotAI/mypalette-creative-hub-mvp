
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminDashboard: React.FC = () => {
  return (
    <DefaultLayout>
      <AdminLayout />
    </DefaultLayout>
  );
};

export default AdminDashboard;
