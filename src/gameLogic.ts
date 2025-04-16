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
  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  
  if (die1 < 1 || die1 > 6 || die2 < 1 || die2 > 6) {
    console.error('Invalid dice values generated:', die1, die2);
    throw new Error('Invalid dice roll');
  }

  const sum = die1 + die2;
  console.log(`Dice roll: ${die1} + ${die2} = ${sum}`);

  if (sum === 7) {
    console.log('🎲 Rolled a 7! This should happen ~16.7% of the time');
    console.log('Possible combinations for 7:', '1+6, 2+5, 3+4, 4+3, 5+2, 6+1');
  }

  return [die1, die2];
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
    console.log(`Disaster! Roll of 7 - Lost investment of $${investmentAmount}`);
  } else if (isDouble) {
    finalAmount = remainingAmount + (investmentAmount * 2);
    percentageGain = 100;
    console.log(`Double! Investment doubled from $${investmentAmount} to $${investmentAmount * 2}`);
  } else {
    const profit = Math.floor(investmentAmount * (sum * 3 / 100));
    finalAmount = remainingAmount + investmentAmount + profit;
    percentageGain = sum * 3;
    console.log(`Normal roll: ${sum} - Profit of $${profit} (${percentageGain}%)`);
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

export function getCropEmoji(cropName: string): string {
  if (!cropName) return "🌱";
  
  const normalizedName = cropName.toLowerCase();
  
  // Check for special categories first
  if (normalizedName.includes('fish')) return "🐟";
  if (normalizedName.includes('livestock')) return "🐐";
  
  const cropEmojiMap: { [key: string]: string } = {
    "maize": "🌽",
    "corn": "🌽",
    "groundnuts": "🥜",
    "peanuts": "🥜",
    "coffee": "☕",
    "sorghum": "🌾",
    "millet": "🌾",
    "rice": "🍚",
    "wheat": "🌾",
    "cotton": "🧺",
    "cassava": "🍠",
    "yam": "🍠",
    "sweet potato": "🍠",
    "potato": "🥔",
    "bananas": "🍌",
    "plantains": "🍌",
    "onion": "🧄",
    "garlic": "🧄",
    "chili": "🌶️",
    "pepper": "🌶️",
    "pineapple": "🍍",
    "orange": "🍊",
    "citrus": "🍊",
    "lemon": "🍋",
    "lime": "🍋",
    "watermelon": "🍉",
    "melon": "🍈",
    "tomato": "🍅",
    "tobacco": "🌿",
    "tea": "🍵",
    "cocoa": "🍫",
    "palm": "🌴",
    "coconut": "🥥",
    "sugar": "🍯",
    "sugarcane": "🎋",
    "vanilla": "🌺",
    "cashew": "🥜",
    "beans": "🫘",
    "vegetables": "🥬",
    "fruits": "🍎"
  };

  // Try to match the normalized name against the map
  for (const [key, emoji] of Object.entries(cropEmojiMap)) {
    if (normalizedName.includes(key)) {
      return emoji;
    }
  }

  // Default to seedling for unknown crops
  return "🌱";
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
  return fetchCountryCropData();
}

export const ALL_COUNTRY_OPTIONS = countryData;