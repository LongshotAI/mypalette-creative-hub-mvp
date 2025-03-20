
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  getEducationResources, 
  getEducationCategories,
  createOrUpdateEducationResource, 
  deleteEducationResource 
} from '@/lib/supabase';
import { Loader2, RefreshCcw, Plus, Pencil, Trash2 } from 'lucide-react';

interface ResourceData {
  id?: string;
  title: string;
  description: string;
  content: string;
  author: string;
  category: string;
  type: string;
  image_url: string;
}

const ResourceManagement: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<ResourceData | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ResourceData>({
    title: '',
    description: '',
    content: '',
    author: '',
    category: '',
    type: 'article',
    image_url: '',
  });

  const loadResources = async () => {
    setLoading(true);
    const data = await getEducationResources();
    setResources(data);
    const cats = await getEducationCategories();
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleCreateClick = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      author: '',
      category: '',
      type: 'article',
      image_url: '',
    });
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (resource: any) => {
    setFormData({
      id: resource.id,
      title: resource.title,
      description: resource.description || '',
      content: resource.content || '',
      author: resource.author,
      category: resource.category,
      type: resource.type,
      image_url: resource.image_url || '',
    });
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (resource: any) => {
    setSelectedResource(resource);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Validate form
    if (!formData.title || !formData.author || !formData.category || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const result = await createOrUpdateEducationResource(formData);
    
    if (result) {
      toast.success(formData.id ? 'Resource updated successfully' : 'Resource created successfully');
      loadResources();
      setIsFormDialogOpen(false);
    } else {
      toast.error('Failed to save resource');
    }
  };

  const handleDelete = async () => {
    if (!selectedResource?.id) return;

    const success = await deleteEducationResource(selectedResource.id);
    
    if (success) {
      toast.success('Resource deleted successfully');
      loadResources();
    } else {
      toast.error('Failed to delete resource');
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
        <h2 className="text-xl font-semibold">Education Resources</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadResources} className="gap-2">
            <RefreshCcw size={16} />
            Refresh
          </Button>
          <Button onClick={handleCreateClick} className="gap-2">
            <Plus size={16} />
            New Resource
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No resources found
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.title}</TableCell>
                  <TableCell>{resource.author}</TableCell>
                  <TableCell>{resource.category}</TableCell>
                  <TableCell>{resource.type}</TableCell>
                  <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(resource)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteClick(resource)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog for Create/Edit */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Resource' : 'Create Resource'}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Resource title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Author *</label>
                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Author name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Input
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="E.g., NFT Basics, Marketing, Techniques"
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="guide">Guide</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="Image URL (optional)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Short description of the resource"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Full content (markdown supported)"
                rows={8}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {formData.id ? 'Update Resource' : 'Create Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedResource?.title}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceManagement;
