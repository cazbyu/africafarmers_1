import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/gameStore';
import { Users, Plus, LogIn, RefreshCw, PlayCircle, Bot, UserPlus, Clock, HelpCircle, Sprout, Coins, Trophy, ArrowRight, Globe2, Car as Farm, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { ALL_COUNTRY_OPTIONS, getGameOptions } from '../gameLogic';
import { sessionUserId } from '../store/gameStore';

interface Game {
  id: string;
  status: string;
  auto_start_time: string;
  players: {
    country: string;
    is_host: boolean;
    user_id: string;
    player_number: number;
  }[];
}

interface MultiplayerLobbyProps {
  selectedCountries: string[];
  onCountrySelect: (country: string) => void;
}

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

export function MultiplayerLobby({ selectedCountries, onCountrySelect }: MultiplayerLobbyProps) {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<Game[]>([]);
  const [countryOptions, setCountryOptions] = useState(getGameOptions().COUNTRY_OPTIONS);
  const { createGame, joinGame, startGame, gameId } = useGameStore();
  const [showGameModeSelect, setShowGameModeSelect] = useState(false);
  const [countdowns, setCountdowns] = useState<{[key: string]: number}>({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentFact] = useState(Math.floor(Math.random() * didYouKnowFacts.length));

  useEffect(() => {
    fetchGames();
    
    const subscription = supabase
      .channel('games_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'games' 
      }, () => {
        fetchGames();
      })
      .subscribe();

    const interval = setInterval(() => {
      setCountdowns(prev => {
        const now = Date.now();
        const updated: {[key: string]: number} = {};
        
        games.forEach(game => {
          if (game.auto_start_time) {
            const endTime = new Date(game.auto_start_time).getTime();
            const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
            if (remaining > 0) {
              updated[game.id] = remaining;
            }
          }
        });
        
        return updated;
      });
    }, 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [games]);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          players!players_game_id_fkey (
            country,
            is_host,
            user_id,
            player_number
          )
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Fetch games error:', error);
        throw error;
      }
      
      const now = Date.now();
      const newCountdowns: {[key: string]: number} = {};
      data?.forEach(game => {
        if (game.auto_start_time) {
          const endTime = new Date(game.auto_start_time).getTime();
          const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
          if (remaining > 0) {
            newCountdowns[game.id] = remaining;
          }
        }
      });
      setCountdowns(newCountdowns);
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to fetch games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateGame = async () => {
    if (selectedCountries.length === 0) {
      toast.error('Please select a country');
      return;
    }
    setShowGameModeSelect(true);
  };

  const handleStartComputerGame = async () => {
    if (selectedCountries.length === 0) {
      toast.error('Please select a country');
      return;
    }
    try {
      setLoading(true);
      const gameId = await createGame(selectedCountries[0]);
      if (gameId) {
        await startGame(gameId, true);
      }
      setShowGameModeSelect(false);
    } catch (error) {
      console.error('Error starting computer game:', error);
      toast.error('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleStartMultiplayerGame = async () => {
    if (selectedCountries.length === 0) {
      toast.error('Please select a country');
      return;
    }
    try {
      setLoading(true);
      await createGame(selectedCountries[0]);
      setShowGameModeSelect(false);
    } catch (error) {
      console.error('Error creating multiplayer game:', error);
      toast.error('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (selectedCountries.length === 0) {
      toast.error('Please select a country');
      return;
    }
    try {
      setLoading(true);
      await joinGame(gameId, selectedCountries[0]);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (gameId: string) => {
    try {
      setLoading(true);
      await startGame(gameId, true);
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-600 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Farm className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-green-800 mb-4">
                Welcome to Thryve Harvest
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
                Begin Your Journey
                <ArrowRight className="w-6 h-6" />
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
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 text-amber-700 mb-2">
              <Lightbulb className="w-5 h-5" />
              <span className="font-semibold">Did You Know?</span>
            </div>
            <p className="text-amber-800">{didYouKnowFacts[currentFact]}</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-green-800 flex items-center justify-center gap-3 mb-4">
              <Farm className="w-10 h-10" />
              Game Lobby
            </h1>
            <p className="text-gray-600">Choose your game mode and start your agricultural journey</p>
          </div>

          {showGameModeSelect ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center mb-4">Select Game Mode</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleStartComputerGame}
                  className="p-6 border-2 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center gap-4"
                >
                  <Bot className="w-12 h-12 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Play vs Computer</h3>
                    <p className="text-sm text-gray-600">
                      Start immediately with AI opponents
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleStartMultiplayerGame}
                  className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center gap-4"
                >
                  <UserPlus className="w-12 h-12 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Multiplayer</h3>
                    <p className="text-sm text-gray-600">
                      Create a game and wait for other players
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowGameModeSelect(false)}
                className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Your Region ({selectedCountries.length}/1)
                  </h2>
                  <button
                    onClick={() => setCountryOptions(getGameOptions().COUNTRY_OPTIONS)}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Options
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-24">
                  {countryOptions.map((country) => {
                    const flagUrl = getCountryFlag(country.name);
                    const isSelected = selectedCountries.includes(country.name);
                    
                    return (
                      <button
                        key={country.name}
                        onClick={() => onCountrySelect(country.name)}
                        className={`p-4 rounded-lg border-2 text-left relative bg-gray-50 transition-colors ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                        disabled={selectedCountries.length >= 1 && !isSelected}
                      >
                        {isSelected && (
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

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Available Games</h2>
                  <button
                    onClick={handleCreateGame}
                    disabled={selectedCountries.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Create Game
                  </button>
                </div>

                <div className="grid gap-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      Loading games...
                    </div>
                  ) : games.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      No games available. Create one to get started!
                    </div>
                  ) : (
                    games.map((game) => {
                      const hasJoined = game.players.some(p => p.user_id === sessionUserId);
                      const isHost = game.players.some(p => p.user_id === sessionUserId && p.is_host);
                      const countdown = countdowns[game.id];
                      
                      return (
                        <div
                          key={game.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">Game #{game.id.slice(0, 8)}</h3>
                              <p className="text-sm text-gray-500">
                                Players: {game.players.length}/4
                              </p>
                              <div className="text-sm text-gray-500">
                                Countries: {game.players
                                  .sort((a, b) => a.player_number - b.player_number)
                                  .map(p => p.country)
                                  .join(', ')}
                              </div>
                            </div>
                            {countdown && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <Clock className="w-5 h-5" />
                                <span className="font-medium">{formatCountdown(countdown)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {hasJoined && isHost && (
                              <button
                                onClick={() => handleStartGame(game.id)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                              >
                                <PlayCircle className="w-5 h-5" />
                                Start Now
                              </button>
                            )}
                            {!hasJoined && (
                              <button
                                onClick={() => handleJoinGame(game.id)}
                                disabled={!selectedCountries.length || game.players.length >= 4}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                <LogIn className="w-5 h-5" />
                                Join
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCountryFlag(countryName: string) {
  const countryMap: { [key: string]: string } = {
    'Ethiopia': 'et', 'Kenya': 'ke', 'Nigeria': 'ng', 'Ghana': 'gh',
    'Tanzania': 'tz', 'Uganda': 'ug', 'Senegal': 'sn', 'Mali': 'ml',
    'Zimbabwe': 'zw', 'Côte d\'Ivoire': 'ci', 'Mozambique': 'mz',
    'Zambia': 'zm', 'Rwanda': 'rw', 'Burkina Faso': 'bf', 'Malawi': 'mw',
    'Madagascar': 'mg', 'Cameroon': 'cm', 'Sudan': 'sd', 'South Africa': 'za',
    'Angola': 'ao', 'Congo': 'cg', 'Benin': 'bj', 'Togo': 'tg', 'Niger': 'ne',
    'Algeria': 'dz', 'Botswana': 'bw', 'Burundi': 'bi', 'Cape Verde': 'cv',
    'Central African Republic': 'cf', 'Chad': 'td', 'Comoros': 'km',
    'Democratic Republic of the Congo': 'cd', 'Djibouti': 'dj', 'Egypt': 'eg',
    'Equatorial Guinea': 'gq', 'Eritrea': 'er', 'Gabon': 'ga', 'Gambia': 'gm',
    'Guinea': 'gn', 'Guinea-Bissau': 'gw', 'Lesotho': 'ls', 'Liberia': 'lr',
    'Libya': 'ly', 'Mauritania': 'mr', 'Mauritius': 'mu', 'Morocco': 'ma',
    'Namibia': 'na', 'São Tomé and Príncipe': 'st', 'Seychelles': 'sc',
    'Sierra Leone': 'sl', 'Somalia': 'so', 'South Sudan': 'ss',
    'Swaziland': 'sz', 'Tunisia': 'tn'
  };
  return countryMap[countryName] ? `https://flagcdn.com/w40/${countryMap[countryName]}.png` : '';
}