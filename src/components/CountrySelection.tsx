import React from 'react';
import { CountryOption } from '../types';
import { Globe2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCountryFlag } from '../gameLogic';

interface CountrySelectionProps {
  countryOptions: CountryOption[];
  selectedCountries: string[];
  onCountrySelect: (country: string) => void;
  onNewOptions: () => void;
  onContinue: () => void;
}

export function CountrySelection({ 
  countryOptions,
  selectedCountries, 
  onCountrySelect,
  onContinue
}: CountrySelectionProps) {
  const [failedFlags, setFailedFlags] = React.useState<Set<string>>(new Set());
  const selectedCountry = selectedCountries[0];

  const handleContinue = () => {
    if (!selectedCountry) {
      toast.error('Please select a country first');
      return;
    }
    onContinue();
  };

  const handleImageError = (countryName: string) => {
    setFailedFlags(prev => new Set(prev).add(countryName));
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          Choose Your Country
        </h2>
        <p className="text-gray-600">
          Select a country to begin your agricultural journey
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-h-[340px] mb-8">
        {countryOptions.map((country) => {
          const isSelected = country.name === selectedCountry;
          const showFallback = failedFlags.has(country.name);
          const flagUrl = getCountryFlag(country.name);
          
          return (
            <button
              key={country.name}
              onClick={() => onCountrySelect(country.name)}
              className={`min-h-[200px] rounded-lg p-4 transition-all transform hover:scale-[1.02] ${
                isSelected
                  ? 'bg-green-50 border-2 border-green-500 shadow-lg'
                  : 'bg-gray-50 border-2 border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="h-full flex flex-col items-center justify-between">
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  {showFallback || !flagUrl ? (
                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Globe2 className="w-6 h-6 text-gray-400" />
                    </div>
                  ) : (
                    <img
                      src={flagUrl}
                      alt={`${country.name} flag`}
                      className="w-16 h-12 rounded shadow-sm object-cover"
                      onError={() => handleImageError(country.name)}
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-800 text-center leading-tight">
                    {country.name}
                  </h3>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                  <p className="text-sm text-gray-600 text-center">
                    {country.crops.length} crops available
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedCountry}
        className={`w-full py-4 rounded-lg text-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          selectedCountry
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        Continue to Crop Selection
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}