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
        opacity: [0, 0.7, 0],  // Increased middle opacity for better visibility
        x: x + Math.random() * 10 - 5,
        y: y + Math.random() * 10 - 5,
      }}
      transition={{
        duration: 3 + Math.random() * 2, // Faster animation cycle
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
  
  useEffect(() => {
    // Generate wave paths using pixels
    const generatePixelWavePaths = () => {
      const paths = [];
      const waveCount = 10; // More waves for a denser effect
      const pixelsPerWave = 80; // More pixels per wave for smoother effect
      
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
          if (w % 3 === 0) color = `rgba(237, 51, 59, ${0.3 + Math.random() * 0.4})`; // brand-red, increased opacity
          else if (w % 3 === 1) color = `rgba(49, 162, 76, ${0.3 + Math.random() * 0.4})`; // brand-green, increased opacity
          else color = `rgba(40, 111, 180, ${0.3 + Math.random() * 0.4})`; // brand-blue, increased opacity
          
          paths.push({
            x,
            y, 
            delay: i * 0.01 + w * 0.2, // Faster appearance of pixels
            color,
            size: pixelSize
          });
        }
      }
      
      // Add more scattered pixels for added visual interest
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = 1 + Math.random() * 3;
        
        const colors = [
          `rgba(237, 51, 59, ${0.2 + Math.random() * 0.3})`, // brand-red
          `rgba(49, 162, 76, ${0.2 + Math.random() * 0.3})`, // brand-green
          `rgba(40, 111, 180, ${0.2 + Math.random() * 0.3})`, // brand-blue
        ];
        
        paths.push({
          x,
          y,
          delay: Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size
        });
      }
      
      return paths;
    };
    
    setPixels(generatePixelWavePaths());
    
    // Refresh pixels every 10 seconds to keep animation fresh
    const intervalId = setInterval(() => {
      setPixels(generatePixelWavePaths());
    }, 10000);
    
    return () => clearInterval(intervalId);
  }, [width, height]);
  
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
        <Pixel key={i} {...pixel} />
      ))}
    </svg>
  );
};

export default PixelWave;
