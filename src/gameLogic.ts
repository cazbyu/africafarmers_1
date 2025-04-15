import { Player, GameState, CountryOption, SeasonResult, SeasonRoll } from './types';

export const INITIAL_MONEY = 1000;
export const WINNING_AMOUNT = 7000;
export const MAX_SEASONS = 10;

let countryData: CountryOption[] = [];

const JSON_URL = 'https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/game-assets/thryve_crops_data_2025.04.14.json';

export async function fetchCountryCropData(): Promise<CountryOption[]> {
  try {
    const response = await fetch(JSON_URL);
    if (!response.ok) throw new Error('Failed to fetch JSON data');
    
    const data = await response.json();
    console.log('Loaded JSON data:', data);

    // Transform into CountryOption format
    countryData = data
      .filter((country: any) => country.name && country.crops && Object.keys(country.crops).length > 0)
      .map((country: any) => ({
        name: country.name,
        crops: country.crops
      }))
      .sort((a: CountryOption, b: CountryOption) => a.name.localeCompare(b.name));

    console.log('Transformed country data:', countryData);
    return countryData;
  } catch (error) {
    console.error('Error loading country data:', error);
    throw error;
  }
}

export function getGameOptions() {
  return {
    COUNTRY_OPTIONS: countryData
  };
}

export function rollDice(): number[] {
  return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
}

export function calculateSeasonResult(money: number, investmentPercentage: number, seasonRoll: number[]): SeasonResult {
  const validPercentage = Math.max(0, Math.min(100, investmentPercentage));
  const investmentAmount = Math.floor((money * validPercentage) / 100);
  const remainingAmount = money - investmentAmount;
  
  const sum = seasonRoll[0] + seasonRoll[1];
  const isDouble = seasonRoll[0] === seasonRoll[1];
  const isDestroyed = sum === 7;
  
  let finalAmount;
  let percentageGain;
  
  if (isDestroyed) {
    finalAmount = remainingAmount;
    percentageGain = -100;
  } else if (isDouble) {
    finalAmount = remainingAmount + (investmentAmount * 2);
    percentageGain = 100;
  } else {
    const profit = Math.floor(investmentAmount * (sum * 3 / 100));
    finalAmount = remainingAmount + investmentAmount + profit;
    percentageGain = sum * 3;
  }
  
  return {
    roll: seasonRoll,
    isDouble,
    isDestroyed,
    percentageGain,
    moneyBefore: money,
    moneyAfter: Math.max(0, finalAmount),
    investmentAmount,
    remainingAmount
  };
}

export function getAIDecision(riskProfile: string = 'balanced'): number {
  switch (riskProfile) {
    case 'conservative':
      return Math.floor(Math.random() * 21) + 40;
    case 'aggressive':
      return Math.floor(Math.random() * 21) + 70;
    default:
      return Math.floor(Math.random() * 21) + 50;
  }
}

export function checkWinCondition(players: Player[]): Player | null {
  const activePlayers = players.filter(p => !p.isBankrupt);
  
  if (activePlayers.length === 1) {
    return activePlayers[0];
  }
  
  const winner = activePlayers.find(p => p.money >= WINNING_AMOUNT);
  if (winner) return winner;
  
  return null;
}

export function getRollOutcome(roll: number[]): string {
  const sum = roll[0] + roll[1];
  const isDouble = roll[0] === roll[1];
  
  if (sum === 7) return 'Crops destroyed! All invested money lost';
  if (isDouble) return 'Double! Investment doubled';
  return `Investment increased by ${sum * 3}%`;
}

export function getCountryInfo(countryName: string): { name: string, url: string } {
  return {
    name: countryName,
    url: `https://www.britannica.com/place/${countryName.replace(/\s+/g, '-')}`
  };
}

export function getCountryFlag(countryName: string): string {
  const countryMap: { [key: string]: string } = {
    'Algeria': 'dz', 'Angola': 'ao', 'Benin': 'bj', 'Botswana': 'bw',
    'Burkina Faso': 'bf', 'Burundi': 'bi', 'Cameroon': 'cm',
    'Cape Verde': 'cv', 'Central African Republic': 'cf', 'Chad': 'td',
    'Comoros': 'km', 'Congo (Brazzaville)': 'cg', "Cote d'Ivoire": 'ci',
    'Democratic Republic of the Congo': 'cd', 'Djibouti': 'dj',
    'Egypt': 'eg', 'Equatorial Guinea': 'gq', 'Eritrea': 'er',
    'Ethiopia': 'et', 'Gabon': 'ga', 'Gambia': 'gm', 'Ghana': 'gh',
    'Guinea': 'gn', 'Guinea-Bissau': 'gw', 'Kenya': 'ke',
    'Lesotho': 'ls', 'Liberia': 'lr', 'Libya': 'ly',
    'Madagascar': 'mg', 'Malawi': 'mw', 'Mali': 'ml',
    'Mauritania': 'mr', 'Mauritius': 'mu', 'Morocco': 'ma',
    'Mozambique': 'mz', 'Namibia': 'na', 'Niger': 'ne',
    'Nigeria': 'ng', 'Rwanda': 'rw', "Sao Tome and Principe": 'st', 'Senegal': 'sn',
    'Seychelles': 'sc', 'Sierra Leone': 'sl', 'Somalia': 'so',
    'South Africa': 'za', 'South Sudan': 'ss', 'Sudan': 'sd',
    'Tanzania': 'tz', 'Togo': 'tg', 'Tunisia': 'tn', 'Uganda': 'ug',
    'Zambia': 'zm', 'Zimbabwe': 'zw'
  };
  
  const code = countryMap[countryName];
  return code ? `https://flagcdn.com/w160/${code}.png` : '';
}

export function resetCountryTracking() {
  // Refresh the country data
  return fetchCountryCropData();
}

// Export for use in other components
export const ALL_COUNTRY_OPTIONS = countryData;