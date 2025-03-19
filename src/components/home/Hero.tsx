
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  
  // Mouse movement parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current || !textRef.current) return;
      
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      // Subtle text movement
      textRef.current.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
      
      // Update gradient positions for subtle effect
      const gradients = heroRef.current.querySelectorAll('.bg-blob');
      gradients.forEach((gradient: Element) => {
        const element = gradient as HTMLElement;
        const speed = parseFloat(element.dataset.speed || '1');
        element.style.transform = `translate(${x * 25 * speed}px, ${y * 25 * speed}px)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <section ref={heroRef} className="relative overflow-hidden py-24 lg:py-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 pointer-events-none" />
      <div className="bg-blob absolute -top-24 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl" data-speed="1.5" />
      <div className="bg-blob absolute top-1/2 -left-24 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl" data-speed="1" />
      <div className="bg-blob absolute bottom-0 right-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl" data-speed="0.5" />
      
      <div className="container-custom relative z-10">
        <div ref={textRef} className="max-w-3xl mx-auto text-center transition-transform duration-200">
          <h1 className="animate-fade-up font-sans text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Create a stunning 
            <span className="relative mx-2 inline-block px-2">
              <span className="relative z-10">digital portfolio</span>
              <span className="absolute bottom-0 left-0 w-full h-3 bg-brand-green/20" />
            </span> 
            in minutes
          </h1>
          
          <p className="animate-fade-up animate-delay-100 text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            MyPalette helps artists showcase their work, sell physical artwork, access educational resources,
            and discover creative opportunities.
          </p>
          
          <div className="animate-fade-up animate-delay-200 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button size="lg" className="rounded-full px-8 py-6 font-medium bg-gradient-to-r from-brand-green to-brand-blue text-white hover:shadow-md transition-all duration-300">
              Sign Up
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 py-6 font-medium border-gray-200 hover:bg-gray-100"
            >
              Explore Portfolios
            </Button>
          </div>
        </div>
        
        {/* Preview Image */}
        <div className="mt-16 md:mt-24 animate-fade-in animate-delay-300">
          <div className={cn(
            "relative mx-auto max-w-5xl rounded-xl overflow-hidden shadow-2xl",
            "transform transition-all duration-700 hover:scale-[1.01]",
            "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:pointer-events-none"
          )}>
            <div className="aspect-[16/9] relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-6 flex items-center justify-center">
              {/* Interactive Portfolio Preview */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-brand-red/50 rounded-full filter blur-xl" />
                <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-brand-green/50 rounded-full filter blur-xl" />
                <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-brand-blue/50 rounded-full filter blur-xl" />
              </div>
              
              <p className="text-center relative z-10">
                <span className="block font-medium text-gray-500 mb-2">Portfolio Preview</span>
                <span className="text-gray-400">Interactive portfolio showcase will appear here</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
