import type { AddLayerObject } from 'maplibre-gl';

export const ROUTE_HALO_LAYER: AddLayerObject = {
  id: 'saferpath-selected-route-halo',
  type: 'line',
  source: 'saferpath-routes-source',
  filter: ['==', ['get', 'isSelected'], true],
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': '#FFFFFF',
    'line-width': 10,
    'line-opacity': 0.85,
  },
};

export const ALTERNATIVE_ROUTE_LAYER: AddLayerObject = {
  id: 'saferpath-alt-routes',
  type: 'line',
  source: 'saferpath-routes-source',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': [
      'case',
      ['boolean', ['get', 'isSelected'], false],
      '#0D9488',
      '#64748B',
    ],
    'line-width': [
      'case',
      ['boolean', ['get', 'isSelected'], false],
      7,
      4,
    ],
    'line-opacity': [
      'case',
      ['boolean', ['get', 'isSelected'], false],
      1.0,
      0.55,
    ],
  },
};

export const ROUTE_HOVER_TOUCH_LAYER: AddLayerObject = {
  id: 'saferpath-routes-touch-target',
  type: 'line',
  source: 'saferpath-routes-source',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': 'transparent',
    'line-width': 22,
  },
};

export const HELP_POINTS_CIRCLE_LAYER: AddLayerObject = {
  id: 'saferpath-help-points-layer',
  type: 'circle',
  source: 'saferpath-help-points-source',
  paint: {
    'circle-color': [
      'match',
      ['get', 'category'],
      'Pharmacy', '#E11D48',
      'Police', '#0D9488',
      'Transit Desk', '#4F46E5',
      '#D97706',
    ],
    'circle-radius': 8,
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#FFFFFF',
  },
};

