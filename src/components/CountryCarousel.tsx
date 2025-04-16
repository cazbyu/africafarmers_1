import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Globe2, Search } from 'lucide-react';
import { CountryOption } from '../types';
import { getCountryFlag, fetchCountryCropData } from '../gameLogic';
import { useSwipeable } from 'react-swipeable';

interface CountryCarouselProps {
  selectedCountry: string | null;
  onCountrySelect: (country: string) => void;
}

export function CountryCarousel({ selectedCountry, onCountrySelect }: CountryCarouselProps) {
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [failedFlags, setFailedFlags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        setCurrentPage(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const data = await fetchCountryCropData();
        const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sortedData);
      } catch (error) {
        console.error('Failed to fetch country data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardsPerPage = isMobile ? 1 : 8;
  const totalPages = Math.ceil(filteredCountries.length / cardsPerPage);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 0) {
      setCurrentPage(totalPages - 1);
    } else if (newPage >= totalPages) {
      setCurrentPage(0);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => handlePageChange(currentPage + 1),
    onSwipedRight: () => handlePageChange(currentPage - 1),
    trackMouse: true,
    preventScrollOnSwipe: true,
    swipeDuration: 500,
    delta: 50,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === carouselRef.current) {
        if (e.key === 'ArrowLeft') {
          handlePageChange(currentPage - 1);
        } else if (e.key === 'ArrowRight') {
          handlePageChange(currentPage + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const handleImageError = (countryName: string) => {
    setFailedFlags(prev => new Set(prev).add(countryName));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const startIndex = currentPage * cardsPerPage;
  const visibleCountries = filteredCountries.slice(startIndex, startIndex + cardsPerPage);

  return (
    <div className="relative px-4 py-8 min-h-[520px] overflow-visible">
      <a 
        href="https://africathryves.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block text-center hover:opacity-90 transition-opacity mb-8"
      >
        <img 
          src="https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/AT%20Logo_square_RYG.png"
          alt="Africa Thryves Logo"
          className="w-14 h-14 md:w-20 md:h-20 object-contain mx-auto"
        />
      </a>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your country..."
            className="w-full px-4 py-3 pl-10 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition-colors"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div 
        ref={carouselRef}
        className="overflow-visible focus:outline-none"
        tabIndex={0}
        role="region"
        aria-label="Country selection carousel"
        {...handlers}
      >
        <div 
          className={`grid gap-4 transition-transform duration-300 ease-out ${
            isMobile ? 'grid-cols-1' : 'grid-cols-4 grid-rows-2'
          }`}
        >
          {visibleCountries.map((country) => {
            const flagUrl = getCountryFlag(country.name);
            const showFallback = failedFlags.has(country.name) || !flagUrl;

            return (
              <button
                key={country.name}
                onClick={() => onCountrySelect(country.name)}
                className={`aspect-[5/4] rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${
                  selectedCountry === country.name
                    ? 'ring-4 ring-green-500 bg-green-50 scale-[1.02]'
                    : 'ring-1 ring-gray-200 bg-yellow-50 hover:scale-[1.03] hover:shadow-md hover:ring-green-300 hover:bg-yellow-100'
                }`}
                aria-selected={selectedCountry === country.name}
                role="option"
              >
                <div className="flex flex-col items-center justify-center h-full p-4">
                  {showFallback ? (
                    <div className="w-16 h-12 flex items-center justify-center bg-gray-100 rounded mb-4">
                      <Globe2 className="w-6 h-6 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={flagUrl}
                      alt={`${country.name} flag`}
                      className="w-16 h-12 object-cover mb-4 rounded shadow-sm border border-black/20"
                      onError={() => handleImageError(country.name)}
                      loading="lazy"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-800 text-center line-clamp-2">
                    {country.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="p-2 rounded-full bg-white shadow-md hover:bg-green-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div
            className="flex gap-2 px-2 overflow-x-auto scrollbar-hide flex-nowrap max-w-[60%] scroll-smooth"
            role="tablist"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i)}
                className={`w-2 h-2 rounded-full shrink-0 transition-colors scroll-snap-align-center ${
                  currentPage === i ? 'bg-green-600' : 'bg-gray-300'
                }`}
                aria-label={`Go to page ${i + 1}`}
                aria-selected={currentPage === i}
                role="tab"
                style={{ scrollSnapAlign: 'center' }}
              />
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="p-2 rounded-full bg-white shadow-md hover:bg-green-50 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}