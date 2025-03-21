
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import ParticleCanvas from './ParticleCanvas';

interface HeroProps {
  scrollPosition?: number;
}

const Hero: React.FC<HeroProps> = ({ scrollPosition = 0 }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(true);
  
  useEffect(() => {
    const threshold = 100;
    setHeadingVisible(scrollPosition < threshold);
  }, [scrollPosition]);
  
  return (
    <section ref={heroRef} className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-ppn-light -mt-20 pt-20">
      {/* Ambient background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white/80 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-red/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full filter blur-3xl"></div>
      <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-brand-blue/5 rounded-full filter blur-3xl"></div>
      
      {/* Interactive canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        <div className="relative w-full max-w-6xl h-full">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-auto">
            <ParticleCanvas scrollPosition={scrollPosition} />
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center transition-transform duration-200">
          <h1 
            className={cn(
              "animate-fade-up font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6",
              "transition-opacity duration-500",
              headingVisible ? "opacity-100" : "opacity-0"
            )}
          >
            Create a 
            <span className="relative mx-2 inline-block">
              <span className="text-brand-red">stunning</span>{" "}
              <span className="text-brand-green">digital</span>{" "}
              <span className="text-brand-blue">portfolio</span>
            </span> 
            in minutes
          </h1>
          
          <p 
            className={cn(
              "animate-fade-up animate-delay-100 text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto",
              "transition-opacity duration-500",
              headingVisible ? "opacity-100" : "opacity-0"
            )}
          >
            MyPalette helps artists showcase their work, sell physical artwork, access educational resources,
            and discover creative opportunities.
          </p>
          
          <div 
            className={cn(
              "animate-fade-up animate-delay-200 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4",
              "transition-opacity duration-500", 
              headingVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <Button asChild size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 font-medium bg-brand-blue text-white hover:shadow-md transition-all duration-300">
              <Link to="/sign-up">
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-6 sm:px-8 py-5 sm:py-6 font-medium border-gray-200 hover:bg-gray-100"
              asChild
            >
              <Link to="/portfolios">
                Explore Portfolios
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-12 md:mt-16 lg:mt-24 animate-fade-in animate-delay-300">
          <div className={cn(
            "relative mx-auto max-w-4xl md:max-w-5xl rounded-xl overflow-hidden shadow-2xl",
            "transform transition-all duration-700 hover:scale-[1.01]",
            "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:pointer-events-none"
          )}>
            <div className="aspect-[16/9] relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 md:p-6 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-12 md:w-16 h-12 md:h-16 bg-brand-red/50 rounded-full filter blur-xl" />
                <div className="absolute top-1/3 right-1/3 w-16 md:w-24 h-16 md:h-24 bg-brand-green/50 rounded-full filter blur-xl" />
                <div className="absolute bottom-1/4 right-1/4 w-14 md:w-20 h-14 md:h-20 bg-brand-blue/50 rounded-full filter blur-xl" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 w-full max-w-xs md:max-w-2xl">
                <div className="col-span-1 bg-white rounded-lg shadow-md p-2 md:p-4 hover-pixel">
                  <div className="bg-brand-red/10 h-20 md:h-32 rounded mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="col-span-1 bg-white rounded-lg shadow-md p-2 md:p-4 hover-pixel">
                  <div className="bg-brand-green/10 h-20 md:h-32 rounded mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="col-span-1 bg-white rounded-lg shadow-md p-2 md:p-4 hover-pixel">
                  <div className="bg-brand-blue/10 h-20 md:h-32 rounded mb-2"></div>
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
