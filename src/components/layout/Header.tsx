
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import AnimatedLink from '../ui/AnimatedLink';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out",
        isScrolled 
          ? "py-3 bg-white/80 backdrop-blur-lg shadow-sm border-b" 
          : "py-5 bg-transparent"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Logo variant="full" size={isScrolled ? "sm" : "md"} />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <AnimatedLink to="/portfolios" label="Portfolios" />
          <AnimatedLink to="/education" label="Education Hub" />
          <AnimatedLink to="/open-calls" label="Open Calls" />
          <div className="ml-4">
            <Button asChild size="sm" variant="default" className="rounded-full px-6">
              <a href="/sign-in">Sign In</a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-700 hover:text-gray-900 focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-white transform transition-transform ease-in-out duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ top: '60px' }}
      >
        <nav className="flex flex-col p-5 space-y-5">
          <AnimatedLink 
            to="/portfolios" 
            label="Portfolios" 
            className="text-lg py-3"
            activeClassName="font-medium"
          />
          <AnimatedLink 
            to="/education" 
            label="Education Hub" 
            className="text-lg py-3"
            activeClassName="font-medium"
          />
          <AnimatedLink 
            to="/open-calls" 
            label="Open Calls" 
            className="text-lg py-3"
            activeClassName="font-medium"
          />
          <Button asChild size="lg" variant="default" className="mt-4 w-full rounded-full">
            <a href="/sign-in">Sign In</a>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
