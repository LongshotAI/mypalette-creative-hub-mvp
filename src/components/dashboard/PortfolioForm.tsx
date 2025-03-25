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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface PortfolioFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioForm: PortfolioFormData;
  setPortfolioForm: React.Dispatch<React.SetStateAction<PortfolioFormData>>;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

// Define static templates in case the database fetch fails
const defaultTemplates: PortfolioTemplate[] = [
  {
    id: '1',
    name: 'Grid',
    slug: 'grid',
    description: 'A clean grid layout for showcasing multiple artworks',
    preview_image_url: null,
    settings: {},
    is_active: true,
    created_at: ''
  },
  {
    id: '2',
    name: 'Masonry',
    slug: 'masonry',
    description: 'A pinterest-style masonry layout for varied artwork sizes',
    preview_image_url: null,
    settings: {},
    is_active: true,
    created_at: ''
  },
  {
    id: '3',
    name: 'Slideshow',
    slug: 'slideshow',
    description: 'A fullscreen slideshow to showcase one artwork at a time',
    preview_image_url: null,
    settings: {},
    is_active: true,
    created_at: ''
  },
  {
    id: '4',
    name: 'Minimal',
    slug: 'minimal',
    description: 'A minimal design with focus on the artwork',
    preview_image_url: null,
    settings: {},
    is_active: true,
    created_at: ''
  },
  {
    id: '5',
    name: 'Gallery',
    slug: 'gallery',
    description: 'A professional gallery-style layout with image zoom',
    preview_image_url: null,
    settings: {},
    is_active: true,
    created_at: ''
  },
  {
    id: '6',
    name: 'Studio',
    slug: 'studio',
    description: 'A layout that mimics an artist studio environment',
    preview_image_url: null,
    settings: {},
    is_active: true,
    created_at: ''
  }
];

const PortfolioFormDesktop = ({
  open,
  onOpenChange,
  portfolioForm,
  setPortfolioForm,
  onSubmit,
  isSubmitting,
  isEditing,
  templates
}: PortfolioFormProps & { templates: PortfolioTemplate[] }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogTrigger asChild>
      <Button id="create-portfolio-button">
        <Plus className="h-4 w-4 mr-2" />
        Create New Portfolio
      </Button>
    </DialogTrigger>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

const PortfolioFormMobile = ({
  open,
  onOpenChange,
  portfolioForm,
  setPortfolioForm,
  onSubmit,
  isSubmitting,
  isEditing,
  templates
}: PortfolioFormProps & { templates: PortfolioTemplate[] }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetTrigger asChild>
      <Button id="create-portfolio-button-mobile">
        <Plus className="h-4 w-4 mr-2" />
        Create New Portfolio
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {isEditing ? 'Edit Portfolio' : 'Create New Portfolio'}
        </SheetTitle>
        <SheetDescription>
          {isEditing 
            ? 'Update your portfolio details below.' 
            : 'Create a new portfolio to showcase your artwork.'}
        </SheetDescription>
      </SheetHeader>
      
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="portfolio-name-mobile">Portfolio Name</Label>
          <Input
            id="portfolio-name-mobile"
            value={portfolioForm.name}
            onChange={(e) => setPortfolioForm({...portfolioForm, name: e.target.value})}
            placeholder="My Art Collection"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portfolio-description-mobile">Description</Label>
          <Textarea
            id="portfolio-description-mobile"
            value={portfolioForm.description}
            onChange={(e) => setPortfolioForm({...portfolioForm, description: e.target.value})}
            placeholder="A collection of my latest artwork..."
            rows={3}
          />
        </div>
        
        <div className="space-y-3">
          <Label>Layout Template</Label>
          <RadioGroup
            value={portfolioForm.template}
            onValueChange={(value) => setPortfolioForm({...portfolioForm, template: value})}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {templates.map((template) => (
              <div key={template.slug} className="relative">
                <RadioGroupItem
                  value={template.slug}
                  id={`template-mobile-${template.slug}`}
                  className="sr-only"
                />
                <Label
                  htmlFor={`template-mobile-${template.slug}`}
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
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="portfolio-theme-mobile">Color Theme</Label>
          <Select
            value={portfolioForm.theme}
            onValueChange={(value) => setPortfolioForm({...portfolioForm, theme: value})}
          >
            <SelectTrigger id="portfolio-theme-mobile">
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
            id="portfolio-visibility-mobile"
            checked={portfolioForm.is_public}
            onChange={(e) => setPortfolioForm({...portfolioForm, is_public: e.target.checked})}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="portfolio-visibility-mobile">Public Portfolio</Label>
        </div>

        <div className="pt-4">
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting || !portfolioForm.name}
            className="w-full"
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
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

const PortfolioForm = (props: PortfolioFormProps) => {
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!props.open) return;
      
      setLoading(true);
      try {
        console.log('Fetching portfolio templates...');
        const { data, error } = await supabase
          .from('portfolio_templates')
          .select('*')
          .eq('is_active', true)
          .order('name');
          
        if (error) {
          console.error('Error fetching templates:', error);
          throw error;
        }
        
        console.log('Templates fetched:', data);
        
        // Transform the data to ensure settings is treated as Record<string, any>
        const transformedData = data?.map(template => ({
          ...template,
          settings: template.settings as Record<string, any>
        })) || [];
        
        if (transformedData.length === 0) {
          console.log('No templates found in database, using defaults');
          setTemplates(defaultTemplates);
        } else {
          setTemplates(transformedData);
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        toast.error('Failed to load portfolio templates. Using defaults.');
        setTemplates(defaultTemplates);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [props.open]);

  if (loading) {
    return <Button disabled><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</Button>;
  }

  const templatesForForm = templates.length > 0 ? templates : defaultTemplates;

  return isMobile ? (
    <PortfolioFormMobile {...props} templates={templatesForForm} />
  ) : (
    <PortfolioFormDesktop {...props} templates={templatesForForm} />
  );
};

export default PortfolioForm;
