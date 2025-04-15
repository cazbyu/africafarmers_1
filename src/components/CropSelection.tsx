import React from 'react';
import { CountryOption } from '../types';
import * as Icons from 'lucide-react';
import { ArrowRight, Sprout, Loader2 } from 'lucide-react';

interface CropSelectionProps {
  country: CountryOption;
  selectedCrop: string;
  onCropSelect: (crop: string) => void;
  onGameStart: () => void;
  isLoading?: boolean;
}

export function CropSelection({ 
  country, 
  selectedCrop, 
  onCropSelect, 
  onGameStart,
  isLoading = false 
}: CropSelectionProps) {
  const handleCropSelect = (cropName: string) => {
    onCropSelect(cropName);
  };

  const getCropIcon = (cropName: string): string => {
    const cropIcons: { [key: string]: string } = {
      'Coffee': 'Coffee',
      'Tea': 'Leaf',
      'Wheat': 'Wheat',
      'Cotton': 'Flower',
      'Rice': 'Grain',
      'Maize': 'Sprout',
      'Cocoa': 'Bean',
      'Palm Oil': 'Tree',
      'Cassava': 'Plant',
      'Yams': 'Potato',
      'Bananas': 'Banana',
      'Olives': 'Tree',
      'Dates': 'Tree',
      'Groundnuts': 'Nut',
      'Sorghum': 'Wheat',
      'Millet': 'Grain',
      'Vanilla': 'Flower',
      'Sugar Cane': 'Plant',
      'Tobacco': 'Plant',
      'Oats': 'Wheat'
    };
    return cropIcons[cropName] || 'Sprout';
  };

  const normalizedCrops = React.useMemo(() => {
    if (!country?.crops || !Array.isArray(country.crops)) return [];

    return country.crops.map((crop: any) => ({
      name: crop.name || 'Unknown Crop',
      icon: getCropIcon(crop.name),
      fact: typeof crop.fact === 'string'
        ? crop.fact
        : crop.fact?.fact || 'No crop fact available'
    }));
  }, [country]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sprout className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          🌿 Select Your Crop
        </h2>
        <p className="text-xl text-gray-600">
          Choose a crop to cultivate in {country.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {normalizedCrops.map((crop) => {
          const IconComponent = Icons[crop.icon as keyof typeof Icons] || Sprout;
          const isSelected = selectedCrop === crop.name;

          return (
            <button
              key={crop.name}
              onClick={() => handleCropSelect(crop.name)}
              disabled={isLoading}
              className={`w-full p-6 rounded-lg text-left transition-all transform hover:scale-[1.02] ${
                isSelected
                  ? 'border-2 border-green-600 bg-green-50 shadow-lg'
                  : 'border-2 border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${
                  isSelected ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    isSelected ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
                <div>
                  <div className="font-semibold text-lg">{crop.name}</div>
                  <div className="text-gray-600 mt-1">{crop.fact}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onGameStart}
        disabled={!selectedCrop || isLoading}
        className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all transform ${
          selectedCrop && !isLoading
            ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02] shadow-lg'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Creating Game...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>🌱 Continue to Game</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        )}
      </button>
    </div>
  );
}
