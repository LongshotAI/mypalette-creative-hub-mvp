
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Search, UserCheck, UserX, ShieldAlert, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getReadableDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  admin_type: string | null;
  last_sign_in_at: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userToPromote, setUserToPromote] = useState<UserProfile | null>(null);
  const [userToDemote, setUserToDemote] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkSuperAdminStatus = async () => {
      if (!user) return;
      
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
        // Get users from auth schema (only accessible to service role)
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          throw error;
        }

        // Get email from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
          // Continue with profiles only
          setUsers(profiles.map(profile => ({
            ...profile,
            email: 'Email hidden',
            last_sign_in_at: null
          })));
        } else {
          // Merge profiles with auth users
          const mergedUsers = profiles.map(profile => {
            const authUser = authUsers.users.find(u => u.id === profile.id);
            return {
              ...profile,
              email: authUser?.email || 'Email hidden',
              last_sign_in_at: authUser?.last_sign_in_at || null
            };
          });
          
          setUsers(mergedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdminStatus();
    fetchUsers();
  }, [user]);

  const handleSetAdmin = async (userId: string, adminType: string | null) => {
    try {
      setLoading(true);
      
      // Don't allow demoting yourself
      if (userId === user?.id && adminType === null) {
        toast.error('You cannot remove your own admin privileges');
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ admin_type: adminType })
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Update the users list
      setUsers(users.map(u => 
        u.id === userId ? { ...u, admin_type: adminType } : u
      ));
      
      toast.success(adminType ? 'User promoted to admin' : 'Admin privileges removed');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setLoading(false);
      setUserToPromote(null);
      setUserToDemote(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Users</CardTitle>
        <CardDescription>
          View and manage all users on the platform
        </CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  {isSuperAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 6 : 5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.full_name || 'No name'}</p>
                          <p className="text-sm text-muted-foreground">{user.username || 'No username'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {user.admin_type === 'super_admin' ? (
                            <div className="flex items-center text-primary">
                              <ShieldAlert className="h-4 w-4 mr-1" />
                              <span>Super Admin</span>
                            </div>
                          ) : user.admin_type ? (
                            <div className="flex items-center text-blue-600">
                              <Shield className="h-4 w-4 mr-1" />
                              <span>Admin</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Regular User</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.created_at && getReadableDate(user.created_at)}</TableCell>
                      <TableCell>{user.last_sign_in_at ? getReadableDate(user.last_sign_in_at) : 'Never'}</TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          {user.admin_type ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setUserToDemote(user)}
                                  disabled={user.id === user?.id}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Remove Admin
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Admin Privileges</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove admin privileges from {userToDemote?.full_name || userToDemote?.email}?
                                    This will revoke their access to the admin dashboard.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => userToDemote && handleSetAdmin(userToDemote.id, null)}
                                  >
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setUserToPromote(user)}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Make Admin
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to give admin privileges to {userToPromote?.full_name || userToPromote?.email}?
                                    They will have access to the admin dashboard and user management.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => userToPromote && handleSetAdmin(userToPromote.id, 'admin')}
                                  >
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
