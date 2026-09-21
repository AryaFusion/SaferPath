# SaferPath Map & Pedestrian Routing Architecture

This document describes the spatial rendering, pedestrian routing, GeoJSON layer separation, and fallback mechanisms in SaferPath.

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Route Workspace UI                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌──────────────────────────────────┐
│     MapLibre GL JS Renderer     │             │     Valhalla Pedestrian Client   │
│  (MapLibreRouteMap component)   │             │       (routingClient module)     │
└────────────────┬────────────────┘             └────────────────┬─────────────────┘
                 │                                               │
                 ├───────────────────────┬───────────────────────┤
                 ▼                       ▼                       ▼
      ┌─────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
      │  GeoJSON Route Line │ │  GeoJSON Help      │ │  Fallback Fixture  │
      │  Layers (Teal/Slate)│ │  Points (POIs)     │ │  Provider          │
      └─────────────────────┘ └────────────────────┘ └────────────────────┘
```

---

## 1. Map Render Engine (MapLibre GL JS)

- **Component**: MapLibre route rendering in the canonical frontend under `frontend/`.
- **Map Tile Source**: Configured via `VITE_MAP_STYLE_URL` in `.env.example` (defaults to MapLibre vector style, with automatic fallback to OpenStreetMap raster tiles if unavailable).
- **Lifecycle Management**: The `maplibre-gl.Map` instance is initialized once inside a React `useRef` and never recreated unnecessarily during state updates.

---

## 2. Pedestrian Routing Provider (Valhalla API)

- **Client Module**: Valhalla routing client in the canonical frontend under `frontend/`.
- **API Endpoint**: `POST /route` with `costing: "pedestrian"` and `alternates: 2`.
- **Geometry Decoding**: Converts Valhalla `polyline6` encoded strings into GeoJSON `LineString` coordinate arrays (`[longitude, latitude]`).
- **Initial Journey Test**: Default journey connects **Shivaji Park, Mumbai** (`72.8373, 19.0269`) to **Dadar Station, Mumbai** (`72.8433, 19.0180`).

---

## 3. Strict Honesty & Fallback Rules

1. **No Fake Geometry**: If the Valhalla routing engine returns 2 distinct walking routes, SaferPath displays 2 routes with an honest status banner (`"2 distinct walking routes available for this journey."`). Geometry is never offset, duplicated, or artificially fabricated.
2. **Fixture Fallback**: If the public Valhalla API server is unreachable or rate-limited, `routingClient` seamlessly falls back to `fixtureRoutingClient` and displays a transparent badge (`"⚠️ Using demo route data"`).

---

## 4. Separation of Physical Geometry vs. SaferPath Context

- **Physical Routing Layer**: Real road network coordinates provided by Valhalla.
- **SaferPath Context Layer**: Time-lens evidence overlays (lighting status, footfall observations, verified help points) shift deterministically based on arrival time (6:00 PM / 9:00 PM / 11:30 PM) **without modifying physical road geometry**.

---

## 5. GeoJSON Sources & Layers

- `saferpath-routes-source`: `FeatureCollection` containing line geometries for selected and alternative routes.
  - Selected route layer: `#0D9488` (Teal), width 6px, rounded line joins/caps.
  - Alternative route layer: `#94A3B8` (Slate), opacity 0.55, width 3.5px.
- `saferpath-help-points-source`: HTML markers & GeoJSON point features for Pharmacies, Police Help Desks, Transit Desks, and Commercial Havens with interactive popups.

---

## 6. Bidirectional Selection Synchronization

- **Card → Map**: Selecting a route card updates the MapLibre `isSelected` layer property, highlighting the target route line in strong teal.
- **Map → Card**: Clicking a route line on the MapLibre canvas triggers `onSelectRoute(routeId)`, updating the selected route option card in the panel.
- **Bounds Fitting**: `map.fitBounds()` automatically fits the map viewport to contain the origin, destination, and all returned route line geometries with padding.
