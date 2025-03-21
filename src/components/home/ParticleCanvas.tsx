
import React, { useEffect, useRef, useState } from 'react';

interface ParticleCanvasProps {
  scrollPosition?: number;
}

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalColor: string;
  interacting: boolean;
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ scrollPosition = 0 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const particlesRef = useRef<Particle[]>([]);
  const lastInteractionTimeRef = useRef<number>(Date.now());
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Colors for the MyPalette brand
  const brandColors = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
  };

  // Initialize canvas and particles
  useEffect(() => {
    const initCanvas = () => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions to match window
      const width = window.innerWidth;
      const height = Math.min(window.innerHeight * 0.8, 800); // Limit height
      
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
      
      // Create particles for logo
      createParticles(ctx, width, height);
    };
    
    initCanvas();
    
    // Handle window resize
    const handleResize = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      initCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  // Create particles based on logo text
  const createParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const particles: Particle[] = [];
    
    // Clear previous particles
    particlesRef.current = [];
    
    // Set up text rendering
    const fontSize = Math.min(width, height) * 0.15; // Smaller font size for a more refined look
    ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Create particles for each letter of "MyPalette" with color variations
    const letters = [
      { char: 'M', color: brandColors.red, x: width / 2 - fontSize * 0.9, y: height / 2 },
      { char: 'y', color: brandColors.red, x: width / 2 - fontSize * 0.5, y: height / 2 },
      { char: 'P', color: brandColors.green, x: width / 2 - fontSize * 0.1, y: height / 2 },
      { char: 'a', color: brandColors.green, x: width / 2 + fontSize * 0.2, y: height / 2 },
      { char: 'l', color: brandColors.green, x: width / 2 + fontSize * 0.4, y: height / 2 },
      { char: 'e', color: brandColors.blue, x: width / 2 + fontSize * 0.6, y: height / 2 },
      { char: 't', color: brandColors.blue, x: width / 2 + fontSize * 0.8, y: height / 2 },
      { char: 't', color: brandColors.blue, x: width / 2 + fontSize * 1.0, y: height / 2 },
      { char: 'e', color: brandColors.blue, x: width / 2 + fontSize * 1.2, y: height / 2 },
    ];
    
    // Draw each letter and extract particles
    letters.forEach(letter => {
      // Clear before drawing new letter
      ctx.clearRect(0, 0, width, height);
      
      // Draw the letter with a gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height / 2);
      gradient.addColorStop(0, letter.color);
      gradient.addColorStop(1, shadeColor(letter.color, -30)); // Darker shade
      
      ctx.fillStyle = gradient;
      ctx.fillText(letter.char, letter.x, letter.y);
      
      // Extract particles from the drawn text
      const particleGap = Math.max(1, Math.floor(12 - (width / 300))); // Responsive particle density
      const imageData = ctx.getImageData(0, 0, width, height);
      
      for (let y = 0; y < height; y += particleGap) {
        for (let x = 0; x < width; x += particleGap) {
          const index = (y * width + x) * 4;
          if (imageData.data[index + 3] > 0) { // If pixel is not fully transparent
            const alpha = imageData.data[index + 3] / 255;
            if (Math.random() < 0.7 * alpha) { // Random sampling to reduce particles
              const radius = Math.random() * 1.5 + 1; // Random size for more organic feel
              const color = `rgba(${imageData.data[index]}, ${imageData.data[index + 1]}, ${imageData.data[index + 2]}, ${alpha})`;
              
              particles.push({
                x: x + (Math.random() - 0.5) * 8, // Add slight randomness to position
                y: y + (Math.random() - 0.5) * 8,
                homeX: x,
                homeY: y,
                vx: 0,
                vy: 0,
                radius: radius,
                color: color,
                originalColor: color,
                interacting: false
              });
            }
          }
        }
      }
    });
    
    particlesRef.current = particles;
    
    // Start animation once particles are created
    animate();
  };

  // Animate particles
  const animate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Current time for interaction tracking
    const currentTime = Date.now();
    const particles = particlesRef.current;
    let hasInteraction = false;
    
    // Update and draw each particle
    particles.forEach(particle => {
      // Handle interaction with mouse
      const dx = particle.x - mousePosition.x;
      const dy = particle.y - mousePosition.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 80; // Larger interaction radius for a more fluid feel
      
      if (isInteracting && dist < interactionRadius) {
        // Particle is being interacted with
        const baseBrightness = 0.8; // Base brightness for interaction
        const interactionScale = Math.max(0, 1 - dist / interactionRadius);
        
        // Change color on interaction
        particle.color = 'rgba(255, 255, 255, ' + (baseBrightness + interactionScale * 0.2) + ')';
        particle.interacting = true;
        hasInteraction = true;
        lastInteractionTimeRef.current = currentTime;
        
        // Apply repulsion force
        const repulsionStrength = 0.8;
        const angle = Math.atan2(dy, dx);
        const force = Math.max(0, (interactionRadius - dist)) * repulsionStrength;
        
        particle.vx += Math.cos(angle) * force * 0.015;
        particle.vy += Math.sin(angle) * force * 0.015;
      } else if (!isInteracting && currentTime - lastInteractionTimeRef.current > 300) {
        // Return to original color when not interacting
        particle.color = particle.originalColor;
        particle.interacting = false;
      }
      
      // Apply velocity to position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Apply drag force
      particle.vx *= 0.92;
      particle.vy *= 0.92;
      
      // Apply spring force towards home position
      const homeDx = particle.homeX - particle.x;
      const homeDy = particle.homeY - particle.y;
      const homeDistSq = homeDx * homeDx + homeDy * homeDy;
      
      // Stronger spring force for particles far from home
      const springFactor = 0.01 + (homeDistSq > 500 ? 0.05 : 0);
      
      particle.vx += homeDx * springFactor;
      particle.vy += homeDy * springFactor;
      
      // Apply scroll effect
      particle.y += scrollPosition * 0.02; // Subtle scroll effect
      
      // Draw the particle as a circle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
    });
    
    // Update interaction state based on particle interaction
    if (isInteracting !== hasInteraction) {
      setIsInteracting(hasInteraction);
    }
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Helper function to shade colors
  const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return `#${RR}${GG}${BB}`;
  };

  // Handle mouse/touch events
  useEffect(() => {
    const handleInteraction = (event: MouseEvent | TouchEvent) => {
      if ('touches' in event) {
        const touch = event.touches[0];
        setMousePosition({ x: touch.clientX, y: touch.clientY });
      } else {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
      
      setIsInteracting(true);
      
      // Reset timeout
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      
      // Set timeout to end interaction
      interactionTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 100);
    };
    
    // Add event listeners
    if (canvasRef.current) {
      canvasRef.current.addEventListener('mousemove', handleInteraction);
      canvasRef.current.addEventListener('touchmove', handleInteraction, { passive: true });
      canvasRef.current.addEventListener('touchstart', handleInteraction, { passive: true });
      canvasRef.current.addEventListener('mouseleave', () => setIsInteracting(false));
      canvasRef.current.addEventListener('touchend', () => setIsInteracting(false));
    }
    
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mousemove', handleInteraction);
        canvasRef.current.removeEventListener('touchmove', handleInteraction);
        canvasRef.current.removeEventListener('touchstart', handleInteraction);
        canvasRef.current.removeEventListener('mouseleave', () => setIsInteracting(false));
        canvasRef.current.removeEventListener('touchend', () => setIsInteracting(false));
      }
      
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className="relative flex justify-center items-center w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="opacity-90 transition-opacity duration-500"
        style={{ 
          touchAction: 'none',
          cursor: 'pointer',
        }}
      />
    </div>
  );
};

export default ParticleCanvas;
