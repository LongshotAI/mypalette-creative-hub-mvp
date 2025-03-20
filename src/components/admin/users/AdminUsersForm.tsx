
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminFormModal from '../shared/AdminFormModal';

interface AdminUsersFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (email: string, adminType: string) => Promise<void>;
  isSubmitting: boolean;
}

const AdminUsersForm = ({ 
  isOpen, 
  onClose, 
  onAddAdmin,
  isSubmitting
}: AdminUsersFormProps) => {
  const [email, setEmail] = useState('');
  const [adminType, setAdminType] = useState('admin');

  const handleSubmit = () => {
    onAddAdmin(email, adminType);
  };

  return (
    <AdminFormModal
      title="Add New Admin"
      description="Enter the email of an existing user to grant them admin privileges."
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Add Admin"
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">User Email</Label>
          <Input
            id="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="adminType">Admin Type</Label>
          <Select value={adminType} onValueChange={setAdminType}>
            <SelectTrigger id="adminType">
              <SelectValue placeholder="Select admin type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Regular Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </AdminFormModal>
  );
};

export default AdminUsersForm;
