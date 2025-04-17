export interface Player {
  id: string;
  name: string;
  money: number;
  isAI: boolean;
  country?: string;
  riskProfile?: 'conservative' | 'balanced' | 'aggressive';
  lastInvestmentPercentage?: number;
  isBankrupt?: boolean;
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
}

export interface CountryOption {
  name: string;
  crops: string[];
}

export interface NameOption {
  name: string;
  gender: 'male' | 'female';
}

export interface SeasonRoll {
  season: number;
  roll: number[];
  outcome: string;
}