declare global {
  interface ImportMeta {
    readonly env: {
      VITE_AMADEUS_API_KEY: string;
      VITE_AMADEUS_API_SECRET: string;
      [key: string]: string;
    };
  }
}

import { FlightOffer, SearchCriteria, FilterState, LocationSuggestion } from '../types';

const API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
const API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
const BASE_URL = 'https://test.api.amadeus.com';

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: API_KEY,
      client_secret: API_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
};

export const searchLocations = async (keyword: string): Promise<LocationSuggestion[]> => {
  if (!keyword || keyword.length < 2) return [];

  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${BASE_URL}/v1/reference-data/locations?subType=CITY,AIRPORT&keyword=${keyword}&view=LIGHT`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return [];
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Location Search Error:', error);
    return [];
  }
};

export const fetchFlightOffers = async (
  criteria: SearchCriteria, 
  filters?: FilterState,
  limit: number = 20
): Promise<FlightOffer[]> => {
  const iataRegex = /^[A-Z]{3}$/;
  if (!iataRegex.test(criteria.origin) || !iataRegex.test(criteria.destination)) {
    throw new Error('Please select valid locations from the suggestions.');
  }

  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams({
      originLocationCode: criteria.origin,
      destinationLocationCode: criteria.destination,
      departureDate: criteria.departureDate,
      adults: criteria.passengers.toString(),
      currencyCode: 'USD',
      max: limit.toString(),
    });

    if (criteria.returnDate) {
      queryParams.append('returnDate', criteria.returnDate);
    }

    if (filters) {
      if (filters.stops.length === 1 && filters.stops.includes(0)) {
        queryParams.append('nonStop', 'true');
      }
      if (filters.airlines.length > 0) {
        queryParams.append('includedAirlineCodes', filters.airlines.join(','));
      }
    }

    const response = await fetch(`${BASE_URL}/v2/shopping/flight-offers?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      const detail = errorData.errors?.[0]?.detail || 'Failed to fetch flight offers';
      throw new Error(detail);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error('Fetch Flight Offers Error:', error);
    throw error;
  }
};
