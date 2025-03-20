
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import AdminUsersList from './users/AdminUsersList';
import AdminUsersForm from './users/AdminUsersForm';

const AdminUsers = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('is_super_admin');
        if (error) {
          console.error('Error checking super admin status:', error);
          return;
        }
        setIsSuperAdmin(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Only super admins can see all admins
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .not('admin_type', 'is', null);
        
        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Failed to load admin users');
          return;
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
    fetchUsers();
  }, []);

  const filteredUsers = searchQuery 
    ? users.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const handleAddAdmin = async (email: string, adminType: string) => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // First find the user by email (if they exist in auth)
      const { data: usersByEmail, error: userQueryError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('contact_email', email)
        .single();

      if (userQueryError || !usersByEmail) {
        toast.error('User not found with that email address');
        setIsSubmitting(false);
        return;
      }

      // Update the user's admin_type
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ admin_type: adminType })
        .eq('id', usersByEmail.id);

      if (updateError) {
        console.error('Error updating user:', updateError);
        toast.error('Failed to update user role');
        setIsSubmitting(false);
        return;
      }

      toast.success(`Successfully made ${usersByEmail.full_name || email} an ${adminType}`);
      
      // Refresh the user list
      const { data: updatedUsers } = await supabase
        .from('profiles')
        .select('*')
        .not('admin_type', 'is', null);
        
      setUsers(updatedUsers || []);
      setIsAddUserDialogOpen(false);
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteAdmin = (id: string) => {
    setDeleteAdminId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleRemoveAdmin = async () => {
    if (!deleteAdminId) return;

    try {
      // Find the user first to get their info for the toast
      const { data: userData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', deleteAdminId)
        .single();

      // Update the user's admin_type to null
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ admin_type: null })
        .eq('id', deleteAdminId);

      if (updateError) {
        console.error('Error removing admin role:', updateError);
        toast.error('Failed to remove admin role');
        return;
      }

      toast.success(`Successfully removed admin role from ${userData?.full_name || 'user'}`);
      
      // Update the users list
      setUsers(users.filter(user => user.id !== deleteAdminId));
      setIsDeleteDialogOpen(false);
      setDeleteAdminId(null);
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need super admin privileges to manage admin users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Users Management</CardTitle>
          <CardDescription>
            Manage admin access to the MyPalette platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <div className="relative w-64">
              <Input
                placeholder="Search admins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
            
            <AdminUsersForm
              isOpen={isAddUserDialogOpen}
              onClose={() => setIsAddUserDialogOpen(false)}
              onAddAdmin={handleAddAdmin}
              isSubmitting={isSubmitting}
            />
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Admin</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove this user's admin privileges? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleRemoveAdmin}>
                    Remove Admin
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <AdminUsersList 
            users={filteredUsers}
            currentUserId={user?.id}
            onDeleteAdmin={confirmDeleteAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
