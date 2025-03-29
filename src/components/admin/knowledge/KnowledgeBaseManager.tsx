
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Trash2, RefreshCw, Database } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserKnowledgeItems, 
  addKnowledgeItem, 
  updateKnowledgeItem, 
  deleteKnowledgeItem 
} from '@/services/api/knowledgeBase.api';
import { seedPPNKnowledgeBase } from '@/services/api/knowledgeBaseSeeding';
import type { KnowledgeItem } from '@/services/api/knowledgeBase.api';

const KnowledgeBaseManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSeedingLoading, setIsSeedingLoading] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<KnowledgeItem>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      loadKnowledgeItems();
    }
  }, [user]);

  const loadKnowledgeItems = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await getUserKnowledgeItems(user.id);
      if (response.status === 'success' && response.data) {
        setKnowledgeItems(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load knowledge base items",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading knowledge items:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = () => {
    setIsEditMode(false);
    setCurrentItem({ title: '', content: '' });
    setIsFormOpen(true);
  };

  const handleEditItem = (item: KnowledgeItem) => {
    setIsEditMode(true);
    setCurrentItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this knowledge item?")) {
      try {
        const response = await deleteKnowledgeItem(id);
        if (response.status === 'success') {
          toast({
            title: "Success",
            description: "Knowledge item deleted successfully"
          });
          loadKnowledgeItems();
        } else {
          toast({
            title: "Error",
            description: response.error?.message || "Failed to delete knowledge item",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error deleting knowledge item:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !currentItem.title || !currentItem.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive"
      });
      return;
    }

    try {
      let response;
      if (isEditMode && currentItem.id) {
        response = await updateKnowledgeItem(currentItem.id, {
          title: currentItem.title,
          content: currentItem.content
        });
      } else {
        response = await addKnowledgeItem(
          currentItem.title,
          currentItem.content,
          user.id
        );
      }

      if (response.status === 'success') {
        toast({
          title: "Success",
          description: `Knowledge item ${isEditMode ? 'updated' : 'added'} successfully`
        });
        setIsFormOpen(false);
        loadKnowledgeItems();
      } else {
        toast({
          title: "Error",
          description: response.error?.message || `Failed to ${isEditMode ? 'update' : 'add'} knowledge item`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting knowledge item:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const handleSeedPPNKnowledge = async () => {
    if (!user?.id) return;
    
    setIsSeedingLoading(true);
    try {
      const response = await seedPPNKnowledgeBase(user.id);
      if (response.status === 'success' && response.data) {
        toast({
          title: "Success",
          description: `Successfully seeded ${response.data.count} PPN knowledge items`,
        });
        loadKnowledgeItems();
      } else {
        toast({
          title: "Error",
          description: "Failed to seed PPN knowledge base items",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error seeding PPN knowledge:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSeedingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Knowledge Base Management</span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={loadKnowledgeItems} 
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleAddItem}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleSeedPPNKnowledge} 
                disabled={isSeedingLoading}
              >
                <Database className="h-4 w-4 mr-2" />
                Seed PPN Knowledge
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage knowledge base entries for AI chat assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {knowledgeItems.length === 0 ? (
            <Alert>
              <AlertTitle>No Knowledge Items</AlertTitle>
              <AlertDescription>
                You haven't added any knowledge base items yet. Add items to enhance AI chat responses.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content Preview</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {knowledgeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {item.content.substring(0, 100)}
                      {item.content.length > 100 ? '...' : ''}
                    </TableCell>
                    <TableCell>
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Knowledge Item' : 'Add Knowledge Item'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? 'Update knowledge base information to enhance AI responses'
                : 'Add new information to the knowledge base to enhance AI responses'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">Title</label>
              <Input 
                id="title"
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                placeholder="Enter a descriptive title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <Textarea 
                id="content"
                value={currentItem.content || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, content: e.target.value })}
                placeholder="Enter the knowledge content"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {isEditMode ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBaseManager;
