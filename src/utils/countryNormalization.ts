import { CountryOption } from '../types';

// Map of country aliases to their standard display names
export const countryAliasMap: { [key: string]: string } = {
  "Cabo Verde": "Cape Verde",
  "Côte d'Ivoire": "Ivory Coast",
  "Congo (Kinshasa)": "Democratic Republic of the Congo",
  "Congo (Brazzaville)": "Republic of the Congo",
  "São Tomé and Príncipe": "Sao Tome and Principe",
  "Côte dâIvoire": "Ivory Coast",
  "CÃ´te dâIvoire": "Ivory Coast",
  "Congo": "Republic of the Congo",
  "DR Congo": "Democratic Republic of the Congo"
};

// Map of standard names to their flag codes
export const countryFlagMap: { [key: string]: string } = {
  "Republic of the Congo": "cg",
  "Democratic Republic of the Congo": "cd",
  "Ivory Coast": "ci",
  "Cape Verde": "cv",
  "Sao Tome and Principe": "st"
};

// Map of special case flag URLs
export const specialFlagUrls: { [key: string]: string } = {
  "Republic of the Congo": "https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/cg.png",
  "Democratic Republic of the Congo": "https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/cd.png",
  "Ivory Coast": "https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/ci.png",
  "Sao Tome and Principe": "https://szcngfdwlktwaefirtux.supabase.co/storage/v1/object/public/public-assets/flags/st.png"
};

// Normalize a country name to its standard form
export function normalizeCountryName(name: string): string {
  if (!name) return '';
  const trimmedName = name.trim();
  return countryAliasMap[trimmedName] || trimmedName;
}

// Get the flag code for a country
export function getCountryFlagCode(name: string): string {
  const normalizedName = normalizeCountryName(name);
  return countryFlagMap[normalizedName] || normalizedName.toLowerCase().substring(0, 2);
}

// Get the flag URL for a country
export function getCountryFlagUrl(name: string): string {
  const normalizedName = normalizeCountryName(name);
  
  // Check for special case URLs first
  if (specialFlagUrls[normalizedName]) {
    return specialFlagUrls[normalizedName];
  }
  
  const code = getCountryFlagCode(normalizedName);
  return code ? `https://flagcdn.com/w160/${code}.png` : '';
}

// Normalize country data
export function normalizeCountryData(data: any[]): CountryOption[] {
  return data.map(country => ({
    ...country,
    name: normalizeCountryName(country.name || ''),
    crops: Array.isArray(country.crops) ? country.crops.map((crop: any) => ({
      ...crop,
      name: (crop.name || '').trim(),
      fact: (crop.fact || "We're still gathering data on this crop—stay tuned!").trim()
    })) : []
  }));
}

// Validate country name
export function isValidCountryName(name: string): boolean {
  const normalized = normalizeCountryName(name);
  return normalized.length > 0 && normalized !== 'Country';
}