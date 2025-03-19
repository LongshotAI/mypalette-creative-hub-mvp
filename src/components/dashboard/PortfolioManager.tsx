import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Image, Plus, Edit, Trash2, Loader2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, getUserPortfolios } from '@/lib/supabase';
import { toast } from 'sonner';

interface Portfolio {
  id: string;
  name: string;
  description: string;
  template: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
}

interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number | null;
  currency: string;
  for_sale: boolean;
  portfolio_id: string;
  created_at: string;
}

const PortfolioManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(null);
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [artworkFormOpen, setArtworkFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');
  
  const [portfolioForm, setPortfolioForm] = useState({
    name: '',
    description: '',
    template: 'grid',
    is_public: true
  });
  
  const [artworkForm, setArtworkForm] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    currency: 'USD',
    for_sale: false
  });
  
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  useEffect(() => {
    if (user) {
      loadUserPortfolios();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioArtworks(selectedPortfolio);
    }
  }, [selectedPortfolio, sortOrder]);

  const loadUserPortfolios = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const portfolioData = await getUserPortfolios(user.id);
      setPortfolios(portfolioData);
      
      if (portfolioData.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(portfolioData[0].id);
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
      toast.error('Failed to load your portfolios');
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioArtworks = async (portfolioId: string) => {
    try {
      let query = supabase
        .from('artworks')
        .select('*')
        .eq('portfolio_id', portfolioId);
      
      switch (sortOrder) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setArtworks(data || []);
    } catch (error) {
      console.error('Error loading artworks:', error);
      toast.error('Failed to load portfolio artworks');
    }
  };

  const handleCreatePortfolio = async () => {
    if (!user) return;
    
    setFormSubmitting(true);
    
    try {
      const newPortfolio = {
        user_id: user.id,
        name: portfolioForm.name,
        description: portfolioForm.description,
        template: portfolioForm.template,
        is_public: portfolioForm.is_public
      };
      
      let { data, error } = await supabase
        .from('portfolios')
        .insert([newPortfolio])
        .select();
      
      if (error) throw error;
      
      toast.success('Portfolio created successfully');
      setPortfolioFormOpen(false);
      
      setPortfolioForm({
        name: '',
        description: '',
        template: 'grid',
        is_public: true
      });
      
      await loadUserPortfolios();
      
      if (data && data.length > 0) {
        setSelectedPortfolio(data[0].id);
      }
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error('Failed to create portfolio');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio) return;
    
    setFormSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          name: portfolioForm.name,
          description: portfolioForm.description,
          template: portfolioForm.template,
          is_public: portfolioForm.is_public
        })
        .eq('id', editingPortfolio.id);
      
      if (error) throw error;
      
      toast.success('Portfolio updated successfully');
      setPortfolioFormOpen(false);
      
      setPortfolioForm({
        name: '',
        description: '',
        template: 'grid',
        is_public: true
      });
      
      setEditingPortfolio(null);
      
      await loadUserPortfolios();
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error('Failed to update portfolio');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio? This will also delete all artworks in it.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);
      
      if (error) throw error;
      
      toast.success('Portfolio deleted successfully');
      
      await loadUserPortfolios();
      
      if (selectedPortfolio === portfolioId) {
        if (portfolios.length > 0) {
          setSelectedPortfolio(portfolios[0].id);
        } else {
          setSelectedPortfolio(null);
        }
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error('Failed to delete portfolio');
    }
  };

  const handleArtworkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be less than 15MB');
      return;
    }
    
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      toast.error('File must be an image (JPG, PNG, or GIF)');
      return;
    }
    
    setImageUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);
      
      setArtworkForm({
        ...artworkForm,
        image_url: publicUrl
      });
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleCreateArtwork = async () => {
    if (!user || !selectedPortfolio) return;
    
    setFormSubmitting(true);
    
    try {
      if (!artworkForm.image_url) {
        toast.error('Please upload an image for your artwork');
        setFormSubmitting(false);
        return;
      }
      
      const newArtwork = {
        portfolio_id: selectedPortfolio,
        title: artworkForm.title,
        description: artworkForm.description,
        image_url: artworkForm.image_url,
        price: artworkForm.price ? parseFloat(artworkForm.price) : null,
        currency: artworkForm.currency,
        for_sale: artworkForm.for_sale
      };
      
      const { error } = await supabase
        .from('artworks')
        .insert([newArtwork]);
      
      if (error) throw error;
      
      toast.success('Artwork added successfully');
      setArtworkFormOpen(false);
      
      setArtworkForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        currency: 'USD',
        for_sale: false
      });
      
      await loadPortfolioArtworks(selectedPortfolio);
    } catch (error) {
      console.error('Error creating artwork:', error);
      toast.error('Failed to add artwork');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleUpdateArtwork = async () => {
    if (!editingArtwork) return;
    
    setFormSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('artworks')
        .update({
          title: artworkForm.title,
          description: artworkForm.description,
          image_url: artworkForm.image_url,
          price: artworkForm.price ? parseFloat(artworkForm.price) : null,
          currency: artworkForm.currency,
          for_sale: artworkForm.for_sale
        })
        .eq('id', editingArtwork.id);
      
      if (error) throw error;
      
      toast.success('Artwork updated successfully');
      setArtworkFormOpen(false);
      
      setArtworkForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        currency: 'USD',
        for_sale: false
      });
      
      setEditingArtwork(null);
      
      await loadPortfolioArtworks(selectedPortfolio!);
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('artworks')
        .delete()
        .eq('id', artworkId);
      
      if (error) throw error;
      
      toast.success('Artwork deleted successfully');
      
      await loadPortfolioArtworks(selectedPortfolio!);
    } catch (error) {
      console.error('Error deleting artwork:', error);
      toast.error('Failed to delete artwork');
    }
  };

  const editPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setPortfolioForm({
      name: portfolio.name,
      description: portfolio.description,
      template: portfolio.template,
      is_public: portfolio.is_public
    });
    setPortfolioFormOpen(true);
  };

  const editArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setArtworkForm({
      title: artwork.title,
      description: artwork.description,
      image_url: artwork.image_url,
      price: artwork.price?.toString() || '',
      currency: artwork.currency,
      for_sale: artwork.for_sale
    });
    setArtworkFormOpen(true);
  };

  if (loading && portfolios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Portfolios...</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="portfolios">
        <TabsList>
          <TabsTrigger value="portfolios">Your Portfolios</TabsTrigger>
          <TabsTrigger value="artworks">Manage Artworks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="portfolios" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Portfolios</h2>
            
            <Dialog open={portfolioFormOpen} onOpenChange={setPortfolioFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingPortfolio(null);
                  setPortfolioForm({
                    name: '',
                    description: '',
                    template: 'grid',
                    is_public: true
                  });
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Portfolio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPortfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPortfolio 
                      ? 'Update your portfolio details below.' 
                      : 'Create a new portfolio to showcase your artwork.'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-name">Portfolio Name</Label>
                    <Input
                      id="portfolio-name"
                      value={portfolioForm.name}
                      onChange={(e) => setPortfolioForm({...portfolioForm, name: e.target.value})}
                      placeholder="My Art Collection"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-description">Description</Label>
                    <Textarea
                      id="portfolio-description"
                      value={portfolioForm.description}
                      onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
                      placeholder="A collection of my latest artwork..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-template">Display Template</Label>
                    <Select
                      value={portfolioForm.template}
                      onValueChange={(value) => setPortfolioForm({...portfolioForm, template: value})}
                    >
                      <SelectTrigger id="portfolio-template">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="masonry">Masonry Layout</SelectItem>
                        <SelectItem value="slideshow">Slideshow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="portfolio-visibility"
                      checked={portfolioForm.is_public}
                      onChange={(e) => setPortfolioForm({...portfolioForm, is_public: e.target.checked})}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="portfolio-visibility">Public Portfolio</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPortfolioFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingPortfolio ? handleUpdatePortfolio : handleCreatePortfolio}
                    disabled={formSubmitting || !portfolioForm.name}
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingPortfolio ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingPortfolio ? 'Update Portfolio' : 'Create Portfolio'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {portfolios.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Portfolios Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first portfolio to showcase your artwork.
                  </p>
                  <Button onClick={() => setPortfolioFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Portfolio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {portfolios.map((portfolio) => (
                <Card key={portfolio.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle>{portfolio.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {portfolio.description || 'No description provided.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <span className="mr-3">
                        Template: {portfolio.template.charAt(0).toUpperCase() + portfolio.template.slice(1)}
                      </span>
                      <span>
                        Visibility: {portfolio.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedPortfolio(portfolio.id)}>
                      View Artworks
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => editPortfolio(portfolio)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="artworks" className="space-y-6 pt-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl font-semibold">Portfolio Artworks</h2>
              
              {

