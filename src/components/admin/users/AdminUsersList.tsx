
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, UserX } from 'lucide-react';

interface AdminUser {
  id: string;
  full_name: string;
  contact_email: string;
  admin_type: string;
  location: string;
  updated_at: string;
}

interface AdminUsersListProps {
  users: AdminUser[];
  currentUserId: string | undefined;
  onDeleteAdmin: (id: string) => void;
}

const AdminUsersList = ({ users, currentUserId, onDeleteAdmin }: AdminUsersListProps) => {
  if (!users.length) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No admin users found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell className="font-medium">{admin.full_name || 'Unknown'}</TableCell>
            <TableCell>{admin.contact_email || 'No email'}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Shield className={`mr-2 h-4 w-4 ${admin.admin_type === 'super_admin' ? 'text-red-500' : 'text-primary'}`} />
                {admin.admin_type === 'super_admin' ? 'Super Admin' : 'Admin'}
              </div>
            </TableCell>
            <TableCell>{admin.location || 'Unknown'}</TableCell>
            <TableCell>{new Date(admin.updated_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeleteAdmin(admin.id)}
                disabled={admin.id === currentUserId} // Prevent removing yourself
                title={admin.id === currentUserId ? "You cannot remove your own admin privileges" : "Remove admin privileges"}
              >
                <UserX className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminUsersList;
