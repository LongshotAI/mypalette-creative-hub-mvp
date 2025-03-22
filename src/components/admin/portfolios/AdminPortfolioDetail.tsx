
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Image, Edit, Trash, Eye, Save, Loader2 } from 'lucide-react';
import { Artwork, Portfolio } from '@/types/portfolio';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useArtworks } from '@/hooks/artwork';
import { getReadableDate } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminPortfolioDetailProps {
  portfolioId: string;
  onBack: () => void;
}

const AdminPortfolioDetail = ({ portfolioId, onBack }: AdminPortfolioDetailProps) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [ownerData, setOwnerData] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    for_sale: false
  });

  const {
    artworks,
    loadPortfolioArtworks,
    handleDeleteArtwork
  } = useArtworks(portfolio?.user_id);

  useEffect(() => {
    const loadPortfolioDetails = async () => {
      try {
        setLoading(true);
        console.log('Loading portfolio details for:', portfolioId);
        
        // Get portfolio details
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('id', portfolioId)
          .single();
        
        if (portfolioError) {
          console.error('Error fetching portfolio:', portfolioError);
          throw portfolioError;
        }
        
        setPortfolio(portfolioData);
        
        // Get owner information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, contact_email')
          .eq('id', portfolioData.user_id)
          .single();
        
        if (profileError) {
          console.warn('Error fetching owner data:', profileError);
        } else {
          setOwnerData({
            name: profileData.full_name || 'Unknown User',
            email: profileData.contact_email || 'No email'
          });
        }
        
        // Load artwork data
        if (portfolioData.user_id) {
          await loadPortfolioArtworks(portfolioId);
        }
      } catch (error) {
        console.error('Error loading portfolio details:', error);
        toast.error('Failed to load portfolio details');
      } finally {
        setLoading(false);
      }
    };
    
    loadPortfolioDetails();
  }, [portfolioId, loadPortfolioArtworks]);

  const handleEditArtwork = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setEditForm({
      title: artwork.title,
      description: artwork.description || '',
      price: artwork.price?.toString() || '',
      currency: artwork.currency || 'USD',
      for_sale: artwork.for_sale || false
    });
  };

  const handleUpdateArtwork = async () => {
    if (!editingArtwork) return;
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('artworks')
        .update({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price ? parseFloat(editForm.price) : null,
          currency: editForm.currency,
          for_sale: editForm.for_sale
        })
        .eq('id', editingArtwork.id);
      
      if (error) {
        console.error('Error updating artwork:', error);
        toast.error('Failed to update artwork');
        return;
      }
      
      toast.success('Artwork updated successfully');
      setEditingArtwork(null);
      
      // Reload artwork data
      if (portfolio?.id) {
        await loadPortfolioArtworks(portfolio.id);
      }
    } catch (error) {
      console.error('Error updating artwork:', error);
      toast.error('Failed to update artwork');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!artworkToDelete || !portfolio?.id) return;
    
    setDeleting(true);
    
    try {
      await handleDeleteArtwork(artworkToDelete.id, portfolio.id);
      setArtworkToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      case 'ETH': return 'Ξ ';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!portfolio) {
    return (
      <Card>
        <CardHeader>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <CardTitle>Portfolio Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested portfolio could not be found or you don't have permission to view it.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Portfolios
          </Button>
          <CardTitle>{portfolio.name}</CardTitle>
          <CardDescription>
            Admin Management View
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link to={`/portfolio/${portfolio.id}`} target="_blank">
              <Eye className="h-4 w-4 mr-1" />
              View Live
            </Link>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Portfolio Details</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>{portfolio.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Owner</TableCell>
                  <TableCell>
                    {ownerData?.name} 
                    {ownerData?.email && <div className="text-sm text-muted-foreground">{ownerData.email}</div>}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Created</TableCell>
                  <TableCell>{getReadableDate(portfolio.created_at)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Template</TableCell>
                  <TableCell>
                    <Badge variant="outline">{portfolio.template}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Visibility</TableCell>
                  <TableCell>
                    {portfolio.is_public ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">Public</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Private</Badge>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Description</TableCell>
                  <TableCell>{portfolio.description || "No description provided."}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Portfolio Statistics</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Artworks</TableCell>
                  <TableCell>{artworks.length}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">For Sale</TableCell>
                  <TableCell>{artworks.filter(a => a.for_sale).length} artworks</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Last Updated</TableCell>
                  <TableCell>{getReadableDate(portfolio.updated_at)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Portfolio Artworks</h3>
          </div>
          
          {artworks.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No artworks found in this portfolio</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artworks.map((artwork) => (
                <div key={artwork.id} className="border rounded-md overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={artwork.image_url} 
                      alt={artwork.title} 
                      className="w-full h-full object-cover"
                    />
                    {artwork.for_sale && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        For Sale
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{artwork.title}</h3>
                    {artwork.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {artwork.description}
                      </p>
                    )}
                    {artwork.for_sale && artwork.price && (
                      <p className="text-sm text-green-600 mt-1">
                        {renderCurrencySymbol(artwork.currency)}
                        {artwork.price}
                        {' '}
                        {!['USD', 'EUR', 'GBP', 'JPY', 'ETH'].includes(artwork.currency) && artwork.currency}
                      </p>
                    )}
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditArtwork(artwork)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setArtworkToDelete(artwork)}
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <Trash className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Edit Artwork Dialog */}
      <Dialog 
        open={editingArtwork !== null} 
        onOpenChange={(open) => {
          if (!open) setEditingArtwork(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Artwork</DialogTitle>
            <DialogDescription>
              Update the artwork details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-for-sale"
                checked={editForm.for_sale}
                onChange={(e) => setEditForm({...editForm, for_sale: e.target.checked})}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="edit-for-sale">For Sale</Label>
            </div>
            
            {editForm.for_sale && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Currency</Label>
                  <select
                    id="edit-currency"
                    value={editForm.currency}
                    onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="ETH">ETH (Ξ)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingArtwork(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateArtwork}
              disabled={saving || !editForm.title}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={artworkToDelete !== null} onOpenChange={(open) => {
        if (!open) setArtworkToDelete(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{artworkToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminPortfolioDetail;
