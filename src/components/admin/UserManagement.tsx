
import React, { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AdminType, Admin } from '@/types/admin';
import { toast } from 'sonner';
import { getAllAdmins, updateAdminRole } from '@/lib/supabase';
import { Loader2, Shield, X, Users } from 'lucide-react';

interface UserManagementProps {
  currentUserIsSuper: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUserIsSuper }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newAdminType, setNewAdminType] = useState<AdminType>(null);

  const loadAdmins = async () => {
    setLoading(true);
    const data = await getAllAdmins();
    setAdmins(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setNewAdminType(admin.admin_type);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedAdmin || !newAdminType) return;

    const success = await updateAdminRole(selectedAdmin.id, newAdminType);
    
    if (success) {
      toast.success(`Admin role updated successfully`);
      loadAdmins();
    } else {
      toast.error('Failed to update admin role');
    }
    
    setIsEditDialogOpen(false);
  };

  const handleRemoveAdmin = async () => {
    if (!selectedAdmin) return;

    const success = await updateAdminRole(selectedAdmin.id, null);
    
    if (success) {
      toast.success(`Admin privileges removed`);
      loadAdmins();
    } else {
      toast.error('Failed to remove admin privileges');
    }
    
    setIsDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Admin Accounts</h2>
        {currentUserIsSuper && (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Users size={16} />
              Invite New Admin
            </Button>
          </div>
        )}
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No admin accounts found
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name || 'Unnamed'}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1">
                      <Shield size={16} className="text-primary" />
                      {admin.admin_type === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {(currentUserIsSuper || admin.admin_type !== 'super_admin') && (
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(admin)}
                          disabled={admin.admin_type === 'super_admin' && !currentUserIsSuper}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteClick(admin)}
                          disabled={admin.admin_type === 'super_admin' && !currentUserIsSuper}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedAdmin?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">Admin Type</label>
            <Select 
              value={newAdminType || undefined} 
              onValueChange={(val) => setNewAdminType(val as AdminType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select admin type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                {currentUserIsSuper && (
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin Privileges</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove admin privileges from {selectedAdmin?.email}?
              This action cannot be undone.
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
  );
};

export default UserManagement;
