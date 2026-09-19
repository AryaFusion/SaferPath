import type { NormalizedRoute } from '../../api/routing/types';
import type { HelpPoint } from '../../lib/types';

export interface MapLibreRouteMapProps {
  routes: NormalizedRoute[];
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  origin: [number, number];
  destination: [number, number];
  originName?: string;
  destinationName?: string;
  helpPoints?: HelpPoint[];
  isFallback?: boolean;
  className?: string;
}

export interface MapFeaturePopupInfo {
  title: string;
  category: string;
  distance: string;
  status: string;
  address: string;
  coordinates: [number, number];
}
