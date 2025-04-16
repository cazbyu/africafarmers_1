import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import GameBoard from './components/GameBoard';
import { useGameStore } from './store/gameStore';
import { fetchCountryCropData } from './gameLogic';
import { CountryCarousel } from './components/CountryCarousel';
import { Globe2, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { CountryOption } from './types';
import { CropSelection } from './components/CropSelection';

function App() {
  const { gameState, createGame, resetGame } = useGameStore();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [showCropSelection, setShowCropSelection] = useState(false);
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

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
      setShowCropSelection(true);
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

  const handleNewGame = () => {
    resetGame();
    setSelectedCountries([]);
    setSelectedCrop('');
    setShowCropSelection(false);
    setShowInstructions(true);
  };

  const handleBackToCountrySelection = () => {
    setShowCropSelection(false);
    setSelectedCrop('');
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
            onClick={() => window.location.reload()}
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
          setShowCropSelection={setShowCropSelection}
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
                  src="https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/AT%20Logo_square_RYG.png"
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

            <p className="text-center font-semibold text-xs sm:text-sm md:text-base text-gray-800 mt-6 mb-6 px-3 leading-tight">
              The best thing? Your participation helps build a powerful ecosystem that supports African entrepreneurs!{' '}
              <a href="#" className="text-green-600 hover:underline font-medium whitespace-nowrap">Learn how</a>
            </p>

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

  const selectedCountry = selectedCountries.length === 1 
    ? countryOptions.find(c => c.name === selectedCountries[0])
    : null;

  if (selectedCountry && showCropSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={handleBackToCountrySelection}
                className="text-green-600 hover:text-green-700 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Country Selection
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="text-green-600 hover:text-green-700 flex items-center gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                Instructions
              </button>
            </div>
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
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Instructions
            </button>
          </div>
          <div className="space-y-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <img 
                  src="https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/game-assets/TH%20Logo.png"
                  alt="Thryve Harvest Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-green-800 mb-4">
                Select Your Country
              </h2>
              <p className="text-gray-600 mb-8">
                Choose a country to begin your agricultural journey
              </p>
              
              <CountryCarousel
                selectedCountry={selectedCountries[0]}
                onCountrySelect={handleCountrySelect}
              />
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;