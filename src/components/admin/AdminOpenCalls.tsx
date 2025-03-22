
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2 
} from "lucide-react";
import { CalendarIcon } from "lucide-react";
import { getReadableDate } from '@/lib/utils';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOpenCall, setSelectedOpenCall] = useState<OpenCall | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const [callForm, setCallForm] = useState({
    id: '',
    title: '',
    organization: '',
    description: '',
    requirements: '',
    category: 'Exhibition',
    status: 'draft',
    deadline: '',
    image_url: ''
  });
  
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
    setCallForm({
      id: '',
      title: '',
      organization: '',
      description: '',
      requirements: '',
      category: 'Exhibition',
      status: 'draft',
      deadline: '',
      image_url: ''
    });
    setDate(undefined);
    setIsEdit(false);
    setDialogOpen(true);
  };

  const handleEditCall = (call: OpenCall) => {
    setCallForm({
      id: call.id,
      title: call.title,
      organization: call.organization,
      description: call.description || '',
      requirements: call.requirements || '',
      category: call.category,
      status: call.status,
      deadline: call.deadline,
      image_url: call.image_url || ''
    });
    setDate(new Date(call.deadline));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCallForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCallForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error('Please select a deadline date');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formattedDate = date.toISOString();
      
      if (isEdit) {
        // Update existing open call
        const { error } = await supabase
          .from('open_calls')
          .update({
            title: callForm.title,
            organization: callForm.organization,
            description: callForm.description,
            requirements: callForm.requirements,
            category: callForm.category,
            status: callForm.status,
            deadline: formattedDate,
            image_url: callForm.image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', callForm.id);
          
        if (error) throw error;
        
        toast.success('Open call updated successfully');
      } else {
        // Create new open call
        const { error } = await supabase
          .from('open_calls')
          .insert([{
            title: callForm.title,
            organization: callForm.organization,
            description: callForm.description,
            requirements: callForm.requirements,
            category: callForm.category,
            status: callForm.status,
            deadline: formattedDate,
            image_url: callForm.image_url
          }]);
          
        if (error) throw error;
        
        toast.success('Open call created successfully');
      }
      
      setDialogOpen(false);
      fetchOpenCalls();
    } catch (error) {
      console.error('Error saving open call:', error);
      toast.error('Failed to save open call');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Open</Badge>;
      case 'closed':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Closed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No open calls found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.title}</TableCell>
                        <TableCell>{call.organization}</TableCell>
                        <TableCell>{call.category}</TableCell>
                        <TableCell>{getStatusBadge(call.status)}</TableCell>
                        <TableCell>{getReadableDate(call.deadline)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            className="px-2 py-1 h-auto"
                            onClick={() => handleViewSubmissions(call)}
                          >
                            {call.submission_count || 0}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewSubmissions(call)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditCall(call)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive/90"
                              onClick={() => handleDeleteCall(call.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="e.g., Summer Exhibition 2023" 
                required
                value={callForm.title}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input 
                id="organization" 
                name="organization" 
                placeholder="e.g., City Gallery" 
                required
                value={callForm.organization}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={callForm.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Exhibition">Exhibition</SelectItem>
                    <SelectItem value="Residency">Residency</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Grant">Grant</SelectItem>
                    <SelectItem value="Fellowship">Fellowship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={callForm.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input 
                id="image_url" 
                name="image_url" 
                placeholder="https://example.com/image.jpg" 
                value={callForm.image_url || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Describe the opportunity" 
                rows={3}
                value={callForm.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea 
                id="requirements" 
                name="requirements" 
                placeholder="List eligibility criteria and requirements" 
                rows={3}
                value={callForm.requirements || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update Open Call' : 'Create Open Call'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOpenCalls;
