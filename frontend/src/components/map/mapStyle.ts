import type { StyleSpecification } from "maplibre-gl";

export const fallbackMapStyle: StyleSpecification = { version: 8, sources: {}, layers: [{ id: "saferpath-background", type: "background", paint: { "background-color": "#dce5df" } }] };
export const mapStyle = import.meta.env.VITE_MAP_STYLE_URL || fallbackMapStyle;
