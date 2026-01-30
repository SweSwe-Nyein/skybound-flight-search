
export interface FlightOffer {
  id: string;
  itineraries: Itinerary[];
  price: {
    total: string;
    currency: string;
  };
  validatingAirlineCodes: string[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  carrierCode: string;
  numberOfStops: number;
}

export interface FlightLeg {
  airlineCode: string;
  airlineName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  origin: string;
  destination: string;
}

export interface NormalizedFlight {
  id: string;
  price: number;
  currency: string;
  outbound: FlightLeg;
  returnLeg?: FlightLeg;
}

export interface SearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  isRoundTrip: boolean;
}

export interface LocationSuggestion {
  name: string;
  iataCode: string;
  detailedName: string;
  subType: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

export interface FilterState {
  stops: number[];
  airlines: string[];
  maxPrice: number;
  durationRange?: {
    min: number; // in minutes
    max: number; // in minutes
  };
}

export enum SortOption {
  PRICE_ASC = 'Price (Lowest)',
  DURATION_ASC = 'Duration (Shortest)',
  DEPARTURE_ASC = 'Departure (Earliest)',
}
