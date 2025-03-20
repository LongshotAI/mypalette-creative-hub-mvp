
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { PortfolioFormData, Portfolio, PortfolioTemplate } from '@/types/portfolio';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

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
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('portfolio_templates')
          .select('*')
          .eq('is_active', true)
          .order('name');
          
        if (error) throw error;
        
        // Transform the data to ensure settings is treated as Record<string, any>
        const transformedData = data?.map(template => ({
          ...template,
          settings: template.settings as Record<string, any>
        })) || [];
        
        setTemplates(transformedData);
      } catch (err) {
        console.error('Error fetching templates:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button id="create-portfolio-button">
          <Plus className="h-4 w-4 mr-2" />
          Create New Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
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
          
          <div className="space-y-3">
            <Label>Layout Template</Label>
            {loading ? (
              <div className="py-4 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <RadioGroup
                value={portfolioForm.template}
                onValueChange={(value) => setPortfolioForm({...portfolioForm, template: value})}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {templates.map((template) => (
                  <div key={template.slug} className="relative">
                    <RadioGroupItem
                      value={template.slug}
                      id={`template-${template.slug}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`template-${template.slug}`}
                      className="cursor-pointer"
                    >
                      <Card className={`overflow-hidden hover:border-primary/50 transition-colors ${
                        portfolioForm.template === template.slug ? 'border-primary ring-2 ring-primary/20' : ''
                      }`}>
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          {template.preview_image_url ? (
                            <img 
                              src={template.preview_image_url} 
                              alt={template.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              <span className="text-muted-foreground">{template.name}</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{template.name}</div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio-theme">Color Theme</Label>
            <Select
              value={portfolioForm.theme}
              onValueChange={(value) => setPortfolioForm({...portfolioForm, theme: value})}
            >
              <SelectTrigger id="portfolio-theme">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="bold">Bold Colors</SelectItem>
                <SelectItem value="elegant">Elegant</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
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
