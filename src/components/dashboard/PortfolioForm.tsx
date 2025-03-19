
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { PortfolioFormData, Portfolio } from '@/types/portfolio';

interface PortfolioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioForm: PortfolioFormData;
  setPortfolioForm: React.Dispatch<React.SetStateAction<PortfolioFormData>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

const PortfolioForm = ({
  open,
  onOpenChange,
  portfolioForm,
  setPortfolioForm,
  onSubmit,
  isSubmitting,
  isEditing
}: PortfolioFormProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button id="create-portfolio-button">
          <Plus className="h-4 w-4 mr-2" />
          Create New Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Portfolio' : 'Create New Portfolio'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting || !portfolioForm.name}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Portfolio' : 'Create Portfolio'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioForm;
