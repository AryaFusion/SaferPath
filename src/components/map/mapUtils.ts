import type { NormalizedRoute } from '../../api/routing/types';

export function calculateMapBounds(
  routes: NormalizedRoute[],
  origin: [number, number],
  destination: [number, number]
): [number, number, number, number] {
  let minLng = Math.min(origin[0], destination[0]);
  let maxLng = Math.max(origin[0], destination[0]);
  let minLat = Math.min(origin[1], destination[1]);
  let maxLat = Math.max(origin[1], destination[1]);

  routes.forEach((route) => {
    if (route.geometry && route.geometry.geometry && Array.isArray(route.geometry.geometry.coordinates)) {
      route.geometry.geometry.coordinates.forEach((coord: number[]) => {
        const lng = coord[0];
        const lat = coord[1];
        if (typeof lng === 'number' && typeof lat === 'number') {
          if (lng < minLng) minLng = lng;
          if (lng > maxLng) maxLng = lng;
          if (lat < minLat) minLat = lat;
          if (lat > maxLat) maxLat = lat;
        }
      });
    }
  });

  // Expand bounds slightly for padding
  const lngMargin = Math.max(0.005, (maxLng - minLng) * 0.15);
  const latMargin = Math.max(0.005, (maxLat - minLat) * 0.15);

  return [minLng - lngMargin, minLat - latMargin, maxLng + lngMargin, maxLat + latMargin];
}
