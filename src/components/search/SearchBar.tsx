
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  placeholder?: string;
  initialQuery?: string;
}

const SearchBar = ({
  onSearch,
  size = 'md',
  className = '',
  placeholder = 'Search portfolios, artists, open calls...',
  initialQuery = ''
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (onSearch) {
      // Debounce search
      const timeout = setTimeout(() => {
        onSearch(value);
      }, 300);
      
      setSearchTimeout(timeout);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        // If no onSearch is provided, navigate to search page
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };
  
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative flex w-full ${className}`}>
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className={`pr-10 w-full ${sizeClasses[size]}`}
        />
        <Button 
          type="submit" 
          size="icon" 
          variant="ghost" 
          className="absolute right-0 top-0 h-full px-3"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
