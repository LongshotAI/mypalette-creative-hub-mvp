
import React from 'react';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Hero from '@/components/home/Hero';
import FeaturedArtists from '@/components/home/FeaturedArtists';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IndexProps {
  scrollPosition?: number;
}

const Index: React.FC<IndexProps> = ({ scrollPosition }) => {
  return (
    <DefaultLayout>
      <Hero scrollPosition={scrollPosition} />
      <FeaturedArtists scrollPosition={scrollPosition} />
      
      {/* Why Choose MyPalette Section */}
      <WhyChooseSection />
      
      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 animate-fade-up">
              Everything you need to showcase your art
            </h2>
            <p className="text-muted-foreground animate-fade-up animate-delay-100">
              MyPalette provides all the tools artists need to create professional portfolios, 
              sell their work, and connect with opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm animate-fade-up hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-red/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <span className="text-brand-red font-bold">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3">Customizable Templates</h3>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Choose from beautiful, responsive portfolio templates designed specifically for artists.
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="group mt-2"
                asChild
              >
                <Link to="/portfolios">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm animate-fade-up animate-delay-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-green/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <span className="text-brand-green font-bold">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3">Educational Resources</h3>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Access guides and tutorials about digital art, NFTs, smart contracts, and more.
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="group mt-2"
                asChild
              >
                <Link to="/education">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm animate-fade-up animate-delay-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <span className="text-brand-blue font-bold">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3">Creative Opportunities</h3>
              <p className="text-muted-foreground mb-4 text-sm md:text-base">
                Discover and apply to open calls for exhibitions, grants, and other creative opportunities.
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="group mt-2"
                asChild
              >
                <Link to="/open-calls">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-gray-50 to-white">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-12 max-w-4xl mx-auto text-center glass-panel">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Ready to showcase your art?</h2>
            <p className="text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto text-sm md:text-base">
              Join a community of artists and creators on MyPalette. Create your portfolio, connect with
              opportunities, and take your art to the next level.
            </p>
            <Button 
              size="lg" 
              className="rounded-full px-6 md:px-8 py-4 md:py-6 font-medium bg-brand-blue text-white hover:shadow-md transition-all duration-300"
              asChild
            >
              <Link to="/sign-up">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
};

export default Index;
