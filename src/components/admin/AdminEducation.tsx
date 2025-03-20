
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useEducationResources } from "@/hooks/useEducationResources";
import { getReadableDate } from "@/lib/utils";

interface ResourceFormData {
  id?: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide';
  category: string;
  author: string;
  external_url?: string;
  is_published: boolean;
}

const defaultResourceData: ResourceFormData = {
  title: '',
  description: '',
  type: 'article',
  category: 'Digital Art',
  author: '',
  external_url: '',
  is_published: true
};

const AdminEducation = () => {
  const { resources, loading } = useEducationResources();
  const [editingResource, setEditingResource] = useState<ResourceFormData | null>(null);
  const [formData, setFormData] = useState<ResourceFormData>(defaultResourceData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditResource = (resource: any) => {
    const resourceToEdit = {
      id: resource.id,
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      category: resource.category,
      author: resource.author,
      external_url: resource.external_url || '',
      is_published: resource.is_published
    };
    
    setEditingResource(resourceToEdit);
    setFormData(resourceToEdit);
    setDialogOpen(true);
  };

  const handleCreateResource = () => {
    setEditingResource(null);
    setFormData(defaultResourceData);
    setDialogOpen(true);
  };
  
  const handleDeleteResource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('education_resources')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast.success('Resource deleted successfully');
        // Reload the page to refresh the data
        window.location.reload();
      } catch (error) {
        console.error('Error deleting resource:', error);
        toast.error('Failed to delete resource');
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_published: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingResource) {
        // Update existing resource
        const { error } = await supabase
          .from('education_resources')
          .update({
            title: formData.title,
            description: formData.description,
            type: formData.type,
            category: formData.category,
            author: formData.author,
            external_url: formData.external_url,
            is_published: formData.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResource.id);
          
        if (error) throw error;
        
        toast.success('Resource updated successfully');
      } else {
        // Create new resource
        const { error } = await supabase
          .from('education_resources')
          .insert([{
            title: formData.title,
            description: formData.description,
            type: formData.type,
            category: formData.category,
            author: formData.author,
            external_url: formData.external_url,
            is_published: formData.is_published
          }]);
          
        if (error) throw error;
        
        toast.success('Resource created successfully');
      }
      
      setDialogOpen(false);
      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Education Resources</h2>
        <Button onClick={handleCreateResource}>
          <Plus className="h-4 w-4 mr-2" />
          New Resource
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
          <CardDescription>
            Manage educational resources for artists and collectors
          </CardDescription>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">
                        {resource.title}
                      </TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>{resource.category}</TableCell>
                      <TableCell>{resource.author}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${resource.is_published ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {resource.is_published ? 'Published' : 'Draft'}
                        </span>
                      </TableCell>
                      <TableCell>{resource.created_at ? getReadableDate(resource.created_at) : 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditResource(resource)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {resource.external_url && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => window.open(resource.external_url, '_blank', 'noopener,noreferrer')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive/90"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </DialogTitle>
            <DialogDescription>
              {editingResource 
                ? 'Update the details of this educational resource.' 
                : 'Create a new educational resource for artists and collectors.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="Resource Title" 
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input 
                  id="author" 
                  name="author" 
                  placeholder="Author Name" 
                  required
                  value={formData.author}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Digital Art">Digital Art</SelectItem>
                    <SelectItem value="NFTs">NFTs</SelectItem>
                    <SelectItem value="Blockchain">Blockchain</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="external_url">External URL</Label>
              <Input 
                id="external_url" 
                name="external_url" 
                placeholder="https://example.com/resource" 
                value={formData.external_url || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Brief description of the resource" 
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="is_published" 
                checked={formData.is_published} 
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_published">Published</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingResource ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEducation;
