
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Image, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
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
  
  // Form States
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
      
      // Set the first portfolio as selected if there is one
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
      
      // Apply sorting
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
      
      // Reset form
      setPortfolioForm({
        name: '',
        description: '',
        template: 'grid',
        is_public: true
      });
      
      // Refresh portfolios
      await loadUserPortfolios();
      
      // Select the new portfolio
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
      
      // Reset form and editing state
      setPortfolioForm({
        name: '',
        description: '',
        template: 'grid',
        is_public: true
      });
      
      setEditingPortfolio(null);
      
      // Refresh portfolios
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
      
      // Refresh portfolios
      await loadUserPortfolios();
      
      // If the deleted portfolio was selected, select another one
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
    
    // Validate file size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be less than 15MB');
      return;
    }
    
    // Validate file type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
      toast.error('File must be an image (JPG, PNG, or GIF)');
      return;
    }
    
    setImageUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName);
      
      // Update form state
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
      
      // Reset form
      setArtworkForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        currency: 'USD',
        for_sale: false
      });
      
      // Refresh artworks
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
      
      // Reset form and editing state
      setArtworkForm({
        title: '',
        description: '',
        image_url: '',
        price: '',
        currency: 'USD',
        for_sale: false
      });
      
      setEditingArtwork(null);
      
      // Refresh artworks
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
      
      // Refresh artworks
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
          {/* Portfolio Management */}
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
          {/* Artwork Management */}
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl font-semibold">Portfolio Artworks</h2>
              
              {/* Portfolio Selector */}
              {portfolios.length > 0 && (
                <Select
                  value={selectedPortfolio || undefined}
                  onValueChange={setSelectedPortfolio}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {/* Sort Order */}
              <Select
                value={sortOrder}
                onValueChange={(value: any) => setSortOrder(value)}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedPortfolio && (
              <Dialog open={artworkFormOpen} onOpenChange={setArtworkFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingArtwork(null);
                    setArtworkForm({
                      title: '',
                      description: '',
                      image_url: '',
                      price: '',
                      currency: 'USD',
                      for_sale: false
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Artwork
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingArtwork 
                        ? 'Update your artwork details below.' 
                        : 'Add a new artwork to your portfolio.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Artwork Image</Label>
                      {artworkForm.image_url ? (
                        <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-md border">
                          <img 
                            src={artworkForm.image_url} 
                            alt="Artwork preview" 
                            className="h-full w-full object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                            onClick={() => setArtworkForm({...artworkForm, image_url: ''})}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md">
                          <Image className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            JPG, PNG, GIF (max 15MB)
                          </p>
                          <label htmlFor="artwork-image" className="cursor-pointer">
                            <Button
                              variant="secondary"
                              disabled={imageUploading}
                              className="relative"
                              onClick={(e) => e.preventDefault()}
                            >
                              {imageUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Image
                                </>
                              )}
                            </Button>
                            <input
                              id="artwork-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleArtworkImageUpload}
                              disabled={imageUploading}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artwork-title">Title</Label>
                      <Input
                        id="artwork-title"
                        value={artworkForm.title}
                        onChange={(e) => setArtworkForm({...artworkForm, title: e.target.value})}
                        placeholder="Untitled Masterpiece"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="artwork-description">Description</Label>
                      <Textarea
                        id="artwork-description"
                        value={artworkForm.description}
                        onChange={(e) => setArtworkForm({...artworkForm, description: e.target.value})}
                        placeholder="Describe your artwork..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="artwork-for-sale"
                        checked={artworkForm.for_sale}
                        onChange={(e) => setArtworkForm({...artworkForm, for_sale: e.target.checked})}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="artwork-for-sale">Artwork For Sale</Label>
                    </div>
                    
                    {artworkForm.for_sale && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="artwork-price">Price</Label>
                          <Input
                            id="artwork-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={artworkForm.price}
                            onChange={(e) => setArtworkForm({...artworkForm, price: e.target.value})}
                            placeholder="0.00"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="artwork-currency">Currency</Label>
                          <Select
                            value={artworkForm.currency}
                            onValueChange={(value) => setArtworkForm({...artworkForm, currency: value})}
                          >
                            <SelectTrigger id="artwork-currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setArtworkFormOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={editingArtwork ? handleUpdateArtwork : handleCreateArtwork}
                      disabled={formSubmitting || !artworkForm.title || !artworkForm.image_url}
                    >
                      {formSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingArtwork ? 'Updating...' : 'Adding...'}
                        </>
                      ) : (
                        editingArtwork ? 'Update Artwork' : 'Add Artwork'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {!selectedPortfolio ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {portfolios.length === 0 
                  ? 'Create a portfolio first to add artworks.'
                  : 'Please select a portfolio to manage artworks.'}
              </AlertDescription>
            </Alert>
          ) : artworks.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Artworks Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first artwork to this portfolio.
                  </p>
                  <Button onClick={() => setArtworkFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Artwork
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {artworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={artwork.image_url} 
                      alt={artwork.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    {artwork.for_sale && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded-full">
                        {artwork.price} {artwork.currency}
                      </div>
                    )}
                  </div>
                  <CardContent className="py-3">
                    <h3 className="font-medium line-clamp-1">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {artwork.description || 'No description provided.'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t pt-3 gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => editArtwork(artwork)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteArtwork(artwork.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioManager;
