
import { FilterState } from './types';

export const AIRLINE_NAMES: Record<string, string> = {
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'LH': 'Lufthansa',
  'AF': 'Air France',
  'BA': 'British Airways',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'SQ': 'Singapore Airlines',
  'IB': 'Iberia',
  'VY': 'Vueling',
  'FR': 'Ryanair',
  'EZY': 'EasyJet',
  'TK': 'Turkish Airlines',
  'B6': 'JetBlue',
  'WN': 'Southwest Airlines',
  'AC': 'Air Canada',
  'LX': 'Swiss International',
};

export const INITIAL_FILTERS: FilterState = {
  stops: [],
  airlines: [],
  maxPrice: 2000,
  durationRange: undefined,
};

export const STORAGE_KEY = 'skybound_last_search';
