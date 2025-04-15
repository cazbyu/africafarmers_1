import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sprout, Wheat, Coffee, Plane as Plant, Globe2 } from 'lucide-react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

interface CropFactsProps {
  countryName: string;
  onContinue: () => void;
  onBack: () => void;
}

export function CropFacts({ countryName, onContinue, onBack }: CropFactsProps) {
  const [crops, setCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [flagError, setFlagError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await fetch('https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/game-assets/2025.04.13_Africa%20Country_Top_Crops.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          complete: (results) => {
            const countryData = results.data
              .slice(1) // Skip header row
              .find((row: any[]) => row[0] === countryName);
            
            if (countryData) {
              const countryCrops = countryData.slice(1, 4).filter(crop => crop);
              setCrops(countryCrops);
              setError(null);
            } else {
              setError('No crop data found for this country');
            }
            setLoading(false);
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            setError('Failed to load crop data');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Failed to fetch CSV:', error);
        setError('Failed to load crop data');
        setLoading(false);
      }
    };

    if (countryName) {
      fetchCrops();
    } else {
      setError('No country selected');
      setLoading(false);
    }
  }, [countryName]);

  const handleContinue = async () => {
    if (!crops.length) {
      toast.error('No crops available for this country');
      return;
    }

    setTransitioning(true);
    try {
      // Store the selected country and crops in localStorage
      localStorage.setItem('selectedCountry', countryName);
      localStorage.setItem('selectedCrops', JSON.stringify(crops));
      
      // Add a small delay to show the transition state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onContinue();
    } catch (error) {
      console.error('Error during transition:', error);
      toast.error('Failed to proceed. Please try again.');
      setTransitioning(false);
    }
  };

  const getCountryFlag = (countryName: string) => {
    const countryMap: { [key: string]: string } = {
      'Algeria': 'dz', 'Angola': 'ao', 'Benin': 'bj', 'Botswana': 'bw',
      'Burkina Faso': 'bf', 'Burundi': 'bi', 'Cameroon': 'cm',
      'Cape Verde': 'cv', 'Central African Republic': 'cf', 'Chad': 'td',
      'Comoros': 'km', 'Congo': 'cg', 'Côte d\'Ivoire': 'ci',
      'Democratic Republic of the Congo': 'cd', 'Djibouti': 'dj',
      'Egypt': 'eg', 'Equatorial Guinea': 'gq', 'Eritrea': 'er',
      'Ethiopia': 'et', 'Gabon': 'ga', 'Gambia': 'gm', 'Ghana': 'gh',
      'Guinea': 'gn', 'Guinea-Bissau': 'gw', 'Kenya': 'ke',
      'Lesotho': 'ls', 'Liberia': 'lr', 'Libya': 'ly',
      'Madagascar': 'mg', 'Malawi': 'mw', 'Mali': 'ml',
      'Mauritania': 'mr', 'Mauritius': 'mu', 'Morocco': 'ma',
      'Mozambique': 'mz', 'Namibia': 'na', 'Niger': 'ne',
      'Nigeria': 'ng', 'Rwanda': 'rw', 'Senegal': 'sn',
      'Seychelles': 'sc', 'Sierra Leone': 'sl', 'Somalia': 'so',
      'South Africa': 'za', 'South Sudan': 'ss', 'Sudan': 'sd',
      'Tanzania': 'tz', 'Togo': 'tg', 'Tunisia': 'tn', 'Uganda': 'ug',
      'Zambia': 'zm', 'Zimbabwe': 'zw'
    };

    // Special cases with direct URLs
    const specialCases: { [key: string]: string } = {
      'Congo': 'https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/cg.png',
      'Democratic Republic of the Congo': 'https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/cd.png',
      'Côte d\'Ivoire': 'https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/ci.png',
      'São Tomé and Príncipe': 'https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/st.png'
    };

    if (specialCases[countryName]) {
      return specialCases[countryName];
    }

    const code = countryMap[countryName];
    return code ? `https://flagcdn.com/w160/${code}.png` : null;
  };

  const getCropIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Coffee className="w-6 h-6 text-green-600" />;
      case 1:
        return <Wheat className="w-6 h-6 text-yellow-600" />;
      case 2:
        return <Plant className="w-6 h-6 text-red-600" />;
      default:
        return <Sprout className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="text-green-600 hover:text-green-700 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Country Selection
        </button>
      </div>
    );
  }

  const flagUrl = getCountryFlag(countryName);

  return (
    <div className={`space-y-8 transition-opacity duration-300 ${transitioning ? 'opacity-50' : 'opacity-100'}`}>
      <button
        onClick={onBack}
        disabled={transitioning}
        className="text-green-600 hover:text-green-700 flex items-center gap-2 disabled:opacity-50"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Country Selection
      </button>

      <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-xl p-6 md:p-8 border border-green-100">
        <div className="flex flex-col items-center mb-8">
          {flagError || !flagUrl ? (
            <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <Globe2 className="w-12 h-12 text-gray-400" />
            </div>
          ) : (
            <img
              src={flagUrl}
              alt={`${countryName} flag`}
              className="w-32 h-auto rounded-lg shadow-md mb-6"
              onError={() => setFlagError(true)}
            />
          )}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
              Did You Know?
            </h2>
            <p className="text-lg md:text-xl text-gray-700">
              The top three crops produced in <span className="font-semibold">{countryName}</span> are:
            </p>
          </div>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {crops.map((crop, index) => (
            <div
              key={crop}
              className="bg-white rounded-lg p-4 shadow-sm border border-green-100 flex items-center gap-4 transform transition-all hover:scale-[1.02]"
            >
              <div className={`p-2 rounded-full ${
                index === 0 ? 'bg-green-100' :
                index === 1 ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                {getCropIcon(index)}
              </div>
              <span className="text-xl font-medium text-gray-800">{crop}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={transitioning || crops.length === 0}
        className={`w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-lg text-lg font-semibold transition-all transform flex items-center justify-center gap-2 shadow-lg ${
          transitioning || crops.length === 0
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:from-green-700 hover:to-green-600 hover:scale-[1.02]'
        }`}
      >
        {transitioning ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <Sprout className="w-6 h-6" />
        )}
        {transitioning ? 'Loading...' : 'Continue to Game'}
      </button>
    </div>
  );
}