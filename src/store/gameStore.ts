import { create } from 'zustand';
import { GameState, Player } from '../types';
import { calculateSeasonResult, checkWinCondition, getAIDecision, rollDice, getRollOutcome, MAX_SEASONS, resetCountryTracking, getGameOptions } from '../gameLogic';
import toast from 'react-hot-toast';

export const sessionUserId = crypto.randomUUID();

interface GameStore {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  createGame: (playerCountry: string, selectedCrop: string) => Promise<void>;
  makeInvestment: (percentage: number) => Promise<void>;
  processAITurns: () => Promise<void>;
  resetGame: () => void;
  setGameState: (game: any) => void;
  refreshCountryOptions: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  loading: false,
  error: null,

  setGameState: (game) => {
    set({ gameState: game ? transformGameState(game) : null });
  },

  refreshCountryOptions: () => {
    resetCountryTracking();
  },

  createGame: async (playerCountry: string, selectedCrop: string) => {
    if (!playerCountry || !selectedCrop) {
      throw new Error('Country and crop selection required');
    }

    try {
      set({ loading: true, error: null });

      const { COUNTRY_OPTIONS } = getGameOptions();
      const availableCountries = COUNTRY_OPTIONS
        .filter(c => c.name !== playerCountry)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (availableCountries.length < 3) {
        throw new Error('Not enough countries available for AI players');
      }

      const aiPlayers = availableCountries.map((country, index) => {
        const randomCrop = country.crops[Math.floor(Math.random() * country.crops.length)];
        return {
          id: crypto.randomUUID(),
          name: `Player ${index + 2}`,
          money: 1000,
          isAI: true,
          country: country.name,
          selectedCrop: randomCrop.name,
          riskProfile: ['conservative', 'balanced', 'aggressive'][index % 3],
          playerNumber: index + 2,
          isBankrupt: false,
          lastInvestmentPercentage: null
        };
      });

      const newGameState: GameState = {
        players: [
          {
            id: crypto.randomUUID(),
            name: 'Player 1',
            money: 1000,
            isAI: false,
            country: playerCountry,
            selectedCrop,
            playerNumber: 1,
            isBankrupt: false,
            lastInvestmentPercentage: null
          },
          ...aiPlayers
        ],
        currentSeason: 1,
        currentPlayerIndex: 0,
        gameOver: false,
        winner: null,
        lastRoll: [],
        lastInvestmentPercentage: 0,
        gameStarted: true,
        rollHistory: [],
        playerCount: 4
      };

      localStorage.setItem('gameState', JSON.stringify(newGameState));

      set({ 
        gameState: newGameState,
        loading: false,
        error: null
      });

      toast.success('Game started! Make your first investment.');

    } catch (error) {
      console.error('Create game error:', error);
      set({ 
        error: error.message || 'Failed to create game', 
        loading: false,
        gameState: null
      });
      throw error;
    }
  },

  makeInvestment: async (percentage: number) => {
    const { gameState } = get();
    if (!gameState) {
      throw new Error('No active game');
    }

    try {
      set({ loading: true, error: null });

      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      
      if (currentPlayer.isBankrupt) {
        throw new Error('Player is bankrupt');
      }

      if (currentPlayer.money <= 0) {
        throw new Error('No money available for investment');
      }

      const isLastPlayer = gameState.currentPlayerIndex === gameState.players.length - 1;
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[gameState.currentPlayerIndex] = {
        ...currentPlayer,
        lastInvestmentPercentage: percentage
      };

      if (isLastPlayer) {
        const seasonRoll = rollDice();
        const rollOutcome = getRollOutcome(seasonRoll);

        updatedPlayers.forEach((player, index) => {
          if (!player.isBankrupt) {
            const playerResult = calculateSeasonResult(
              player.money,
              player.lastInvestmentPercentage || 0,
              seasonRoll
            );

            updatedPlayers[index] = {
              ...player,
              money: playerResult.moneyAfter,
              isBankrupt: playerResult.moneyAfter === 0
            };
          }
        });

        const activePlayers = updatedPlayers.filter(p => !p.isBankrupt);
        const nextSeason = gameState.currentSeason + 1;
        
        let gameOver = false;
        let winner = null;

        // First check if only one player remains
        if (activePlayers.length === 1) {
          gameOver = true;
          winner = activePlayers[0];
        }
        // Then check if we've reached season 10
        else if (nextSeason > MAX_SEASONS) {
          gameOver = true;
          winner = activePlayers.reduce((prev, current) => 
            (current.money > prev.money) ? current : prev
          );
        }
        // Finally check for early victory (>= $7000)
        else {
          const playersOver7000 = activePlayers.filter(p => p.money >= 7000);
          if (playersOver7000.length > 0) {
            gameOver = true;
            // If multiple players are over 7000, highest money wins
            winner = playersOver7000.reduce((prev, current) => 
              (current.money > prev.money) ? current : prev
            );
          }
        }

        const updatedState = {
          ...gameState,
          players: updatedPlayers,
          currentPlayerIndex: 0,
          currentSeason: nextSeason > MAX_SEASONS ? MAX_SEASONS : nextSeason,
          lastRoll: seasonRoll,
          gameOver,
          winner,
          rollHistory: [
            ...gameState.rollHistory,
            {
              season: gameState.currentSeason,
              roll: seasonRoll,
              outcome: rollOutcome
            }
          ]
        };

        localStorage.setItem('gameState', JSON.stringify(updatedState));

        // Set the state immediately to show the dice roll
        set({ 
          gameState: updatedState,
          loading: false 
        });

        // If game is over, show the winner message after a delay
        if (gameOver && winner) {
          setTimeout(() => {
            let message;
            if (winner.playerNumber === 1) {
              message = "🎉 Congratulations! You've won!";
            } else {
              const player1 = updatedPlayers[0];
              const difference = winner.money - player1.money;
              if (difference < 100) {
                message = `Game Over! ${winner.name} wins by just $${difference.toLocaleString()}!`;
              } else if (difference <= 300) {
                message = `Game Over! ${winner.name} wins by $${difference.toLocaleString()}!`;
              } else {
                message = `Game Over! ${winner.name} wins with $${winner.money.toLocaleString()}!`;
              }
            }
            toast.success(message);
          }, 2000);
        }

      } else {
        let nextPlayerIndex = gameState.currentPlayerIndex + 1;
        while (nextPlayerIndex < updatedPlayers.length && updatedPlayers[nextPlayerIndex].isBankrupt) {
          nextPlayerIndex++;
        }

        const updatedState = {
          ...gameState,
          players: updatedPlayers,
          currentPlayerIndex: nextPlayerIndex
        };

        localStorage.setItem('gameState', JSON.stringify(updatedState));

        set({ 
          gameState: updatedState,
          loading: false 
        });
      }

      const nextPlayerIndex = isLastPlayer ? 0 : gameState.currentPlayerIndex + 1;
      const nextPlayer = updatedPlayers[nextPlayerIndex];
      
      if (nextPlayer?.isAI && !nextPlayer.isBankrupt && !gameState.gameOver) {
        setTimeout(() => {
          get().processAITurns();
        }, 1500);
      }

    } catch (error) {
      console.error('Investment error:', error);
      set({ error: error.message || 'Failed to make investment', loading: false });
      throw error;
    }
  },

  processAITurns: async () => {
    const { gameState } = get();
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer?.isAI || currentPlayer.isBankrupt) return;

    try {
      const aiDecision = getAIDecision(currentPlayer.riskProfile);
      await get().makeInvestment(aiDecision);
    } catch (error) {
      console.error('AI turn error:', error);
      set({ error: error.message || 'Failed to process AI turn', loading: false });
      throw error;
    }
  },

  resetGame: () => {
    localStorage.removeItem('gameState');
    localStorage.removeItem('selectedCountry');
    localStorage.removeItem('selectedCrops');
    
    set({
      gameState: null,
      loading: false,
      error: null,
    });
  },
}));

function transformGameState(game: any): GameState {
  return {
    players: game.players.map((p: any) => ({
      id: p.id,
      name: `Player ${p.playerNumber}`,
      money: p.money,
      isAI: p.isAI,
      country: p.country,
      selectedCrop: p.selectedCrop,
      riskProfile: p.riskProfile,
      lastInvestmentPercentage: p.lastInvestmentPercentage,
      isBankrupt: p.isBankrupt,
      playerNumber: p.playerNumber
    })),
    currentSeason: game.currentSeason,
    currentPlayerIndex: game.currentPlayerIndex,
    gameOver: game.gameOver,
    winner: game.winner,
    lastRoll: game.lastRoll || [],
    lastInvestmentPercentage: game.lastInvestmentPercentage,
    gameStarted: game.gameStarted,
    rollHistory: game.rollHistory || [],
    playerCount: game.players.length,
  };
}