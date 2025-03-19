
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Edit, Trash2, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Artwork } from '@/types/portfolio';

interface ArtworkListProps {
  artworks: Artwork[];
  selectedPortfolio: string | null;
  sortOrder: 'newest' | 'oldest' | 'price_high' | 'price_low';
  onSortChange: (value: 'newest' | 'oldest' | 'price_high' | 'price_low') => void;
  onAddArtwork: () => void;
  onEditArtwork: (artwork: Artwork) => void;
  onDeleteArtwork: (artworkId: string) => void;
}

const ArtworkList = ({
  artworks,
  selectedPortfolio,
  sortOrder,
  onSortChange,
  onAddArtwork,
  onEditArtwork,
  onDeleteArtwork
}: ArtworkListProps) => {
  if (!selectedPortfolio) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a portfolio to view and manage artworks.
        </AlertDescription>
      </Alert>
    );
  }

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

  if (artworks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Artworks Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first artwork to this portfolio.
            </p>
            <Button onClick={onAddArtwork}>
              <Upload className="h-4 w-4 mr-2" />
              Add Artwork
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="flex flex-wrap gap-2">
          <Select 
            value={sortOrder} 
            onValueChange={(value: any) => onSortChange(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={onAddArtwork}>
            <Upload className="h-4 w-4 mr-2" />
            Add Artwork
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-square overflow-hidden">
              <img 
                src={artwork.image_url} 
                alt={artwork.title}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle>{artwork.title}</CardTitle>
              {artwork.description && (
                <CardDescription className="line-clamp-2">
                  {artwork.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pb-2">
              {artwork.for_sale && artwork.price !== null && (
                <div className="font-medium text-primary">
                  {renderCurrencySymbol(artwork.currency)}
                  {artwork.price}
                  {' '}
                  {!['USD', 'EUR', 'GBP', 'JPY', 'ETH'].includes(artwork.currency) && artwork.currency}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEditArtwork(artwork)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeleteArtwork(artwork.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ArtworkList;
