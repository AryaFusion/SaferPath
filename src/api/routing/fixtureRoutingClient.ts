import type { NormalizedRoute, RouteRequestOptions, RoutingResult } from './types';

/**
 * Fixture GeoJSON coordinates connecting Shivaji Park (72.8373, 19.0269) to Dadar Station (72.8433, 19.0180) in Mumbai.
 */
const SHIVAJI_PARK_TO_DADAR_R1: [number, number][] = [
  [72.8373, 19.0269], // Shivaji Park Entrance
  [72.8385, 19.0255], // Lady Jamshedji Rd Junction
  [72.8402, 19.0232], // Ranade Road Promenade
  [72.8418, 19.0205], // Kabutarkhana Junction
  [72.8433, 19.0180], // Dadar Station West Plaza
];

const SHIVAJI_PARK_TO_DADAR_R2: [number, number][] = [
  [72.8373, 19.0269], // Shivaji Park Entrance
  [72.8360, 19.0250], // Cadell Road / Swatantryaveer Savarkar Marg
  [72.8380, 19.0210], // Kirti College Lane
  [72.8410, 19.0190], // Bhavani Shankar Road
  [72.8433, 19.0180], // Dadar Station West Plaza
];

const SHIVAJI_PARK_TO_DADAR_R3: [number, number][] = [
  [72.8373, 19.0269], // Shivaji Park Entrance
  [72.8395, 19.0275], // Keluskar Road North
  [72.8420, 19.0240], // N.C. Kelkar Road
  [72.8428, 19.0208], // Plaza Cinema Junction
  [72.8433, 19.0180], // Dadar Station West Plaza
];

export function getFixtureWalkingRoutes(options: RouteRequestOptions): RoutingResult {
  const isShivajiParkToDadar =
    Math.abs(options.origin[0] - 72.8373) < 0.02 &&
    Math.abs(options.destination[0] - 72.8433) < 0.02;

  const r1Coords = isShivajiParkToDadar ? SHIVAJI_PARK_TO_DADAR_R1 : SHIVAJI_PARK_TO_DADAR_R1;
  const r2Coords = isShivajiParkToDadar ? SHIVAJI_PARK_TO_DADAR_R2 : SHIVAJI_PARK_TO_DADAR_R2;
  const r3Coords = isShivajiParkToDadar ? SHIVAJI_PARK_TO_DADAR_R3 : SHIVAJI_PARK_TO_DADAR_R3;

  const routes: NormalizedRoute[] = [
    {
      id: 'fixture-route-1',
      name: 'Route 1',
      via: 'via Ranade Road Promenade',
      durationSeconds: 960,
      durationMinutes: 16,
      distanceMeters: 1300,
      distanceKm: 1.3,
      geometry: {
        type: 'Feature',
        properties: { id: 'fixture-route-1', name: 'Route 1', isSelected: true },
        geometry: { type: 'LineString', coordinates: r1Coords },
      },
      isSelected: true,
      source: 'fixture',
      supportLevel: 'Stronger Contextual Support',
      whySummary: 'Active commercial arterial road with high streetlamp density and active shopfronts from Shivaji Park to Dadar Station.',
    },
    {
      id: 'fixture-route-2',
      name: 'Route 2',
      via: 'via Swatantryaveer Savarkar Marg',
      durationSeconds: 1200,
      durationMinutes: 20,
      distanceMeters: 1600,
      distanceKm: 1.6,
      geometry: {
        type: 'Feature',
        properties: { id: 'fixture-route-2', name: 'Route 2', isSelected: false },
        geometry: { type: 'LineString', coordinates: r2Coords },
      },
      isSelected: false,
      source: 'fixture',
      supportLevel: 'Mixed Context',
      whySummary: 'Coastal boulevard corridor via Kirti College lane; mixed lighting past commercial closing hours.',
    },
    {
      id: 'fixture-route-3',
      name: 'Route 3',
      via: 'via N.C. Kelkar Road',
      durationSeconds: 1440,
      durationMinutes: 24,
      distanceMeters: 1900,
      distanceKm: 1.9,
      geometry: {
        type: 'Feature',
        properties: { id: 'fixture-route-3', name: 'Route 3', isSelected: false },
        geometry: { type: 'LineString', coordinates: r3Coords },
      },
      isSelected: false,
      source: 'fixture',
      supportLevel: 'Limited Data',
      whySummary: 'Quieter residential shortcut road past Plaza Cinema junction with sparse pedestrian footfall past 11:00 PM.',
    },
  ];

  return {
    routes,
    source: 'fixture',
    isFallback: true,
    routesAvailableCount: routes.length,
    message: 'Using demo route data',
  };
}
