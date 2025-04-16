export interface Player {
  id: string;
  name: string;
  money: number;
  isAI: boolean;
  country?: string;
  selectedCrop?: string;
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  lastInvestmentPercentage?: number;
  isBankrupt?: boolean;
  playerNumber: number;
}

export interface GameState {
  players: Player[];
  currentSeason: number;
  currentPlayerIndex: number;
  gameOver: boolean;
  winner: Player | null;
  lastRoll: number[];
  lastInvestmentPercentage: number;
  gameStarted: boolean;
  rollHistory: SeasonRoll[];
  playerCount: number;
}

export interface SeasonResult {
  roll: number[];
  isDouble: boolean;
  isDestroyed: boolean;
  percentageGain: number;
  moneyBefore: number;
  moneyAfter: number;
  investmentAmount: number;
  remainingAmount: number;
}

export interface CropInfo {
  name: string;
  icon?: string;
  fact?: string;
}

export interface CountryOption {
  name: string;
  crops: { [key: string]: string };
}

export interface SeasonRoll {
  season: number;
  roll: number[];
  outcome: string;
}