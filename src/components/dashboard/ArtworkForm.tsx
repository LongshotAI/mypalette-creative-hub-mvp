
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { ArtworkFormData, Artwork } from '@/types/portfolio';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Artwork' : 'Add New Artwork'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your artwork details below.' 
              : 'Add a new artwork to your portfolio.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="artwork-title">Title</Label>
            <Input
              id="artwork-title"
              value={artworkForm.title}
              onChange={(e) => setArtworkForm({...artworkForm, title: e.target.value})}
              placeholder="Untitled Artwork"
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
          
          <div className="space-y-2">
            <Label htmlFor="artwork-image">Artwork Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="artwork-image"
                type="file"
                disabled={isUploading}
                onChange={onImageUpload}
                accept="image/jpeg,image/png,image/gif"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {artworkForm.image_url && (
              <div className="mt-2">
                <img
                  src={artworkForm.image_url}
                  alt="Artwork preview"
                  className="max-h-40 rounded-md object-contain"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="artwork-for-sale"
              checked={artworkForm.for_sale}
              onChange={(e) => setArtworkForm({...artworkForm, for_sale: e.target.checked})}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="artwork-for-sale">For Sale</Label>
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
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                    <SelectItem value="ETH">ETH (Ξ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting || !artworkForm.title || !artworkForm.image_url}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Update Artwork' : 'Add Artwork'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkForm;
