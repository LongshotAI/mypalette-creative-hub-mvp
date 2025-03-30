
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, Trash } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const KnowledgeBaseManager: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchKnowledgeBase();
  }, []);
  
  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      toast.error('Failed to load knowledge base');
    } finally {
      setLoading(false);
    }
  };
  
  const addKnowledgeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('knowledge_base')
        .insert([
          { title: newTitle, content: newContent }
        ]);
        
      if (error) throw error;
      
      toast.success('Knowledge item added successfully');
      setNewTitle('');
      setNewContent('');
      fetchKnowledgeBase();
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      toast.error('Failed to add knowledge item');
    } finally {
      setSubmitting(false);
    }
  };
  
  const deleteKnowledgeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Knowledge item deleted');
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting knowledge item:', error);
      toast.error('Failed to delete knowledge item');
    }
  };
  
  return (
    <Tabs defaultValue="manage">
      <TabsList className="mb-4">
        <TabsTrigger value="manage">Manage Knowledge</TabsTrigger>
        <TabsTrigger value="add">Add New</TabsTrigger>
      </TabsList>
      
      <TabsContent value="manage">
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Base Items</CardTitle>
            <CardDescription>
              Manage knowledge for the AI assistant to use when responding to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No knowledge base items found. Add some to enhance the AI assistant.
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="p-4 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{item.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => deleteKnowledgeItem(item.id)}
                        >
                          <Trash size={16} />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-4 text-sm whitespace-pre-wrap">
                      {item.content}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="add">
        <Card>
          <CardHeader>
            <CardTitle>Add Knowledge Item</CardTitle>
            <CardDescription>
              Add new information to the knowledge base for the AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={addKnowledgeItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the knowledge content here"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="min-h-[200px]"
                  required
                />
              </div>
              
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Knowledge Base
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default KnowledgeBaseManager;
