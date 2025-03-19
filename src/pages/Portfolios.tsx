
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Placeholder component for artist cards
const PortfolioCard = ({ name, specialty, imageUrl }: { name: string; specialty: string; imageUrl: string }) => {
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <div 
          className="w-full h-full bg-gray-200 flex items-center justify-center"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!imageUrl && (
            <span className="text-gray-400">Image placeholder</span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-base">{name}</h3>
        <p className="text-sm text-muted-foreground">{specialty}</p>
      </div>
    </div>
  );
};

const Portfolios = () => {
  // Sample data
  const portfolios = [
    { name: "Alex Riviera", specialty: "Digital Illustration", imageUrl: "" },
    { name: "Sophia Chen", specialty: "Pixel Art", imageUrl: "" },
    { name: "Marcus Johnson", specialty: "3D Modeling", imageUrl: "" },
    { name: "Naomi Wright", specialty: "Traditional Painting", imageUrl: "" },
    { name: "Jamie Lee", specialty: "Concept Art", imageUrl: "" },
    { name: "Tomas Rodriguez", specialty: "Photography", imageUrl: "" },
    { name: "Elisa Kim", specialty: "Animation", imageUrl: "" },
    { name: "David Chen", specialty: "Street Art", imageUrl: "" },
  ];

  return (
    <DefaultLayout>
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Artist Portfolios</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover talented artists and their exceptional work
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search by artist name or specialty..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
          
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button variant="secondary" className="rounded-full">All</Button>
            <Button variant="outline" className="rounded-full">Digital Art</Button>
            <Button variant="outline" className="rounded-full">Traditional</Button>
            <Button variant="outline" className="rounded-full">Photography</Button>
            <Button variant="outline" className="rounded-full">Illustration</Button>
            <Button variant="outline" className="rounded-full">3D Art</Button>
          </div>
          
          {/* Portfolio grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {portfolios.map((portfolio) => (
              <PortfolioCard 
                key={portfolio.name}
                name={portfolio.name}
                specialty={portfolio.specialty}
                imageUrl={portfolio.imageUrl}
              />
            ))}
          </div>
          
          {/* Load more button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Load More
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Portfolios;
