import type { StyleSpecification } from 'maplibre-gl';

/**
 * OpenFreeMap Liberty Vector Style for MapLibre GL JS.
 * 100% free, open-source, high-performance vector basemap with ZERO API key required and ZERO watermarks.
 */
export const DEFAULT_MAP_STYLE_URL =
  import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

/**
 * Backup OpenFreeMap Bright Style.
 */
export const OPENFREEMAP_BRIGHT_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';

/**
 * Fallback open raster style in case vector tiles server is unavailable.
 */
export const FALLBACK_RASTER_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};



