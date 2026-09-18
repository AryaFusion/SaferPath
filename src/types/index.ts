export type PageRoute =
  | 'plan'
  | 'help'
  | 'report'
  | 'trip'
  | 'contacts'
  | 'privacy'
  | 'settings'
  | 'emergency'
  | 'route-detail';

export type ConfidenceLevel = 'High' | 'Moderate' | 'Low';
export type LightingRating = 'Well covered' | 'Mixed' | 'Poor' | 'Not enough data';
export type FootfallRating = 'Busy' | 'Mixed' | 'Sparse' | 'Quiet';

export interface RouteSegment {
  id: string;
  title: string;
  distanceKm: number;
  durationMin: number;
  lightingRating: LightingRating;
  footfallRating: FootfallRating;
  reportsCount: number;
  newestObsTime: string;
  description: string;
  highlights: string[];
}

export interface RouteOption {
  id: string;
  name: string;
  via: string;
  durationMin: number;
  distanceKm: number;
  lighting: LightingRating;
  footfall: FootfallRating;
  helpPointsCount: number;
  flaggedAreasCount: number;
  confidence: ConfidenceLevel;
  freshness: string; // e.g. "Updated within the hour", "Updated just now", "Older than 7 days"
  isOlderData?: boolean;
  badges: string[]; // e.g. ["Fastest"], ["Safest", "Suggested for this time"], ["Balanced"]
  whyText: string;
  segments: RouteSegment[];
}

export interface HelpPoint {
  id: string;
  name: string;
  type: string; // e.g. "Pharmacy", "Transit desk", "Police post", "Clinic"
  distanceMeters: number;
  status: 'Open now' | 'Closed now' | '24/7 Monitored';
  verifiedBy: string;
  verifiedTime: string;
  address: string;
  phone?: string;
}

export interface StreetReport {
  id: string;
  category: 'lighting' | 'pavement' | 'sightlines' | 'shop' | 'other';
  categoryLabel: string;
  location: string;
  description: string;
  isAnonymous: boolean;
  createdAt: string;
  timeAgo: string;
}

export interface TripLogEntry {
  id: string;
  timestamp: string;
  type: 'start' | 'checkin' | 'reroute' | 'arrived' | 'sos';
  message: string;
}

export interface ActiveTripState {
  active: boolean;
  routeId: string | null;
  routeName: string;
  startedAt: string | null;
  etaMinutes: number;
  distanceRemainingKm: number;
  checkInStatus: string;
  logs: TripLogEntry[];
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  sharesCheckIns: boolean;
  sharesETA: boolean;
}

export interface UserSettingsPermissions {
  locationAccess: boolean;
  activeTripTracking: boolean;
  contactSharing: boolean;
  publicReporting: boolean;
  autoPurgeHistory: boolean;
}
