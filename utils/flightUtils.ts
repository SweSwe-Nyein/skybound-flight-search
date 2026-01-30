
import { NormalizedFlight, FlightOffer, FilterState, SortOption, FlightLeg } from '../types';
import { AIRLINE_NAMES } from '../constants';

export const parseDuration = (durationStr: string): number => {
  const match = durationStr.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  return hours * 60 + minutes;
};

const createLeg = (itinerary: any, validatingAirlineCode: string): FlightLeg => {
  const segments = itinerary.segments;
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const airlineCode = firstSegment.carrierCode || validatingAirlineCode;

  return {
    airlineCode,
    airlineName: AIRLINE_NAMES[airlineCode] || airlineCode,
    departureTime: firstSegment.departure.at,
    arrivalTime: lastSegment.arrival.at,
    duration: itinerary.duration.replace('PT', '').toLowerCase(),
    durationMinutes: parseDuration(itinerary.duration),
    stops: segments.length - 1,
    origin: firstSegment.departure.iataCode,
    destination: lastSegment.arrival.iataCode,
  };
};

export const normalizeFlightOffers = (offers: FlightOffer[]): NormalizedFlight[] => {
  return offers.map(offer => {
    const validatingAirlineCode = offer.validatingAirlineCodes[0];
    
    const normalized: NormalizedFlight = {
      id: offer.id,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      outbound: createLeg(offer.itineraries[0], validatingAirlineCode),
    };

    if (offer.itineraries.length > 1) {
      normalized.returnLeg = createLeg(offer.itineraries[1], validatingAirlineCode);
    }

    return normalized;
  });
};

export const filterFlights = (flights: NormalizedFlight[], filters: FilterState): NormalizedFlight[] => {
  return flights.filter(f => {
    const outboundStops = f.outbound.stops >= 2 ? 2 : f.outbound.stops;
    const returnStops = f.returnLeg ? (f.returnLeg.stops >= 2 ? 2 : f.returnLeg.stops) : 0;
    
    // Fix: A flight matches if its MAXIMUM stop count matches any selected stop filter.
    // This correctly handles mixed round-trip stop counts.
    const maxStops = f.returnLeg ? Math.max(outboundStops, returnStops) : outboundStops;
    const stopMatch = filters.stops.length === 0 || filters.stops.includes(maxStops);
    
    const airlineMatch = filters.airlines.length === 0 || 
                         filters.airlines.includes(f.outbound.airlineCode) || 
                         (f.returnLeg && filters.airlines.includes(f.returnLeg.airlineCode));
    
    const priceMatch = f.price <= filters.maxPrice;

    // Duration range match
    const durationMatch = !filters.durationRange || 
                          (f.outbound.durationMinutes >= filters.durationRange.min && 
                           f.outbound.durationMinutes < filters.durationRange.max);
    
    return stopMatch && airlineMatch && priceMatch && durationMatch;
  });
};

export const sortFlights = (flights: NormalizedFlight[], sortBy: SortOption): NormalizedFlight[] => {
  const sorted = [...flights];
  switch (sortBy) {
    case SortOption.PRICE_ASC:
      return sorted.sort((a, b) => a.price - b.price);
    case SortOption.DURATION_ASC:
      return sorted.sort((a, b) => a.outbound.durationMinutes - b.outbound.durationMinutes);
    case SortOption.DEPARTURE_ASC:
      return sorted.sort((a, b) => new Date(a.outbound.departureTime).getTime() - new Date(b.outbound.departureTime).getTime());
    default:
      return sorted;
  }
};

export interface ChartBucket {
  name: string;
  minMinutes: number;
  maxMinutes: number;
  avg: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export const getChartData = (flights: NormalizedFlight[]): ChartBucket[] => {
  if (flights.length === 0) return [];

  const durations = flights.map(f => f.outbound.durationMinutes);
  const minDur = Math.min(...durations);
  const maxDur = Math.max(...durations);
  
  // Fix: Ensure buckets are consistently calculated and data is assigned correctly.
  const bucketSize = Math.max(30, Math.ceil((maxDur - minDur) / 6));
  const bucketMap = new Map<number, number[]>();

  for (let i = 0; i < 7; i++) {
    bucketMap.set(minDur + i * bucketSize, []);
  }

  flights.forEach(f => {
    const keys = Array.from(bucketMap.keys());
    // Find highest key <= duration
    const targetKey = keys.reverse().find(k => f.outbound.durationMinutes >= k);
    if (targetKey !== undefined) {
      bucketMap.get(targetKey)?.push(f.price);
    }
  });

  return Array.from(bucketMap.entries())
    .map(([minM, prices]) => {
      if (prices.length === 0) return null;
      const maxM = minM + bucketSize;
      return {
        name: `${Math.floor(minM / 60)}h${minM % 60 > 0 ? (minM % 60) + 'm' : ''}`,
        minMinutes: minM,
        maxMinutes: maxM,
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        count: prices.length
      };
    })
    .filter((b): b is ChartBucket => b !== null);
};
