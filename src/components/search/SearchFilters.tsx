
import React from 'react';
import { CheckIcon, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SearchFilters as SearchFiltersType } from '@/lib/searchService';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
}

const SearchFilters = ({ filters, onFilterChange }: SearchFiltersProps) => {
  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type });
  };
  
  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category });
  };
  
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Content Type
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={!filters.type || filters.type === 'all'}
            onCheckedChange={() => handleTypeChange('all')}
          >
            All Types
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.type === 'portfolio'}
            onCheckedChange={() => handleTypeChange('portfolio')}
          >
            Portfolios
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.type === 'artist'}
            onCheckedChange={() => handleTypeChange('artist')}
          >
            Artists
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.type === 'opencall'}
            onCheckedChange={() => handleTypeChange('opencall')}
          >
            Open Calls
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.type === 'education'}
            onCheckedChange={() => handleTypeChange('education')}
          >
            Educational Resources
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Optional category filter - can be expanded based on content type */}
      {filters.type === 'education' && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Category
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filter By Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={!filters.category || filters.category === 'all'}
              onCheckedChange={() => handleCategoryChange('all')}
            >
              All Categories
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'business'}
              onCheckedChange={() => handleCategoryChange('business')}
            >
              Business
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'technique'}
              onCheckedChange={() => handleCategoryChange('technique')}
            >
              Technique
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.category === 'inspiration'}
              onCheckedChange={() => handleCategoryChange('inspiration')}
            >
              Inspiration
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default SearchFilters;
