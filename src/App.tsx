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

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
            <div className="text-center mb-8">
              <a href="https://www.africathryves.com" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/game-assets//TH%20Logo.png"
                  alt="Thryve Harvest Logo"
                  className="h-20 w-auto mx-auto mb-4"
                />
              </a>
              <h1 className="text-4xl font-bold text-green-800 mb-4">Welcome to Thryve Harvest</h1>
              <p className="text-xl text-gray-600">
                Experience the journey of African agricultural entrepreneurship—
                where each season brings risk, resilience, and reward.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
              <h2 className="text-xl font-semibold text-green-800 mb-1">Step into the life of an African farmer.</h2>
              <p>
                Build your agribusiness, manage uncertainty, and make bold choices to grow your future.
                <br /><em>Your strategy, your land, your legacy.</em>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-red-50 rounded-lg p-6 shadow">
                <h3 className="text-red-700 font-semibold mb-2">Game Mechanics</h3>
                <ul className="list-disc pl-5 text-red-700 space-y-1 text-sm">
                  <li>Invest in crops each season</li>
                  <li>Dice roll determines harvest yield</li>
                  <li>Rolling a 7 means disaster</li>
                  <li>Doubles = bonus multiplier</li>
                </ul>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 shadow">
                <h3 className="text-yellow-700 font-semibold mb-2">Strategy</h3>
                <ul className="list-disc pl-5 text-yellow-700 space-y-1 text-sm">
                  <li>Balance risk vs. reward</li>
                  <li>Save for tough seasons</li>
                  <li>Bigger investments = bigger wins (or losses)</li>
                  <li>Think long term</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-lg p-6 shadow">
                <h3 className="text-green-700 font-semibold mb-2">Victory</h3>
                <ul className="list-disc pl-5 text-green-700 space-y-1 text-sm">
                  <li>First to $7,000 wins</li>
                  <li>Or have the most cash after 10 seasons</li>
                  <li>Go bankrupt? You're out</li>
                </ul>
              </div>
            </div>

            <p className="text-center font-semibold text-gray-800 mt-8">
              The best thing? Your participation helps build a powerful ecosystem that supports African entrepreneurs!
              <br />
              <a
                href="https://www.africathryves.com"
                target="_blank"
                className="text-green-600 hover:underline font-medium"
              >
                Learn how
              </a>
            </p>

            <div className="text-center">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                Begin Your Journey <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
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
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-green-600 hover:text-green-700 flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Instructions
            </button>
          </div>
          <div className="space-y-6">
            <div className="text-center">
              <a
                href="https://www.africathryves.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:opacity-90 transition-opacity mb-4"
              >
                <img
                  src="https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/game-assets//TH%20Logo.png"
                  alt="Thryve Harvest Logo"
                  className="h-20 w-auto object-contain mx-auto"
                />
              </a>
              <h2 className="text-3xl font-bold text-green-800 mb-2">Select Your Country</h2>
              <p className="text-gray-600 mb-8">Choose a country to begin your agricultural journey</p>
            </div>
            <CountryCarousel
              selectedCountry={selectedCountries[0]}
              onCountrySelect={handleCountrySelect}
            />
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
