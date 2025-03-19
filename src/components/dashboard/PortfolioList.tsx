
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Edit, Trash2 } from 'lucide-react';
import { Portfolio } from '@/types/portfolio';

interface PortfolioListProps {
  portfolios: Portfolio[];
  onViewArtworks: (portfolioId: string) => void;
  onEditPortfolio: (portfolio: Portfolio) => void;
  onDeletePortfolio: (portfolioId: string) => void;
}

const PortfolioList = ({ 
  portfolios, 
  onViewArtworks, 
  onEditPortfolio, 
  onDeletePortfolio 
}: PortfolioListProps) => {
  if (portfolios.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Portfolios Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first portfolio to showcase your artwork.
            </p>
            <Button onClick={() => document.getElementById('create-portfolio-button')?.click()}>
              Create Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <Button variant="outline" size="sm" onClick={() => onViewArtworks(portfolio.id)}>
              View Artworks
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEditPortfolio(portfolio)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeletePortfolio(portfolio.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PortfolioList;
