
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Hero from '@/components/home/Hero';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <DefaultLayout>
      <Hero />
      <FeaturedArtists />
      
      {/* Features Section */}
      <section className="py-24">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-3 animate-fade-up">
              Everything you need to showcase your art
            </h2>
            <p className="text-muted-foreground animate-fade-up animate-delay-100">
              MyPalette provides all the tools artists need to create professional portfolios, 
              sell their work, and connect with opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm animate-fade-up">
              <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-brand-red font-bold">1</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Customizable Templates</h3>
              <p className="text-muted-foreground mb-4">
                Choose from beautiful, responsive portfolio templates designed specifically for artists.
              </p>
              <Button variant="ghost" size="sm" className="group mt-2">
                <span>Learn more</span>
                <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm animate-fade-up animate-delay-100">
              <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-brand-green font-bold">2</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Educational Resources</h3>
              <p className="text-muted-foreground mb-4">
                Access guides and tutorials about digital art, NFTs, smart contracts, and more.
              </p>
              <Button variant="ghost" size="sm" className="group mt-2">
                <span>Learn more</span>
                <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm animate-fade-up animate-delay-200">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-brand-blue font-bold">3</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Creative Opportunities</h3>
              <p className="text-muted-foreground mb-4">
                Discover and apply to open calls for exhibitions, grants, and other creative opportunities.
              </p>
              <Button variant="ghost" size="sm" className="group mt-2">
                <span>Learn more</span>
                <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-gray-50 to-white">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Ready to showcase your art?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join a community of artists and creators on MyPalette. Create your portfolio, connect with
              opportunities, and take your art to the next level.
            </p>
            <Button size="lg" className="rounded-full px-8 py-6 font-medium">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Index;
