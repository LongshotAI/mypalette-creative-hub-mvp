
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PixelProps {
  x: number;
  y: number;
  delay: number;
  color: string;
  size: number;
}

const Pixel: React.FC<PixelProps> = ({ x, y, delay, color, size }) => {
  return (
    <motion.rect
      x={x}
      y={y}
      width={size}
      height={size}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, 0.8, 0],  // Increased middle opacity for better visibility
        x: x + Math.random() * 12 - 6,
        y: y + Math.random() * 12 - 6,
      }}
      transition={{
        duration: 2.5 + Math.random() * 1.5, // Faster animation cycle
        delay: delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
      style={{ borderRadius: '2px' }}
    />
  );
};

interface PixelWaveProps {
  width?: number;
  height?: number;
  className?: string;
}

const PixelWave: React.FC<PixelWaveProps> = ({ 
  width = 1000, 
  height = 400,
  className = "" 
}) => {
  const [pixels, setPixels] = useState<PixelProps[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Refresh the entire wave pattern periodically
    const refreshInterval = setInterval(() => {
      setRefreshKey(prevKey => prevKey + 1);
    }, 15000); // Refresh every 15 seconds for variety
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  useEffect(() => {
    const generatePixelWavePaths = () => {
      const paths = [];
      const waveCount = 15; // More waves for a denser effect
      const pixelsPerWave = 120; // More pixels per wave for smoother effect
      
      for (let w = 0; w < waveCount; w++) {
        const amplitude = 30 + (w * 15);
        const period = width / (1 + Math.random() * 0.5);
        const phaseShift = w * (Math.PI / 4);
        
        for (let i = 0; i < pixelsPerWave; i++) {
          const t = (i / pixelsPerWave) * width;
          const x = t;
          // Create a more dynamic wave pattern
          const y = (height / 2) + amplitude * Math.sin((2 * Math.PI * t / period) + phaseShift);
          
          // Vary pixel sizes for more dynamic look
          const pixelSize = 2 + Math.random() * 6;
          
          // Use brand colors with varying opacity
          let color;
          if (w % 3 === 0) color = `rgba(237, 51, 59, ${0.4 + Math.random() * 0.5})`; // brand-red, increased opacity
          else if (w % 3 === 1) color = `rgba(49, 162, 76, ${0.4 + Math.random() * 0.5})`; // brand-green, increased opacity
          else color = `rgba(40, 111, 180, ${0.4 + Math.random() * 0.5})`; // brand-blue, increased opacity
          
          paths.push({
            x,
            y, 
            delay: i * 0.008 + w * 0.15, // Faster appearance of pixels
            color,
            size: pixelSize
          });
        }
      }
      
      // Add more scattered pixels for added visual interest
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1 + Math.random() * 3;
        
        const colors = [
          `rgba(237, 51, 59, ${0.3 + Math.random() * 0.4})`, // brand-red
          `rgba(49, 162, 76, ${0.3 + Math.random() * 0.4})`, // brand-green
          `rgba(40, 111, 180, ${0.3 + Math.random() * 0.4})`, // brand-blue
        ];
        
        paths.push({
          x,
          y,
          delay: Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size
        });
      }
      
      return paths;
    };
    
    setPixels(generatePixelWavePaths());
    
    // Continuously refresh portions of the wave
    const continuousRefreshInterval = setInterval(() => {
      setPixels(prevPixels => {
        const newPixels = [...prevPixels];
        // Replace 20% of pixels for continuous movement
        const pixelsToReplace = Math.floor(newPixels.length * 0.2);
        const startIndex = Math.floor(Math.random() * (newPixels.length - pixelsToReplace));
        
        const replacementPixels = [];
        for (let i = 0; i < pixelsToReplace; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const size = 1 + Math.random() * 5;
          
          const colors = [
            `rgba(237, 51, 59, ${0.3 + Math.random() * 0.4})`, // brand-red
            `rgba(49, 162, 76, ${0.3 + Math.random() * 0.4})`, // brand-green
            `rgba(40, 111, 180, ${0.3 + Math.random() * 0.4})`, // brand-blue
          ];
          
          replacementPixels.push({
            x,
            y,
            delay: Math.random() * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size
          });
        }
        
        newPixels.splice(startIndex, pixelsToReplace, ...replacementPixels);
        return newPixels;
      });
    }, 2500); // More frequent refresh for better continuous animation
    
    return () => clearInterval(continuousRefreshInterval);
  }, [width, height, refreshKey]);
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox={`0 0 ${width} ${height}`}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ overflow: 'visible' }}
      preserveAspectRatio="xMidYMid meet"
    >
      {pixels.map((pixel, i) => (
        <Pixel key={`${i}-${refreshKey}`} {...pixel} />
      ))}
    </svg>
  );
};

export default PixelWave;
