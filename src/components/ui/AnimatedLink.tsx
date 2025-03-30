
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AnimatedLinkProps {
  to: string;
  label: string;
  className?: string;
  activeClassName?: string;
}

const AnimatedLink: React.FC<AnimatedLinkProps> = ({ 
  to, 
  label, 
  className = '', 
  activeClassName = ''
}) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link 
      to={to} 
      className={cn(
        "relative px-3 py-2 text-sm font-medium transition-colors duration-300 hover:text-primary",
        className,
        isActive ? `text-primary ${activeClassName}` : "text-muted-foreground"
      )}
    >
      {label}
      <span 
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.5 bg-primary transform transition-transform duration-300",
          isActive ? "scale-x-100" : "scale-x-0 hover:scale-x-100"
        )}
      />
    </Link>
  );
};

export default AnimatedLink;
