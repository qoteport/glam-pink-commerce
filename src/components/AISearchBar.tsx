import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PriceDisplay from './PriceDisplay';

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface AISearchBarProps {
  className?: string;
  onClose?: () => void;
}

const AISearchBar = ({ className, onClose }: AISearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [explanation, setExplanation] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-search', {
        body: { query: query.trim() }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Search Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setResults(data.products || []);
      setExplanation(data.explanation || '');

      if (data.products?.length === 0) {
        toast({
          title: 'No results',
          description: 'Try describing what you\'re looking for differently',
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = (productId: string) => {
    setShowResults(false);
    setQuery('');
    onClose?.();
    navigate(`/product/${productId}`); // AI search uses raw ID, ProductDetail handles both
  };

  const handleViewAll = () => {
    setShowResults(false);
    onClose?.();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <Sparkles size={16} className="absolute left-3 text-rosegold-500" />
          <Input
            type="text"
            placeholder="Describe what you're looking for... (e.g., 'long curly wig for beginners')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-10 border-blush-200 focus:border-blush-400"
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          <div className="absolute right-1 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setShowResults(false);
                }}
              >
                <X size={14} />
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSearching || !query.trim()}
              className="h-7 px-2 bg-gradient-to-r from-blush-500 to-rosegold-500"
            >
              {isSearching ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-blush-100 rounded-lg shadow-xl z-50 max-h-[70vh] overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-blush-500 mr-2" size={20} />
              <span className="text-gray-600">AI is searching...</span>
            </div>
          ) : results.length > 0 ? (
            <>
              {explanation && (
                <div className="px-4 py-2 bg-blush-50 border-b border-blush-100 text-sm text-gray-600">
                  <Sparkles size={14} className="inline mr-1 text-rosegold-500" />
                  {explanation}
                </div>
              )}
              <div className="divide-y divide-gray-100">
                {results.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-blush-50 transition-colors text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{product.category}</div>
                    </div>
                    <PriceDisplay price={product.price} className="font-semibold text-blush-600" />
                  </button>
                ))}
              </div>
              {results.length > 6 && (
                <button
                  onClick={handleViewAll}
                  className="w-full py-3 text-center text-blush-600 hover:bg-blush-50 font-medium border-t"
                >
                  View all {results.length} results
                </button>
              )}
            </>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p>No products found</p>
              <p className="text-sm mt-1">Try describing what you want differently</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISearchBar;
