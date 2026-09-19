import type { Feature, LineString } from 'geojson';

export type Coordinates = [number, number]; // [longitude, latitude]

import type { TimeOfDay } from '../../lib/types';

export interface RouteRequestOptions {
  origin: Coordinates;
  destination: Coordinates;
  originName?: string;
  destinationName?: string;
  timeOfDay?: TimeOfDay;
}

export interface NormalizedRoute {
  id: string;
  name: string;
  via: string;
  durationSeconds: number;
  durationMinutes: number;
  distanceMeters: number;
  distanceKm: number;
  geometry: Feature<LineString>;
  isSelected: boolean;
  source: 'valhalla' | 'fixture';
  whySummary: string;
  supportLevel: 'Stronger Contextual Support' | 'Mixed Context' | 'Caution Segment' | 'Limited Data' | 'Stale Evidence';
  lightingEvidence?: string;
  footfallEvidence?: string;
  helpPointsCount?: number;
  freshness?: string;
  confidence?: 'High' | 'Moderate' | 'Limited';
}

export interface RoutingResult {
  routes: NormalizedRoute[];
  source: 'valhalla' | 'fixture';
  isFallback: boolean;
  routesAvailableCount: number;
  message?: string;
}

export interface RoutingProvider {
  getWalkingRoutes(options: RouteRequestOptions): Promise<RoutingResult>;
}
