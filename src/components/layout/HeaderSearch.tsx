
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import SearchBar from '@/components/search/SearchBar';

const HeaderSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl top-[15%] translate-y-0">
        <div className="flex items-center">
          <h2 className="text-lg font-medium mb-0 flex-1">Search MyPalette</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="pt-2">
          <SearchBar 
            size="lg"
            placeholder="Search for artists, portfolios, open calls..." 
            onSearch={handleSearch}
            initialQuery={query} 
          />
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to search or click the search icon
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeaderSearch;
