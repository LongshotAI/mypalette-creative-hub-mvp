
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchAll, SearchResult, SearchFilters } from '@/lib/searchService';
import SearchBar from '@/components/search/SearchBar';
import SearchFilters from '@/components/search/SearchFilters';
import SearchResultCard from '@/components/search/SearchResultCard';
import { Loader2 } from 'lucide-react';
import DefaultLayout from '@/components/layout/DefaultLayout';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'all';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: initialType,
    category: 'all'
  });
  
  useEffect(() => {
    if (query) {
      performSearch(query, filters);
    } else {
      setResults([]);
    }
  }, [query, filters]);
  
  useEffect(() => {
    const newQuery = searchParams.get('q') || '';
    if (newQuery !== query) {
      setQuery(newQuery);
    }
  }, [searchParams]);
  
  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    try {
      const searchResults = await searchAll(searchQuery, searchFilters);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    
    // Update URL params
    const newParams = new URLSearchParams();
    if (newQuery) newParams.set('q', newQuery);
    if (filters.type && filters.type !== 'all') newParams.set('type', filters.type);
    if (filters.category && filters.category !== 'all') newParams.set('category', filters.category);
    
    setSearchParams(newParams);
  };
  
  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (newFilters.type && newFilters.type !== 'all') {
      newParams.set('type', newFilters.type);
    } else {
      newParams.delete('type');
    }
    
    if (newFilters.category && newFilters.category !== 'all') {
      newParams.set('category', newFilters.category);
    } else {
      newParams.delete('category');
    }
    
    setSearchParams(newParams);
  };
  
  return (
    <DefaultLayout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Search MyPalette</h1>
          
          <div className="mb-8">
            <SearchBar 
              size="lg" 
              initialQuery={query} 
              onSearch={handleSearch} 
            />
            
            <SearchFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Searching MyPalette...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {query && !results.length ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any matches for "{query}". Try different keywords or filters.
                  </p>
                </div>
              ) : (
                <>
                  {query && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Found {results.length} results for "{query}"
                    </p>
                  )}
                  
                  {results.map((result) => (
                    <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Search;
