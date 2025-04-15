import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import GameBoard from './components/GameBoard';
import { useGameStore } from './store/gameStore';
import { fetchCountryCropData } from './gameLogic';
import { CountryCarousel } from './components/CountryCarousel';
import { Car as Farm, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { CountryOption } from './types';
import { CropSelection } from './components/CropSelection';

function App() {
  const { gameState, createGame, resetGame, refreshCountryOptions } = useGameStore();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [showCropSelection, setShowCropSelection] = useState(false);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Initialize country data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCountryCropData();
        setCountryOptions(data);
      } catch (error) {
        console.error('Failed to initialize data:', error);
        toast.error('Failed to load game data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleCountrySelect = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries([]);
      setSelectedCrop('');
      setShowCropSelection(false);
    } else {
      setSelectedCountries([country]);
    }
  };

  const handleCropSelect = (crop: string) => {
    setSelectedCrop(crop);
  };

  const handleGameStart = async () => {
    if (!selectedCountries.length || !selectedCrop) {
      toast.error('Please select both a country and a crop');
      return;
    }

    try {
      setIsCreatingGame(true);
      await createGame(selectedCountries[0], selectedCrop);
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error('Failed to start game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const handleNewOptions = async () => {
    setIsLoading(true);
    try {
      refreshCountryOptions();
      const data = await fetchCountryCropData();
      setCountryOptions(data);
      setSelectedCountries([]);
      setSelectedCrop('');
      setShowCropSelection(false);
    } catch (error) {
      console.error('Failed to refresh options:', error);
      toast.error('Failed to load new options');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGame = () => {
    resetGame();
    setSelectedCountries([]);
    setSelectedCrop('');
    setShowCropSelection(false);
    handleNewOptions();
    setShowInstructions(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Loading game data...</p>
        </div>
      </div>
    );
  }

  if (!countryOptions.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg">No country data available. Please refresh the page.</p>
          <button
            onClick={handleNewOptions}
            className="mt-4 px-4 py-2 bg-white text-green-800 rounded-lg hover:bg-green-100"
          >
            Retry Loading Data
          </button>
        </div>
      </div>
    );
  }

  if (gameState) {
    return (
      <>
        <GameBoard 
          gameState={gameState}
          onInvestmentSubmit={useGameStore.getState().makeInvestment}
          onGameStart={handleGameStart}
          countryOptions={countryOptions}
          selectedCountries={selectedCountries}
          onCountrySelect={handleCountrySelect}
          selectedCrop={selectedCrop}
          onCropSelect={handleCropSelect}
          onNewGame={handleNewGame}
        />
        <Toaster />
      </>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            <div className="text-center mb-12">
              <a 
                href="https://africathryves.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90 transition-opacity mb-6"
              >
                <img 
                  src="https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets//AT%20Logo_square_RYG.png"
                  alt="Africa Thryves Logo"
                  className="w-20 h-20 md:w-28 md:h-28 object-contain mx-auto"
                />
              </a>
              <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
                Welcome to Thryve Harvest
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the journey of African agricultural entrepreneurship—where each season brings risk, resilience, and reward.
              </p>
            </div>

            <div className="grid gap-8 mb-12">
              <div className="bg-gradient-to-br from-green-50 to-yellow-50 rounded-lg p-6 border border-yellow-100">
                <h2 className="text-2xl font-semibold text-green-800 mb-4">
                  Step into the life of an African farmer.
                </h2>
                <p className="text-gray-700 mb-4">
                  Build your agribusiness, manage uncertainty, and make bold choices to grow your future.
                </p>
                <p className="text-lg text-green-700 italic">
                  Your strategy, your land, your legacy.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 shadow-sm border border-red-100">
                  <h3 className="text-lg font-semibold mb-4 text-red-800">Game Mechanics</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Invest in crops each season
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Dice roll determines harvest yield
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Rolling a 7 means disaster
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Doubles = bonus multiplier
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-6 shadow-sm border border-yellow-100">
                  <h3 className="text-lg font-semibold mb-4 text-yellow-800">Strategy</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      Balance risk vs. reward
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      Save for tough seasons
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      Bigger investments = bigger wins (or losses)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                      Think long term
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 shadow-sm border border-green-100">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Victory</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      First to $7,000 wins
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Or have the most cash after 10 seasons
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Go bankrupt? You're out
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:from-red-700 hover:to-red-600 transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Begin Your Journey
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Find the full country object from countryOptions using the selected country name
  const selectedCountry = selectedCountries.length === 1 
    ? countryOptions.find(c => c.name === selectedCountries[0])
    : null;

  if (selectedCountry && showCropSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <CropSelection
              country={selectedCountry}
              selectedCrop={selectedCrop}
              onCropSelect={handleCropSelect}
              onGameStart={handleGameStart}
              isLoading={isCreatingGame}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 flex items-center justify-center gap-3 mb-4">
              <Farm className="w-10 h-10" />
              Thryve Harvest
            </h1>
            <p className="text-gray-600">Choose your game mode and start your agricultural journey</p>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Select Your Country</h2>
                <button
                  onClick={handleNewOptions}
                  className="text-green-600 hover:text-green-700"
                >
                  New Options
                </button>
              </div>
              
              <CountryCarousel
                selectedCountry={selectedCountries[0]}
                onCountrySelect={handleCountrySelect}
              />
            </div>

            <button
              onClick={() => setShowCropSelection(true)}
              disabled={selectedCountries.length === 0}
              className={`w-full py-4 rounded-lg text-lg font-semibold transition-all ${
                selectedCountries.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue to Crop Selection
            </button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;