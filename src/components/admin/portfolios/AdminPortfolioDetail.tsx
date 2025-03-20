
import React from 'react';
import { useArtworks } from '@/hooks/artwork';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Image, Edit, Trash } from 'lucide-react';

interface AdminPortfolioDetailProps {
  portfolioId: string;
  userId: string;
  onBack: () => void;
}

const AdminPortfolioDetail = ({ portfolioId, userId, onBack }: AdminPortfolioDetailProps) => {
  const {
    artworks,
    loading,
    loadPortfolioArtworks,
    handleDeleteArtwork
  } = useArtworks(userId);

  React.useEffect(() => {
    if (portfolioId) {
      loadPortfolioArtworks(portfolioId);
    }
  }, [portfolioId, loadPortfolioArtworks]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <CardTitle>Portfolio Artworks</CardTitle>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Artwork
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading artworks...</div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-8">
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
                  {artwork.price && (
                    <p className="text-sm text-green-600">
                      {artwork.currency} {artwork.price}
                    </p>
                  )}
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteArtwork(artwork.id, portfolioId)}
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
      </CardContent>
    </Card>
  );
};

export default AdminPortfolioDetail;
