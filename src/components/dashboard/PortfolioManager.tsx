
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePortfolios } from '@/hooks/portfolio';
import { useArtworks } from '@/hooks/useArtworks';
import PortfolioList from './PortfolioList';
import ArtworkList from './ArtworkList';
import PortfolioForm from './PortfolioForm';
import ArtworkForm from './ArtworkForm';

const PortfolioManager = () => {
  const { user } = useAuth();
  const {
    portfolios,
    selectedPortfolio,
    setSelectedPortfolio,
    loading,
    portfolioFormOpen,
    setPortfolioFormOpen,
    formSubmitting: portfolioFormSubmitting,
    editingPortfolio,
    portfolioForm,
    setPortfolioForm,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    editPortfolio,
    resetPortfolioForm
  } = usePortfolios(user?.id);

  const {
    artworks,
    artworkFormOpen,
    setArtworkFormOpen,
    formSubmitting: artworkFormSubmitting,
    imageUploading,
    sortOrder,
    setSortOrder,
    editingArtwork,
    artworkForm,
    setArtworkForm,
    loadPortfolioArtworks,
    handleArtworkImageUpload,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    editArtwork,
    resetArtworkForm
  } = useArtworks(user?.id);

  useEffect(() => {
    if (selectedPortfolio) {
      loadPortfolioArtworks(selectedPortfolio);
    }
  }, [selectedPortfolio, sortOrder]);

  if (loading && portfolios.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Portfolios</h2>
            
            <PortfolioForm
              open={portfolioFormOpen}
              onOpenChange={setPortfolioFormOpen}
              portfolioForm={portfolioForm}
              setPortfolioForm={setPortfolioForm}
              onSubmit={editingPortfolio ? updatePortfolio : createPortfolio}
              isSubmitting={portfolioFormSubmitting}
              isEditing={!!editingPortfolio}
            />
          </div>
          
          <PortfolioList
            portfolios={portfolios}
            onViewArtworks={setSelectedPortfolio}
            onEditPortfolio={editPortfolio}
            onDeletePortfolio={deletePortfolio}
          />
        </TabsContent>
        
        <TabsContent value="artworks" className="space-y-6 pt-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h2 className="text-xl font-semibold">Portfolio Artworks</h2>
              
              {portfolios.length > 0 && (
                <select 
                  value={selectedPortfolio || ''} 
                  onChange={(e) => setSelectedPortfolio(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background"
                >
                  {portfolios.map((portfolio) => (
                    <option key={portfolio.id} value={portfolio.id}>
                      {portfolio.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <ArtworkList
            artworks={artworks}
            selectedPortfolio={selectedPortfolio}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            onAddArtwork={() => {
              resetArtworkForm();
              setArtworkFormOpen(true);
            }}
            onEditArtwork={editArtwork}
            onDeleteArtwork={(artworkId) => {
              if (selectedPortfolio) {
                deleteArtwork(artworkId, selectedPortfolio);
              }
            }}
          />
          
          {selectedPortfolio && (
            <ArtworkForm
              open={artworkFormOpen}
              onOpenChange={setArtworkFormOpen}
              artworkForm={artworkForm}
              setArtworkForm={setArtworkForm}
              onSubmit={() => {
                if (selectedPortfolio) {
                  if (editingArtwork) {
                    updateArtwork(selectedPortfolio);
                  } else {
                    createArtwork(selectedPortfolio);
                  }
                }
              }}
              onImageUpload={handleArtworkImageUpload}
              isSubmitting={artworkFormSubmitting}
              isUploading={imageUploading}
              isEditing={!!editingArtwork}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioManager;
