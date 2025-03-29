
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import PixelWave from '@/components/animations/PixelWave';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface HeroProps {
  scrollPosition?: number;
}

const Hero: React.FC<HeroProps> = ({ scrollPosition = 0 }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelGridRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(true);
  const [artworks, setArtworks] = useState<any[]>([]);
  
  useEffect(() => {
    const threshold = 100;
    setHeadingVisible(scrollPosition < threshold);
  }, [scrollPosition]);
  
  useEffect(() => {
    // Fetch featured artworks from the database
    const fetchArtworks = async () => {
      try {
        const { data: portfolioData } = await supabase
          .from('portfolios')
          .select('id, is_public')
          .eq('is_public', true)
          .limit(10);
        
        if (portfolioData && portfolioData.length > 0) {
          // Get a random selection of 3 portfolio IDs
          const randomPortfolios = portfolioData.sort(() => 0.5 - Math.random()).slice(0, 3);
          
          // Fetch artworks from these portfolios
          const promises = randomPortfolios.map(portfolio => {
            return supabase
              .from('artworks')
              .select('id, title, image_url, portfolio_id')
              .eq('portfolio_id', portfolio.id)
              .limit(1)
              .single();
          });
          
          const results = await Promise.all(promises);
          const artworkData = results
            .filter(result => !result.error && result.data)
            .map(result => result.data);
          
          setArtworks(artworkData);
        }
      } catch (error) {
        console.error('Error fetching artworks for hero:', error);
      }
    };
    
    fetchArtworks();
  }, []);
  
  useEffect(() => {
    if (!pixelGridRef.current) return;
    
    const pixelGrid = pixelGridRef.current;
    const gridSize = 20;
    const pixelSize = Math.min(window.innerWidth, 1200) / gridSize;
    
    pixelGrid.innerHTML = '';
    
    const createPixels = () => {
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const pixel = document.createElement('div');
          pixel.className = 'absolute transition-all duration-2000 rounded-sm opacity-0';
          pixel.style.width = `${pixelSize}px`;
          pixel.style.height = `${pixelSize}px`;
          pixel.style.left = `${j * pixelSize}px`;
          pixel.style.top = `${i * pixelSize}px`;
          
          if (Math.random() > 0.7) {
            const colors = [
              'bg-brand-red/15', 'bg-brand-green/15', 'bg-brand-blue/15', 
              'bg-primary/10', 'bg-secondary/10'
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            pixel.className = `absolute transition-all duration-2000 ${color} rounded-sm opacity-0`;
            
            pixelGrid.appendChild(pixel);
          }
        }
      }
    };
    
    createPixels();
    
    const animatePixels = () => {
      Array.from(pixelGrid.children).forEach((pixel) => {
        if (Math.random() > 0.98) {
          const elem = pixel as HTMLElement;
          if (elem.style.opacity === '0' || elem.style.opacity === '') {
            elem.style.opacity = Math.random() > 0.5 ? '0.3' : '0.5';
          } else {
            elem.style.opacity = '0';
          }
        }
      });
      
      requestAnimationFrame(animatePixels);
    };
    
    const animationId = requestAnimationFrame(animatePixels);
    
    const refreshInterval = setInterval(() => {
      if (pixelGrid.children.length > 100) {
        for (let i = 0; i < 20; i++) {
          if (pixelGrid.children.length > 0) {
            pixelGrid.removeChild(pixelGrid.children[Math.floor(Math.random() * pixelGrid.children.length)]);
          }
        }
      }
      
      createPixels();
    }, 5000);
    
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
    
    const addPixelText = () => {
      const pixelTextContainer = document.createElement('div');
      pixelTextContainer.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none';
      
      for (let i = 0; i < 15; i++) {
        const floatingPixel = document.createElement('div');
        const size = 4 + Math.random() * 8;
        const xPos = (Math.random() - 0.5) * 100;
        const yPos = (Math.random() - 0.5) * 60;
        
        floatingPixel.className = 'absolute rounded-sm opacity-0 animate-pulse';
        floatingPixel.style.width = `${size}px`;
        floatingPixel.style.height = `${size}px`;
        floatingPixel.style.left = `calc(50% + ${xPos}px)`;
        floatingPixel.style.top = `calc(50% + ${yPos}px)`;
        floatingPixel.style.backgroundColor = `rgba(255, 255, 255, 0.1)`;
        floatingPixel.style.animationDuration = `${5 + Math.random() * 5}s`;
        
        pixelTextContainer.appendChild(floatingPixel);
        
        setTimeout(() => {
          floatingPixel.style.opacity = '0.15';
        }, 1000 + i * 300);
      }
      
      pixelGrid.appendChild(pixelTextContainer);
    };
    
    setTimeout(addPixelText, 1000);
    
    const floatingPixelsInterval = setInterval(() => {
      addPixelText();
    }, 8000);
    
    console.log(`
    ███╗   ███╗██╗   ██╗██████╗  █████╗ ██╗     ███████╗████████╗████████╗███████╗
    ████╗ ████║╚██╗ ██╔╝██╔══██╗██╔══██╗██║     ██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝
    ██╔████╔██║ ╚████╔╝ ██████╔╝███████║██║     █████╗     ██║      ██║   █████╗  
    ██║╚██╔╝██║  ╚██╔╝  ██╔═══╝ ██╔══██║██║     ██╔══╝     ██║      ██║   ██╔══╝  
    ██║ ╚═╝ ██║   ██║   ██║     ██║  ██║███████╗███████╗   ██║      ██║   ███████╗
    ╚═╝     ╚═╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝      ╚═╝   ╚══════╝
                                                                                
    Digital Portfolio Platform for Artists
    `);
    
    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(refreshInterval);
      clearInterval(floatingPixelsInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Fallback images in case no real artworks are found
  const fallbackImages = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?w=400&h=300&fit=crop"
  ];
  
  return (
    <section ref={heroRef} className="relative overflow-hidden py-16 md:py-24 lg:py-32 bg-ppn-light -mt-20 pt-20">
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
        <div ref={pixelGridRef} className="relative w-full max-w-6xl h-full"></div>
        
        <PixelWave width={1400} height={600} className="z-10 opacity-70" />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center transition-transform duration-200">
          <motion.h1 
            className={cn(
              "font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6",
              "transition-opacity duration-500",
              headingVisible ? "opacity-100" : "opacity-0"
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Create a{" "}
            <span className="relative mx-2 inline-block">
              <motion.span 
                className="text-brand-red"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                stunning
              </motion.span>{" "}
              <motion.span 
                className="text-brand-green"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                digital
              </motion.span>{" "}
              <motion.span 
                className="text-brand-blue"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                portfolio
              </motion.span>
            </span>{" "}
            in minutes
          </motion.h1>
          
          <motion.p 
            className={cn(
              "text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto",
              "transition-opacity duration-500",
              headingVisible ? "opacity-100" : "opacity-0"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            MyPalette helps artists showcase their work, sell physical artwork, access educational resources,
            and discover creative opportunities.
          </motion.p>
          
          <motion.div 
            className={cn(
              "flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4",
              "transition-opacity duration-500", 
              headingVisible ? "opacity-100" : "opacity-0"
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
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
          </motion.div>
        </div>
        
        <div className="mt-12 md:mt-16 lg:mt-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className={cn(
              "relative mx-auto max-w-4xl md:max-w-5xl rounded-xl overflow-hidden shadow-2xl",
              "transform transition-all duration-700 hover:scale-[1.01]",
              "before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:pointer-events-none"
            )}
          >
            <div className="aspect-[16/9] relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 md:p-6 flex items-center justify-center">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-12 md:w-16 h-12 md:h-16 bg-brand-red/50 rounded-full filter blur-xl" />
                <div className="absolute top-1/3 right-1/3 w-16 md:w-24 h-16 md:h-24 bg-brand-green/50 rounded-full filter blur-xl" />
                <div className="absolute bottom-1/4 right-1/4 w-14 md:w-20 h-14 md:h-20 bg-brand-blue/50 rounded-full filter blur-xl" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 w-full max-w-xs md:max-w-2xl">
                {[0, 1, 2].map((index) => {
                  const artwork = artworks[index];
                  const imageUrl = artwork?.image_url || fallbackImages[index];
                  return (
                    <div key={index} className="col-span-1 bg-white rounded-lg shadow-md p-2 md:p-4 hover-pixel">
                      <div className="bg-brand-red/10 h-20 md:h-32 rounded mb-2" 
                          style={{backgroundImage: `url('${imageUrl}')`, backgroundSize: 'cover'}}></div>
                      <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
