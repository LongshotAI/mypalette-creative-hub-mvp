
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  variant = 'full' 
}) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <Link to="/" className={`inline-flex items-center ${className}`}>
      <div className="relative">
        <img 
          src="/lovable-uploads/989cbf61-b6e6-42ab-b88c-4f5184336c53.png" 
          alt="PPN Logo" 
          className={`${sizeClasses[size]} w-auto object-contain transition-all duration-300 hover:scale-105`}
        />
        {variant === 'full' && (
          <span className="ml-3 text-xl font-mono font-bold tracking-tighter">
            MyPalette
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
