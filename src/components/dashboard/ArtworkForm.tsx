
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArtworkFormData } from '@/types/portfolio';
import { Loader2, UploadCloud } from 'lucide-react';

interface ArtworkFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworkForm: ArtworkFormData;
  setArtworkForm: React.Dispatch<React.SetStateAction<ArtworkFormData>>;
  onSubmit: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  isEditing: boolean;
}

const ArtworkForm = ({
  open,
  onOpenChange,
  artworkForm,
  setArtworkForm,
  onSubmit,
  onImageUpload,
  isSubmitting,
  isUploading,
  isEditing
}: ArtworkFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Artwork' : 'Add New Artwork'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={artworkForm.title}
                onChange={(e) => setArtworkForm({ ...artworkForm, title: e.target.value })}
                placeholder="Enter artwork title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={artworkForm.description}
                onChange={(e) => setArtworkForm({ ...artworkForm, description: e.target.value })}
                placeholder="Describe your artwork"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Artwork Image</Label>
              {artworkForm.image_url ? (
                <div className="relative">
                  <img 
                    src={artworkForm.image_url} 
                    alt="Artwork preview" 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setArtworkForm({ ...artworkForm, image_url: '' })}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-4 text-center relative">
                  <input
                    type="file"
                    id="image_upload"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center h-32">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click or drag to upload image</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="for_sale"
                checked={artworkForm.for_sale}
                onCheckedChange={(checked) => setArtworkForm({ ...artworkForm, for_sale: checked })}
              />
              <Label htmlFor="for_sale">This artwork is for sale</Label>
            </div>
            
            {artworkForm.for_sale && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={artworkForm.price}
                    onChange={(e) => setArtworkForm({ ...artworkForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    value={artworkForm.currency}
                    onChange={(e) => setArtworkForm({ ...artworkForm, currency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="listing_url">External Listing URL (Optional)</Label>
              <Input
                id="listing_url"
                value={artworkForm.listing_url || ''}
                onChange={(e) => setArtworkForm({ ...artworkForm, listing_url: e.target.value })}
                placeholder="https://marketplace.com/your-artwork"
              />
              <p className="text-xs text-muted-foreground">
                Add a link to an external marketplace where this artwork is listed
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || isUploading || !artworkForm.title || !artworkForm.image_url}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Artwork' : 'Add Artwork'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkForm;
