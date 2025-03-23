
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface GlareCardProps {
  children: React.ReactNode;
  className?: string;
  iconColor?: string;
}

export const GlareCard = ({
  children,
  className,
  iconColor,
}: GlareCardProps) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  
  return (
    <div
      className="relative isolate [perspective:600px] transition-transform duration-300 ease-out will-change-transform"
      ref={refElement}
      style={{
        "--m-x": "50%",
        "--m-y": "50%",
        "--r-x": "0deg",
        "--r-y": "0deg",
        "--bg-x": "50%",
        "--bg-y": "50%",
        "--duration": "300ms",
        "--opacity": "0",
        "--radius": "var(--radius)",
        "--icon-color": iconColor || "currentColor",
      } as React.CSSProperties}
      onPointerMove={(event) => {
        if (!refElement.current) return;
        
        const rect = refElement.current.getBoundingClientRect();
        const position = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
        
        const percentage = {
          x: (100 / rect.width) * position.x,
          y: (100 / rect.height) * position.y,
        };
        
        const delta = {
          x: percentage.x - 50,
          y: percentage.y - 50,
        };
        
        const rotateFactor = 0.5; // Increased for more pronounced effect
        
        refElement.current.style.setProperty("--m-x", `${percentage.x}%`);
        refElement.current.style.setProperty("--m-y", `${percentage.y}%`);
        refElement.current.style.setProperty("--r-x", `${delta.x * rotateFactor}deg`);
        refElement.current.style.setProperty("--r-y", `${-delta.y * rotateFactor}deg`);
        refElement.current.style.setProperty("--bg-x", `${50 + percentage.x / 4 - 12.5}%`);
        refElement.current.style.setProperty("--bg-y", `${50 + percentage.y / 3 - 16.67}%`);
      }}
      onPointerEnter={() => {
        isPointerInside.current = true;
        if (refElement.current) {
          refElement.current.style.setProperty("--opacity", "0.4"); // Increased opacity
          setTimeout(() => {
            if (isPointerInside.current) {
              refElement.current?.style.setProperty("--duration", "0ms");
            }
          }, 300);
        }
      }}
      onPointerLeave={() => {
        isPointerInside.current = false;
        if (refElement.current) {
          refElement.current.style.setProperty("--duration", "300ms");
          refElement.current.style.setProperty("--opacity", "0");
          refElement.current.style.setProperty("--r-x", "0deg");
          refElement.current.style.setProperty("--r-y", "0deg");
        }
      }}
    >
      <div 
        className={cn(
          "h-full p-8 rounded-lg border border-gray-100 shadow-sm",
          "origin-center transition-transform",
          "duration-[var(--duration)] ease-out",
          "[transform:rotateY(var(--r-x))_rotateX(var(--r-y))]",
          className
        )}
      >
        {children}
        
        <div className="absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-[var(--duration)] ease-out opacity-[var(--opacity)] mix-blend-soft-light bg-[radial-gradient(farthest-corner_circle_at_var(--m-x)_var(--m-y),_rgba(255,255,255,0.8)_5%,_rgba(255,255,255,0.4)_30%,_rgba(255,255,255,0)_70%)]" />
      </div>
    </div>
  );
};
