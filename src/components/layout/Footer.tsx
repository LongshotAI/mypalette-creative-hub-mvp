import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { checkAdminStatus } from '@/lib/supabase';

const Footer: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check admin status when user changes
    const checkAdmin = async () => {
      if (user) {
        const adminType = await checkAdminStatus(user.id);
        setIsAdmin(!!adminType);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo variant="full" size="md" />
            <p className="text-sm text-muted-foreground max-w-xs">
              A minimalist, professional digital art portfolio builder for artists to showcase their work.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-4 uppercase tracking-wider text-muted-foreground">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/portfolios" className="text-sm hover:text-primary transition-colors">
                  Portfolios
                </Link>
              </li>
              <li>
                <Link to="/education" className="text-sm hover:text-primary transition-colors">
                  Education Hub
                </Link>
              </li>
              <li>
                <Link to="/open-calls" className="text-sm hover:text-primary transition-colors">
                  Open Calls
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm hover:text-primary transition-colors">
                  Creator Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-4 uppercase tracking-wider text-muted-foreground">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/education/articles" className="text-sm hover:text-primary transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/education/tutorials" className="text-sm hover:text-primary transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="/education/guides" className="text-sm hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-4 uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-sm hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link to="/admin" className="text-sm hover:text-primary transition-colors">
                    Admin Panel
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MyPalette by PPN. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Twitter
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Instagram
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
