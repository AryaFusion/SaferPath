export type ContextKind = "good" | "mixed" | "limited";
export interface MapRoute { id: string; label: string; coordinates: [number, number][]; context: ContextKind; }
export interface MapHelpPoint { id: string; name: string; category: "police" | "hospital" | "pharmacy" | "transport" | "support"; coordinate: [number, number]; freshness: string; }
