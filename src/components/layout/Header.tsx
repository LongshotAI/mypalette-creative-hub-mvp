
import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import Logo from '../common/Logo';
import AnimatedLink from '../ui/AnimatedLink';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    {user.user_metadata.full_name || 'Account'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="ppn-button">
                <Link to="/sign-in">Sign In</Link>
              </Button>
            )}
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
          
          {user ? (
            <>
              <Link to="/dashboard" className="text-lg py-3 text-primary font-medium">
                Dashboard
              </Link>
              <Button 
                onClick={() => signOut()} 
                variant="outline" 
                className="mt-4 w-full justify-start text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="ppn-button w-full mt-4">
              <Link to="/sign-in">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
