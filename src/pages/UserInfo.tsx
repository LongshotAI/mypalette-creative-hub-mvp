
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clipboard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const UserInfo = () => {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      toast.success('User ID copied to clipboard');
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">User Information</h1>
        
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Your Supabase User ID</CardTitle>
            <CardDescription>
              Use this ID to set yourself as a super admin in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="p-4 bg-secondary rounded-md flex items-center justify-between">
                  <code className="text-sm font-mono break-all">{user.id}</code>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={copyToClipboard}
                    className="ml-2 flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">To make yourself a super admin:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-2">
                    <li>Go to the Supabase SQL Editor</li>
                    <li>Run the following SQL query, replacing YOUR_USER_ID with the ID above:</li>
                    <pre className="p-3 bg-secondary rounded-md text-xs mt-2 overflow-x-auto">
                      UPDATE public.profiles SET admin_type = 'super_admin' WHERE id = 'YOUR_USER_ID';
                    </pre>
                    <li>Once complete, you'll have full access to the admin dashboard</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Please sign in to view your user ID</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default UserInfo;
