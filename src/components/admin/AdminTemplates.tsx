
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PortfolioTemplate } from '@/types/portfolio';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash, Pencil, EyeOff, Eye, Code } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  updatePortfolioTemplate,
  addPortfolioTemplate,
  deletePortfolioTemplate
} from '@/lib/supabase';

const AdminTemplates = () => {
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<PortfolioTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    preview_image_url: '',
    is_active: true
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('portfolio_templates')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Ensure settings is treated as Record<string, any>
      const templatesWithSettings = data?.map(template => ({
        ...template,
        settings: template.settings as Record<string, any>
      })) as PortfolioTemplate[];
      
      setTemplates(templatesWithSettings);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }
    
    setSubmitting(true);
    
    try {
      if (editing) {
        // Update existing template
        const result = await updatePortfolioTemplate(editing.id, {
          name: formData.name,
          description: formData.description,
          preview_image_url: formData.preview_image_url || null,
          is_active: formData.is_active
        });
        
        if (!result) throw new Error('Error updating template');
        
        toast.success('Template updated successfully');
      } else {
        // Create new template
        const result = await addPortfolioTemplate({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          preview_image_url: formData.preview_image_url || null,
          is_active: formData.is_active,
          settings: {}
        });
        
        if (!result) throw new Error('Error creating template');
        
        toast.success('Template created successfully');
      }
      
      // Reset form and close dialog
      setFormOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Error submitting template:', error);
      toast.error('Failed to save template');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (template: PortfolioTemplate) => {
    setEditing(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      description: template.description || '',
      preview_image_url: template.preview_image_url || '',
      is_active: template.is_active
    });
    setFormOpen(true);
  };

  const handleToggleActive = async (template: PortfolioTemplate) => {
    try {
      const result = await updatePortfolioTemplate(template.id, { 
        is_active: !template.is_active 
      });
      
      if (!result) throw new Error('Failed to update template status');
      
      toast.success(`Template ${template.is_active ? 'disabled' : 'enabled'}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
      toast.error('Failed to update template status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }
    
    try {
      const success = await deletePortfolioTemplate(id);
      
      if (!success) throw new Error('Failed to delete template');
      
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      preview_image_url: '',
      is_active: true
    });
  };

  const openTemplateCodeEditor = (template: PortfolioTemplate) => {
    toast.info(`Template code editing for "${template.name}" is not yet implemented. It will allow customizing the template's appearance and behavior.`);
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Portfolio Templates</CardTitle>
            <CardDescription>
              Manage the portfolio template options available to users
            </CardDescription>
          </div>
          <Button 
            onClick={() => {
              resetForm();
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        No templates found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.slug}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {template.description || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            template.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(template)}
                              title="Edit template details"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openTemplateCodeEditor(template)}
                              title="Edit template code"
                            >
                              <Code className="h-4 w-4" />
                              <span className="sr-only">Code</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(template)}
                              title={template.is_active ? 'Disable template' : 'Enable template'}
                            >
                              {template.is_active ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">
                                {template.is_active ? 'Disable' : 'Enable'}
                              </span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(template.id)}
                              title="Delete template"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
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

      {/* Template Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Portfolio Template' : 'Add Portfolio Template'}
            </DialogTitle>
            <DialogDescription>
              {editing 
                ? 'Update the details for this portfolio template' 
                : 'Create a new portfolio template option for users'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Grid Layout"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (used in code)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="grid"
                disabled={!!editing}
              />
              {editing && (
                <p className="text-sm text-muted-foreground">
                  Slug cannot be changed after creation
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="A clean grid layout for showcasing multiple artworks"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preview_image_url">Preview Image URL</Label>
              <Input
                id="preview_image_url"
                value={formData.preview_image_url}
                onChange={(e) => setFormData({...formData, preview_image_url: e.target.value})}
                placeholder="https://example.com/template-preview.jpg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.slug}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editing ? 'Update Template' : 'Create Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTemplates;
