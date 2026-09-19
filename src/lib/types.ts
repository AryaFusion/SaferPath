export type TimeOfDay = '18:00' | '21:00' | '23:30';

export type ContextConfidence = 'High' | 'Moderate' | 'Limited';

export type SupportLevel =
  | 'Stronger Contextual Support'
  | 'Mixed Context'
  | 'Caution Segment'
  | 'Limited Data'
  | 'Stale Evidence';

export interface RouteSegment {
  id: string;
  name: string;
  distanceKm: number;
  durationMinutes: number;
  lightingStatus: 'Well lit corridor' | 'Mixed streetlamps' | 'Sparse lighting' | 'Unknown';
  footfallStatus: 'Active pedestrian traffic' | 'Moderate activity' | 'Quiet / Low footfall' | 'Unknown';
  evidenceObservedCount: number;
  newestObservationTime: string;
  notes: string[];
}

export interface RouteOption {
  id: string;
  name: string;
  via: string;
  durationMinutes: number;
  distanceKm: number;
  supportLevel: SupportLevel;
  confidence: ContextConfidence;
  freshness: string; // e.g. "Observed within 45 mins", "Updated yesterday"
  isStale?: boolean;
  lightingEvidence: string;
  footfallEvidence: string;
  helpPointsCount: number;
  cautionPointsCount: number;
  whySummary: string;
  segments: RouteSegment[];
}

export interface HelpPoint {
  id: string;
  name: string;
  category: 'Pharmacy' | 'Transit Desk' | 'Police Desk' | 'Clinic' | 'Commercial Haven';
  distanceMeters: number;
  status: 'Open & Lit' | '24/7 Staffed' | 'Closed currently';
  verificationAuthority: string;
  verifiedTime: string;
  address: string;
  phone?: string;
}

export interface PhysicalReport {
  id: string;
  category: 'Streetlamp Issue' | 'Pavement Obstacle' | 'Overgrown Sightlines' | 'Open Commercial Front' | 'Other Physical Feature';
  locationDescription: string;
  physicalDetails: string;
  submittedAt: string;
  isAnonymous: boolean;
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  sharesCheckIns: boolean;
  sharesETA: boolean;
}

export interface TripLogEntry {
  id: string;
  timestamp: string;
  event: 'walk_commenced' | 'checkin_ok' | 'route_adjustment' | 'destination_reached' | 'trip_cancelled';
  message: string;
}

export interface ActiveTrip {
  id: string;
  routeId: string;
  routeName: string;
  startedAt: string;
  durationMinutes: number;
  remainingDistanceKm: number;
  status: 'In progress' | 'Completed' | 'Cancelled';
  checkInLogs: TripLogEntry[];
}

export interface PrivacySettings {
  storeSearchHistoryLocally: boolean;
  shareLocationWithContacts: boolean;
  autoPurgeHours: number; // e.g. 24
  anonymousReportingOnly: boolean;
}

export type ApplicationTab =
  | '/route'
  | '/evidence'
  | '/help'
  | '/reports'
  | '/trip'
  | '/saved-places'
  | '/settings'
  | '/privacy'
  | '/emergency'
  | 'planner'
  | 'route-evidence'
  | 'help-points'
  | 'report-context'
  | 'active-trip'
  | 'contacts'
  | 'privacy'
  | 'settings'
  | 'emergency';

