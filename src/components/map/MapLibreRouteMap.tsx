import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { Feature, LineString, FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapLibreRouteMapProps } from './types';
import { DEFAULT_MAP_STYLE_URL, FALLBACK_RASTER_MAP_STYLE } from './mapStyles';
import { ALTERNATIVE_ROUTE_LAYER, ROUTE_HALO_LAYER, ROUTE_HOVER_TOUCH_LAYER } from './routeLayers';
import { calculateMapBounds } from './mapUtils';

export const MapLibreRouteMap: React.FC<MapLibreRouteMapProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  origin,
  destination,
  originName = 'Shivaji Park',
  destinationName = 'Dadar Station',
  helpPoints = [],
  isFallback = false,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const originMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destinationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const helpPointMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const originRef = useRef(origin);
  useEffect(() => {
    originRef.current = origin;
  }, [origin]);

  // Initialize MapLibre instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let mapInstance: maplibregl.Map | null = null;

    try {
      mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style: DEFAULT_MAP_STYLE_URL,
        center: originRef.current,
        zoom: 14,
        attributionControl: { compact: true },
      });

      mapInstance.on('error', (e: maplibregl.ErrorEvent) => {
        console.warn('MapLibre style load error, falling back to OSM raster style:', e);
        if (mapInstance && !mapInstance.isStyleLoaded()) {
          try {
            mapInstance.setStyle(FALLBACK_RASTER_MAP_STYLE);
          } catch {
            setMapError('Unable to load map tiles.');
          }
        }
      });

      mapInstance.on('load', () => {
        setIsLoaded(true);
        mapInstance?.resize();
      });

      mapRef.current = mapInstance;
    } catch (err) {
      console.error('Failed to initialize MapLibre instance:', err);
      setMapError('Map visualization unavailable');
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update GeoJSON Sources, Markers & Fitting Bounds whenever routes, selectedRouteId, or origin/destination changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;

    map.resize();

    // 1. Update Origin & Destination HTML Markers
    if (originMarkerRef.current) originMarkerRef.current.remove();
    if (destinationMarkerRef.current) destinationMarkerRef.current.remove();

    // Start Marker: Clean small green dot + small floating label
    const originEl = document.createElement('div');
    originEl.className =
      'flex items-center gap-1.5 bg-slate-900 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border border-slate-700 pointer-events-auto';
    originEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span><span>${originName.split(',')[0]}</span>`;

    originMarkerRef.current = new maplibregl.Marker({ element: originEl, anchor: 'bottom' })
      .setLngLat(origin)
      .addTo(map);

    // Destination Marker: Clean small red dot + small floating label
    const destEl = document.createElement('div');
    destEl.className =
      'flex items-center gap-1.5 bg-slate-900 text-white px-2 py-0.5 rounded-full text-[11px] font-semibold shadow-sm border border-slate-700 pointer-events-auto';
    destEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span><span>${destinationName.split(',')[0]}</span>`;

    destinationMarkerRef.current = new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
      .setLngLat(destination)
      .addTo(map);

    // 2. Prepare GeoJSON Feature Collection for Routes
    const routeFeatures: Feature<LineString>[] = routes.map((rt) => ({
      type: 'Feature',
      properties: {
        id: rt.id,
        name: rt.name,
        via: rt.via,
        isSelected: rt.id === selectedRouteId,
      },
      geometry: rt.geometry.geometry,
    }));

    const routeGeoJson: FeatureCollection<LineString> = {
      type: 'FeatureCollection',
      features: routeFeatures,
    };

    if (map.getSource('saferpath-routes-source')) {
      (map.getSource('saferpath-routes-source') as maplibregl.GeoJSONSource).setData(routeGeoJson);
    } else {
      map.addSource('saferpath-routes-source', {
        type: 'geojson',
        data: routeGeoJson,
      });

      map.addLayer(ROUTE_HALO_LAYER);
      map.addLayer(ALTERNATIVE_ROUTE_LAYER);
      map.addLayer(ROUTE_HOVER_TOUCH_LAYER);

      // Handle Route Line Click Selection
      map.on('click', 'saferpath-routes-touch-target', (e: maplibregl.MapLayerMouseEvent) => {
        if (e.features && e.features[0] && e.features[0].properties) {
          const clickedRouteId = e.features[0].properties.id;
          if (clickedRouteId) {
            onSelectRoute(clickedRouteId);
          }
        }
      });

      // Pointer Cursor on Route Line Hover
      map.on('mouseenter', 'saferpath-routes-touch-target', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'saferpath-routes-touch-target', () => {
        map.getCanvas().style.cursor = '';
      });
    }

    // 3. Prepare Help Points Markers
    helpPointMarkersRef.current.forEach((m) => m.remove());
    helpPointMarkersRef.current = [];

    helpPoints.forEach((hp) => {
      const markerCoords: [number, number] = [
        origin[0] + (Math.random() - 0.5) * 0.008,
        origin[1] + (Math.random() - 0.5) * 0.008,
      ];

      const popupHtml = `
        <div class="p-2 text-slate-900 max-w-[190px]">
          <div class="font-bold text-xs">${hp.name}</div>
          <div class="text-[11px] text-teal-700 font-semibold mt-0.5">${hp.category} • ${hp.status}</div>
          <div class="text-[10px] text-slate-500 mt-1">${hp.address}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${hp.verifiedTime}</div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 10 }).setHTML(popupHtml);

      const markerEl = document.createElement('div');
      markerEl.className =
        'w-5 h-5 rounded-full bg-white border border-teal-600 flex items-center justify-center text-[10px] shadow-sm cursor-pointer hover:scale-110 transition-transform';
      markerEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-teal-600"></span>`;

      const marker = new maplibregl.Marker({ element: markerEl })
        .setLngLat(markerCoords)
        .setPopup(popup)
        .addTo(map);

      helpPointMarkersRef.current.push(marker);
    });

    // 4. Fit map to calculated bounds
    if (routes.length > 0) {
      const [minLng, minLat, maxLng, maxLat] = calculateMapBounds(routes, origin, destination);
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: { top: 40, bottom: 40, left: 40, right: 40 }, maxZoom: 16, duration: 600 }
      );
    }
  }, [routes, selectedRouteId, origin, destination, isLoaded, onSelectRoute, originName, destinationName, helpPoints]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetBounds = () => {
    if (routes.length > 0 && mapRef.current) {
      const [minLng, minLat, maxLng, maxLat] = calculateMapBounds(routes, origin, destination);
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 40, duration: 500 }
      );
    }
  };

  return (
    <div
      className={`relative w-full h-[480px] sm:h-[520px] lg:h-[560px] rounded-2xl overflow-hidden border border-stone-200/90 bg-[#f7f5f0] shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Compact Map Controls (+, -, Focus) */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="w-7 h-7 bg-white/95 text-slate-800 font-bold rounded-md border border-stone-200 shadow-xs flex items-center justify-center cursor-pointer hover:bg-white text-sm"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="w-7 h-7 bg-white/95 text-slate-800 font-bold rounded-md border border-stone-200 shadow-xs flex items-center justify-center cursor-pointer hover:bg-white text-sm"
        >
          −
        </button>
        <button
          onClick={handleResetBounds}
          aria-label="Reset map view"
          title="Reset map view"
          className="w-7 h-7 bg-white/95 text-slate-800 font-bold rounded-md border border-stone-200 shadow-xs flex items-center justify-center cursor-pointer hover:bg-white text-xs"
        >
          🧭
        </button>
      </div>

      {/* Fallback Banner Badge */}
      {isFallback && (
        <div className="absolute left-3 top-3 z-20 bg-amber-500/90 text-slate-950 font-semibold px-2.5 py-0.5 rounded-md text-[10px] shadow-xs flex items-center gap-1">
          <span>⚠️</span>
          <span>Using demo route data</span>
        </div>
      )}

      {/* Map Error Overlay */}
      {mapError && (
        <div className="absolute inset-0 z-30 bg-stone-100/90 flex items-center justify-center p-4 text-center">
          <div className="bg-white p-4 rounded-xl shadow-md border border-stone-200 max-w-xs">
            <h4 className="text-xs font-bold text-slate-900 mt-1">Map Notice</h4>
            <p className="text-[11px] text-slate-600 mt-1">{mapError}</p>
          </div>
        </div>
      )}

      {/* Minimal Legend Bar Overlay (Bottom Left) */}
      <div className="absolute left-3 bottom-3 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-stone-200 shadow-xs text-[10px] font-medium text-slate-700">
        <div className="flex items-center gap-1">
          <span className="w-3 h-1 bg-[#0F8F83] rounded-full" />
          <span>Selected</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-3 h-1 bg-slate-400 rounded-full" />
          <span>Alternative</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>Help</span>
        </div>
      </div>
    </div>
  );
};

export default MapLibreRouteMap;

