
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
        opacity: [0, 0.7, 0],
        x: x + Math.random() * 10 - 5,
        y: y + Math.random() * 10 - 5,
      }}
      transition={{
        duration: 5 + Math.random() * 2,
        delay: delay,
        repeat: Infinity,
        repeatType: "reverse",
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
    // Create wave paths as a guide for pixel placement
    const generateWavePaths = () => {
      const paths = [];
      const waveCount = 5;
      const pixelsPerWave = 40;
      
      for (let w = 0; w < waveCount; w++) {
        const amplitude = 30 + (w * 10);
        const period = width / 2;
        const phaseShift = w * (Math.PI / 4);
        
        for (let i = 0; i < pixelsPerWave; i++) {
          const t = (i / pixelsPerWave) * width;
          const x = t;
          const y = (height / 2) + amplitude * Math.sin((2 * Math.PI * t / period) + phaseShift);
          
          const pixelSize = 3 + Math.random() * 5;
          
          // Colors based on your brand palette
          let color;
          if (w % 3 === 0) color = "rgba(237, 51, 59, 0.3)"; // brand-red
          else if (w % 3 === 1) color = "rgba(49, 162, 76, 0.3)"; // brand-green
          else color = "rgba(40, 111, 180, 0.3)"; // brand-blue
          
          paths.push({
            x,
            y, 
            delay: i * 0.03 + w * 0.5,
            color,
            size: pixelSize
          });
        }
      }
      
      return paths;
    };
    
    setPixels(generateWavePaths());
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
