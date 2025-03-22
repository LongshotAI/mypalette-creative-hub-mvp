
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import OpenCallList from './opencalls/OpenCallList';
import OpenCallForm from './opencalls/OpenCallForm';
import AdminOpenCallDetail from './opencalls/AdminOpenCallDetail';

interface OpenCall {
  id: string;
  title: string;
  organization: string;
  description: string;
  requirements: string;
  category: string;
  status: 'open' | 'closed' | 'draft';
  deadline: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  submission_count?: number;
}

const AdminOpenCalls = () => {
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpenCall, setSelectedOpenCall] = useState<OpenCall | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchOpenCalls();
  }, []);

  const fetchOpenCalls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('open_calls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get submission counts for each open call
      const callsWithCounts = await Promise.all(
        (data || []).map(async (call) => {
          const { count, error: countError } = await supabase
            .from('open_call_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('open_call_id', call.id);
            
          return {
            ...call,
            submission_count: count || 0
          };
        })
      );
      
      setOpenCalls(callsWithCounts);
    } catch (error) {
      console.error('Error fetching open calls:', error);
      toast.error('Failed to load open calls');
    } finally {
      setLoading(false);
    }
  };

  const handleNewCall = () => {
    setSelectedOpenCall(null);
    setIsEdit(false);
    setDialogOpen(true);
  };

  const handleEditCall = (call: OpenCall) => {
    setSelectedOpenCall(call);
    setIsEdit(true);
    setDialogOpen(true);
  };

  const handleViewSubmissions = (call: OpenCall) => {
    setSelectedOpenCall(call);
    setShowDetail(true);
  };

  const handleDeleteCall = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this open call? This action cannot be undone.')) {
      try {
        setLoading(true);
        
        // Delete submissions first
        const { error: submissionsError } = await supabase
          .from('open_call_submissions')
          .delete()
          .eq('open_call_id', id);
          
        if (submissionsError) throw submissionsError;
        
        // Then delete the open call
        const { error } = await supabase
          .from('open_calls')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Open call deleted successfully');
        fetchOpenCalls();
      } catch (error) {
        console.error('Error deleting open call:', error);
        toast.error('Failed to delete open call');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCalls = openCalls.filter(call => {
    const searchLower = searchTerm.toLowerCase();
    return (
      call.title.toLowerCase().includes(searchLower) ||
      call.organization.toLowerCase().includes(searchLower) ||
      call.category.toLowerCase().includes(searchLower)
    );
  });

  if (showDetail && selectedOpenCall) {
    return (
      <AdminOpenCallDetail 
        openCall={selectedOpenCall} 
        onBack={() => {
          setShowDetail(false);
          setSelectedOpenCall(null);
          fetchOpenCalls(); // Refresh data when returning to list
        }} 
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Open Calls Management</h2>
          <p className="text-muted-foreground">Create and manage open calls for artists</p>
        </div>
        <Button onClick={handleNewCall}>
          <Plus className="mr-2 h-4 w-4" /> New Open Call
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Open Calls</CardTitle>
          <CardDescription>
            Manage opportunities for artists on the platform
          </CardDescription>
          <div className="mt-4">
            <Input
              placeholder="Search open calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <OpenCallList 
              openCalls={filteredCalls}
              onViewSubmissions={handleViewSubmissions}
              onEditCall={handleEditCall}
              onDeleteCall={handleDeleteCall}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Edit Open Call' : 'Create New Open Call'}
            </DialogTitle>
            <DialogDescription>
              {isEdit 
                ? 'Update the details of this open call.' 
                : 'Create a new opportunity for artists.'}
            </DialogDescription>
          </DialogHeader>
          
          <OpenCallForm 
            initialValues={selectedOpenCall || undefined}
            onCancel={() => setDialogOpen(false)}
            onSubmitSuccess={() => {
              setDialogOpen(false);
              fetchOpenCalls();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOpenCalls;
