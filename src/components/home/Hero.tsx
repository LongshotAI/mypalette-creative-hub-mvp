
import React, { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Three.js animation setup
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Setup scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // transparent background
    canvasRef.current.appendChild(renderer.domElement);
    
    // Create floating objects
    const objects: THREE.Mesh[] = [];
    const colors = [0xf06292, 0x4fc3f7, 0x8bc34a, 0xffa726]; // pink, blue, green, orange
    
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.IcosahedronGeometry(Math.random() * 0.8 + 0.2, 0);
      const material = new THREE.MeshBasicMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)],
        transparent: true,
        opacity: 0.3,
        wireframe: true
      });
      
      const object = new THREE.Mesh(geometry, material);
      
      // Position objects randomly
      object.position.x = (Math.random() - 0.5) * 20;
      object.position.y = (Math.random() - 0.5) * 20;
      object.position.z = (Math.random() - 0.5) * 10 - 5;
      
      // Random rotation
      object.rotation.x = Math.random() * Math.PI;
      object.rotation.y = Math.random() * Math.PI;
      
      // Store random speed for animation
      (object as any).speed = Math.random() * 0.01 + 0.005;
      (object as any).rotationSpeed = Math.random() * 0.01 + 0.002;
      
      objects.push(object);
      scene.add(object);
    }
    
    // Position camera
    camera.position.z = 5;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Animate each object
      objects.forEach(object => {
        object.rotation.x += (object as any).rotationSpeed;
        object.rotation.y += (object as any).rotationSpeed;
        object.position.y += Math.sin(Date.now() * 0.001) * 0.01;
      });
      
      // Mouse movement effect
      if (textRef.current) {
        const time = Date.now() * 0.0005;
        textRef.current.style.transform = `translate(${Math.sin(time) * 10}px, ${Math.cos(time) * 10}px)`;
      }
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle window resizing
    const handleResize = () => {
      if (!canvasRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (canvasRef.current && canvasRef.current.contains(renderer.domElement)) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      
      // Dispose resources
      objects.forEach(object => {
        object.geometry.dispose();
        (object.material as THREE.Material).dispose();
      });
    };
  }, []);
  
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
    <section ref={heroRef} className="relative overflow-hidden py-24 lg:py-32 bg-ppn-light">
      {/* Three.js canvas container */}
      <div ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/20 pointer-events-none" />
      <div className="bg-blob absolute -top-24 right-0 w-80 h-80 bg-brand-red/5 rounded-full blur-3xl" data-speed="1.5" />
      <div className="bg-blob absolute top-1/2 -left-24 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl" data-speed="1" />
      <div className="bg-blob absolute bottom-0 right-1/4 w-80 h-80 bg-brand-blue/5 rounded-full blur-3xl" data-speed="0.5" />
      
      <div className="container-custom relative z-10">
        <div ref={textRef} className="max-w-3xl mx-auto text-center transition-transform duration-200">
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
