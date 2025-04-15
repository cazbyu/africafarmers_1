import React, { useState, useEffect } from 'react';
import { Player, GameState, CountryOption } from '../types';
import { Coins, Car as Farm, Trophy, PlayCircle, MapPin, RefreshCw, Users, ExternalLink, ShoppingBag, Lightbulb, HelpCircle, Sprout, ArrowRight, Globe2, Heart, ArrowLeft, History } from 'lucide-react';
import { MAX_SEASONS, WINNING_AMOUNT, INITIAL_MONEY, getCountryInfo, ALL_COUNTRY_OPTIONS, getCountryFlag } from '../gameLogic';
import { useGameStore } from '../store/gameStore';
import { CropSelection } from './CropSelection';
import { RollHistory } from './RollHistory';

const didYouKnowFacts = [
  "Africa is home to 60% of the world's uncultivated arable land, holding immense potential for global food security.",
  "The Ethiopian coffee ceremony is a unique cultural ritual that can last for hours, celebrating one of Africa's most important crops.",
  "Cassava, a staple food in Africa, can be stored in the ground for up to 2 years, providing food security during lean times.",
  "African farmers grow over 1,000 different traditional crop varieties, contributing significantly to global agricultural biodiversity.",
  "The Sahel region's farmers have developed innovative drought-resistant farming techniques over generations.",
  "Ghana and Côte d'Ivoire together produce about 60% of the world's cocoa.",
  "Teff, an ancient grain from Ethiopia, is naturally gluten-free and rich in nutrients.",
  "African farmers often practice intercropping, growing multiple crops together to improve soil health and maximize yields."
];

interface GameBoardProps {
  gameState?: GameState;
  onInvestmentSubmit: (percentage: number) => void;
  onGameStart?: () => void;
  countryOptions?: CountryOption[];
  selectedCountries: string[];
  onCountrySelect: (country: string) => void;
  selectedCrop: string;
  onCropSelect: (crop: string) => void;
  onNewGame: () => void;
}

function GameBoard({ 
  gameState, 
  onInvestmentSubmit,
  onGameStart,
  countryOptions = [],
  selectedCountries,
  onCountrySelect,
  selectedCrop,
  onCropSelect,
  onNewGame
}: GameBoardProps) {
  const { resetGame } = useGameStore();
  const [investment, setInvestment] = useState<number>(70);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRollHistory, setShowRollHistory] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [previousMoney, setPreviousMoney] = useState<{[key: string]: number}>({});
  const [currentRoll, setCurrentRoll] = useState<number[] | null>(null);
  const [factIndex, setFactIndex] = useState(Math.floor(Math.random() * didYouKnowFacts.length));
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [isProcessingInvestment, setIsProcessingInvestment] = useState(false);

  // Clear dice display when processing starts
  useEffect(() => {
    if (isProcessingInvestment || isRolling) {
      setShowDiceRoll(false);
      setCurrentRoll(null);
    }
  }, [isProcessingInvestment, isRolling]);

  // Update money tracking
  useEffect(() => {
    if (gameState?.players && !isRolling && !isProcessingInvestment) {
      const newMoneyValues: {[key: string]: number} = {};
      gameState.players.forEach(player => {
        newMoneyValues[player.id] = player.money;
      });
      setPreviousMoney(newMoneyValues);
    }
  }, [gameState?.players, isRolling, isProcessingInvestment]);

  // Handle dice roll display
 // Only show dice roll AFTER all processing is done AND new season has started
useEffect(() => {
  if (
    gameState &&   
    gameState?.lastRoll &&
    gameState.lastRoll.length === 2 &&
    !isRolling &&
    !isProcessingInvestment &&
    gameState.currentPlayerIndex === 0 // Player 1's turn again
  ) {
    setCurrentRoll(gameState.lastRoll);
    setShowDiceRoll(true);
  } else {
    setCurrentRoll(null);
    setShowDiceRoll(false);
  }
}, [gameState?.lastRoll, isRolling, isProcessingInvestment, gameState?.currentPlayerIndex]);
  // Update fact index on season change
  useEffect(() => {
    if (gameState?.currentSeason) {
      setFactIndex(Math.floor(Math.random() * didYouKnowFacts.length));
    }
  }, [gameState?.currentSeason]);

  const handleInvestmentSubmit = async () => {
    if (!onInvestmentSubmit) return;

    try {
      setIsProcessingInvestment(true);
      setIsRolling(true);
      setShowDiceRoll(false);
      setCurrentRoll(null);

      // Store current money values before investment
      if (gameState?.players) {
        const currentMoney: {[key: string]: number} = {};
        gameState.players.forEach(player => {
          currentMoney[player.id] = player.money;
        });
        setPreviousMoney(currentMoney);
      }

      await onInvestmentSubmit(investment);

    } finally {
      // Delay clearing the processing states to ensure smooth transition
      setTimeout(() => {
        setIsRolling(false);
        setIsProcessingInvestment(false);
      }, 2000);
    }
  };

  const handleNewGame = () => {
    resetGame();
    onNewGame();
  };

  const calculateInvestmentAmounts = (total: number, percentage: number) => {
    const investmentAmount = Math.floor((total * percentage) / 100);
    const reservedAmount = total - investmentAmount;
    return { investmentAmount, reservedAmount };
  };

  const renderDie = (value: number, isRolling: boolean = false) => {
    const dotPositions = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    const getDotClass = (position: string) => {
      switch (position) {
        case 'top-left': return 'top-2 left-2';
        case 'top-right': return 'top-2 right-2';
        case 'middle-left': return 'top-1/2 -translate-y-1/2 left-2';
        case 'middle-right': return 'top-1/2 -translate-y-1/2 right-2';
        case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        case 'bottom-left': return 'bottom-2 left-2';
        case 'bottom-right': return 'bottom-2 right-2';
        default: return '';
      }
    };

    return (
      <div 
        className={`w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow relative ${
          isRolling ? 'animate-[rollDice_1s_ease-in-out_infinite]' : ''
        }`}
      >
        {!isRolling && dotPositions[value as keyof typeof dotPositions].map((position, index) => (
          <div
            key={index}
            className={`absolute w-2 h-2 bg-black rounded-full ${getDotClass(position)}`}
          />
        ))}
      </div>
    );
  };

  const renderMoneyValue = (player: Player) => {
    const prevValue = previousMoney[player.id] || player.money;
    const currentValue = player.money;
    const isIncreasing = currentValue > prevValue;
    const isDecreasing = currentValue < prevValue;

    return (
      <span 
        className={`money-value font-bold ${
          isRolling || isProcessingInvestment ? 'opacity-50' : 
          isIncreasing ? 'text-green-600 number-transition' : 
          isDecreasing ? 'text-red-600 number-transition' : ''
        }`}
      >
        ${(isRolling || isProcessingInvestment) ? prevValue.toLocaleString() : currentValue.toLocaleString()}
      </span>
    );
  };

  const renderDiceRollSection = () => {
    if (!showDiceRoll || !currentRoll || isRolling || isProcessingInvestment) {
      return null;
    }

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <div className="flex items-center justify-center gap-4 mb-3">
          {currentRoll.map((value, index) => (
            <div key={`die-${index}`}>
              {renderDie(value, false)}
            </div>
          ))}
        </div>
        <div className="text-center text-amber-800 font-medium">
          {(() => {
            const sum = currentRoll[0] + currentRoll[1];
            const isDouble = currentRoll[0] === currentRoll[1];
            
            if (sum === 7) {
              return "Crops destroyed! All invested money lost";
            }
            if (isDouble) {
              return "Double! Investment doubled";
            }
            return `Investment increased by ${sum * 3}%`;
          })()}
        </div>
      </div>
    );
  };

  const sortedPlayers = gameState?.players ? 
    [...gameState.players].sort((a, b) => a.playerNumber - b.playerNumber) : 
    [];

  const currentPlayer = gameState?.players?.[gameState.currentPlayerIndex];
  const { investmentAmount, reservedAmount } = currentPlayer ? 
    calculateInvestmentAmounts(currentPlayer.money, investment) : 
    { investmentAmount: 0, reservedAmount: 0 };
  const isFirstPlayerInSeason = gameState?.currentPlayerIndex === 0;
  const countryInfo = currentPlayer?.country ? getCountryInfo(currentPlayer.country) : null;
  const isCurrentPlayerTurn = currentPlayer && !currentPlayer.isAI;

  if (!gameState) {
    const selectedCountry = selectedCountries.length === 1 
      ? ALL_COUNTRY_OPTIONS.find(c => c.name === selectedCountries[0])
      : null;

    if (selectedCountry) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <button
                onClick={() => onCountrySelect(selectedCountry.name)}
                className="text-green-600 hover:text-green-700 mb-8 flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Country Selection
              </button>

              <CropSelection
                country={selectedCountry}
                selectedCrop={selectedCrop}
                onCropSelect={onCropSelect}
                onGameStart={onGameStart}
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
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Your Region ({selectedCountries.length}/1)
                  </h2>
                  <button
                    onClick={handleNewGame}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Options
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {countryOptions.map((country) => {
                    const flagUrl = getCountryFlag(country.name);
                    return (
                      <button
                        key={country.name}
                        onClick={() => onCountrySelect(country.name)}
                        className={`p-4 rounded-lg border-2 text-left relative ${
                          selectedCountries.includes(country.name)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-200'
                        }`}
                        disabled={selectedCountries.length >= 1 && !selectedCountries.includes(country.name)}
                      >
                        {selectedCountries.includes(country.name) && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center">
                            {selectedCountries.indexOf(country.name) + 1}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {flagUrl && (
                            <img
                              src={flagUrl}
                              alt={`${country.name} flag`}
                              className="w-8 h-auto rounded shadow-sm"
                            />
                          )}
                          <h3 className="font-medium">{country.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Available Crops: {country.crops.length}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={onGameStart}
                disabled={selectedCountries.length === 0}
                className={`w-full py-3 rounded-lg text-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  selectedCountries.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <PlayCircle className="w-6 h-6" />
                Start Your Journey
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Farm className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800">
                Season {gameState.currentSeason}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowInstructions(true)}
                className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm sm:text-base"
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Instructions</span>
              </button>
              {gameState.rollHistory.length > 0 && (
                <button
                  onClick={() => setShowRollHistory(true)}
                  className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm sm:text-base"
                >
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Roll History</span>
                </button>
              )}
              <button
                onClick={onNewGame}
                className="text-green-600 hover:text-green-700 flex items-center gap-1 text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">New Game</span>
              </button>
            </div>
          </div>

          {gameState.gameOver && gameState.winner && (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-center text-green-800 mb-2">
                Player {gameState.winner.playerNumber} from {gameState.winner.country} Wins!
              </h2>
              <p className="text-center text-green-700">
                {gameState.winner.money >= WINNING_AMOUNT
                  ? `Reached the winning amount of $${WINNING_AMOUNT.toLocaleString()}!`
                  : gameState.currentSeason >= MAX_SEASONS
                  ? `Most capital after ${MAX_SEASONS} seasons with $${gameState.winner.money.toLocaleString()}`
                  : 'Last player standing!'}
              </p>
            </div>
          )}

          {isCurrentPlayerTurn && !gameState.gameOver && (
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-green-800 mb-4">
                Your Turn - Make Your Investment
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Investment Percentage
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={investment}
                    onChange={(e) => setInvestment(parseInt(e.target.value))}
                    className="investment-slider"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>0%</span>
                    <span>{investment}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Investment</div>
                    <div className="text-lg font-semibold text-green-600">
                      ${investmentAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 mb-1">Reserved</div>
                    <div className="text-lg font-semibold text-blue-600">
                      ${reservedAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleInvestmentSubmit}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Confirm Investment
                </button>
              </div>
            </div>
          )}

          {(isRolling || isProcessingInvestment) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
              </div>
              <div className="text-center text-amber-800 font-medium mt-2">
                Processing season outcome...
              </div>
            </div>
          )}

          {renderDiceRollSection()}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedPlayers.map((player) => {
              const flagUrl = player.country ? getCountryFlag(player.country) : '';
              const isCurrentPlayer = player === currentPlayer;
              const isWinner = gameState.gameOver && gameState.winner?.id === player.id;
              
              return (
                <div
                  key={player.id}
                  className={`rounded-lg border-2 p-4 relative ${
                    isWinner
                      ? 'border-yellow-500 bg-yellow-50'
                      : isCurrentPlayer
                      ? 'border-green-500 bg-green-50'
                      : player.isBankrupt
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {flagUrl && (
                      <img
                        src={flagUrl}
                        alt={`${player.country} flag`}
                        className="w-6 h-auto rounded"
                      />
                    )}
                    <div className="font-medium">
                      {player.isAI ? `${player.name} (AI)` : player.name}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{player.country}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-gray-600" />
                      <div className="text-sm">
                        Available Capital: {renderMoneyValue(player)}
                      </div>
                    </div>

                    {player.lastInvestmentPercentage !== null && (
                      <div className="text-sm text-gray-600">
                        Last Investment: {player.lastInvestmentPercentage}%
                      </div>
                    )}
                  </div>

                  {player.isBankrupt && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                      <div className="text-red-600 font-semibold">Bankrupt</div>
                    </div>
                  )}

                  {isWinner && (
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <Lightbulb className="w-5 h-5" />
                <span className="font-semibold">Did You Know?</span>
              </div>
              <p className="text-amber-800">{didYouKnowFacts[factIndex]}</p>
            </div>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8 relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Farm className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-green-800 mb-4">
                Thryve Harvest Instructions
              </h1>
              <p className="text-xl text-gray-600">
                Experience the challenges and triumphs of agricultural entrepreneurship in Africa
              </p>
            </div>

            <div className="grid gap-8 mb-12">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe2 className="w-8 h-8 text-green-600" />
                  <h2 className="text-2xl font-semibold text-green-800">Your Journey</h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Step into the shoes of an agricultural entrepreneur in Africa. Choose your country, 
                  manage your resources, and make strategic decisions to grow your farming enterprise.
                </p>
                <div className="text-sm text-green-700 bg-green-100 rounded p-3">
                  Through education and technology, African farmers are building resilient and profitable businesses.
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Sprout className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Game Mechanics</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Each season, invest in your crops</li>
                    <li>• Roll determines your harvest returns</li>
                    <li>• Rolling 7 destroys crops</li>
                    <li>• Doubles multiply your investment</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Coins className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Strategy</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Balance risk and reward</li>
                    <li>• Keep reserves for bad seasons</li>
                    <li>• Higher investment = higher stakes</li>
                    <li>• Plan for long-term growth</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Trophy className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold">Victory</h3>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Be the first to reach $7,000 to win OR</li>
                    <li>• Have the most capital after 10 Seasons</li>
                    <li>• Stay solvent - bankruptcy means elimination!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowInstructions(false)}
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                Return to Game
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showRollHistory && (
        <RollHistory
          rollHistory={gameState.rollHistory}
          onBack={() => setShowRollHistory(false)}
        />
      )}
    </div>
  );
}

export default GameBoard;