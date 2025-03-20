
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  
  // Pixel art animation
  useEffect(() => {
    if (!pixelGridRef.current) return;
    
    const pixelGrid = pixelGridRef.current;
    const gridSize = 20; // Number of pixels in each row/column
    const pixelSize = Math.min(window.innerWidth, 1200) / gridSize; // Size of each pixel
    
    // Clear any existing pixels
    pixelGrid.innerHTML = '';
    
    // Create pixel grid for art animation
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const pixel = document.createElement('div');
        pixel.className = 'absolute transition-all duration-1000 rounded-sm opacity-0';
        pixel.style.width = `${pixelSize}px`;
        pixel.style.height = `${pixelSize}px`;
        pixel.style.left = `${j * pixelSize}px`;
        pixel.style.top = `${i * pixelSize}px`;
        
        // Randomize when each pixel appears
        const delay = Math.random() * 3000;
        setTimeout(() => {
          // Choose a color theme
          const colors = [
            'bg-brand-red/40', 'bg-brand-green/40', 'bg-brand-blue/40', 
            'bg-primary/30', 'bg-secondary/30'
          ];
          const color = colors[Math.floor(Math.random() * colors.length)];
          pixel.className = `absolute transition-all duration-1000 ${color} rounded-sm transform hover:scale-110`;
          
          // Only show some pixels for a sparse effect
          if (Math.random() > 0.7) {
            pixel.style.opacity = '1';
          }
        }, delay);
        
        pixelGrid.appendChild(pixel);
      }
    }
    
    // Animation loop for gentle movement
    const animatePixels = () => {
      Array.from(pixelGrid.children).forEach((pixel) => {
        if (Math.random() > 0.99) { // Occasionally change pixels
          const elem = pixel as HTMLElement;
          if (elem.style.opacity === '1') {
            elem.style.opacity = '0';
          } else if (Math.random() > 0.7) {
            elem.style.opacity = '1';
          }
        }
      });
      
      requestAnimationFrame(animatePixels);
    };
    
    const animationId = requestAnimationFrame(animatePixels);
    
    // Handle window resizing
    const handleResize = () => {
      if (pixelGrid) {
        const newPixelSize = Math.min(window.innerWidth, 1200) / gridSize;
        Array.from(pixelGrid.children).forEach((pixel, index) => {
          const elem = pixel as HTMLElement;
          const j = index % gridSize;
          const i = Math.floor(index / gridSize);
          elem.style.width = `${newPixelSize}px`;
          elem.style.height = `${newPixelSize}px`;
          elem.style.left = `${j * newPixelSize}px`;
          elem.style.top = `${i * newPixelSize}px`;
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Create pixel art "MyPalette" text
    const addPixelText = () => {
      const text = "MyPalette";
      const pixelTextContainer = document.createElement('div');
      pixelTextContainer.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse';
      
      // Create pixel-style letters (simplified)
      Array.from(text).forEach((letter, index) => {
        const letterElem = document.createElement('div');
        letterElem.className = 'inline-block mx-1 opacity-0 animate-fade-up';
        letterElem.style.animationDelay = `${index * 150}ms`;
        
        // Create a mini-grid for each letter
        const miniGrid = document.createElement('div');
        miniGrid.className = 'w-6 h-8 relative';
        
        // Random pixel art for each letter
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            if (Math.random() > 0.4) {
              const pixel = document.createElement('div');
              pixel.className = 'absolute bg-white/30 hover:bg-white/50 transition-all';
              pixel.style.width = '25%';
              pixel.style.height = '25%';
              pixel.style.left = `${j * 33}%`;
              pixel.style.top = `${i * 25}%`;
              miniGrid.appendChild(pixel);
            }
          }
        }
        
        letterElem.appendChild(miniGrid);
        pixelTextContainer.appendChild(letterElem);
        
        setTimeout(() => {
          letterElem.classList.add('opacity-100');
        }, 1000 + index * 150);
      });
      
      // Add pixel text to the canvas
      pixelGrid.appendChild(pixelTextContainer);
    };
    
    // Add pixel art text after a delay
    setTimeout(addPixelText, 1000);
    
    // ASCII art effect in console (for fun)
    console.log(`
    ███╗   ███╗██╗   ██╗██████╗  █████╗ ██╗     ███████╗████████╗████████╗███████╗
    ████╗ ████║╚██╗ ██╔╝██╔══██╗██╔══██╗██║     ██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝
    ██╔████╔██║ ╚████╔╝ ██████╔╝███████║██║     █████╗     ██║      ██║   █████╗  
    ██║╚██╔╝██║  ╚██╔╝  ██╔═══╝ ██╔══██║██║     ██╔══╝     ██║      ██║   ██╔══╝  
    ██║ ╚═╝ ██║   ██║   ██║     ██║  ██║███████╗███████╗   ██║      ██║   ███████╗
    ╚═╝     ╚═╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝      ╚═╝   ╚══════╝
                                                                                
    Digital Portfolio Platform for Artists
    `);
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <section ref={heroRef} className="relative overflow-hidden py-24 lg:py-32 bg-ppn-light">
      {/* Pixel art canvas container */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        <div ref={pixelGridRef} className="relative w-full max-w-6xl h-full"></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center transition-transform duration-200">
          <div className="mb-6 animate-pixel-in">
            <img 
              src="/lovable-uploads/989cbf61-b6e6-42ab-b88c-4f5184336c53.png" 
              alt="PPN Logo" 
              className="h-24 mx-auto mb-4"
            />
          </div>
          
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
            <Button asChild size="lg" className="rounded-full px-8 py-6 font-medium bg-gradient-to-r from-brand-green to-brand-blue text-white hover:shadow-md transition-all duration-300">
              <Link to="/sign-up">
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 py-6 font-medium border-gray-200 hover:bg-gray-100"
              asChild
            >
              <Link to="/portfolios">
                Explore Portfolios
              </Link>
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
              
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="col-span-1 bg-white rounded-lg shadow-md p-4 hover-pixel">
                  <div className="bg-brand-red/10 h-32 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="col-span-1 bg-white rounded-lg shadow-md p-4 hover-pixel">
                  <div className="bg-brand-green/10 h-32 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="col-span-1 bg-white rounded-lg shadow-md p-4 hover-pixel">
                  <div className="bg-brand-blue/10 h-32 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
