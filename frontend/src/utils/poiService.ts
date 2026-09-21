import type { SupportPoint, SupportCategory } from "../data/supportPointsData";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function fetchNearbySupportPoints(
  lat: number,
  lon: number,
  radius: number = 2000
): Promise<SupportPoint[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius}, ${lat}, ${lon});
      node["amenity"="police"](around:${radius}, ${lat}, ${lon});
      node["amenity"="pharmacy"](around:${radius}, ${lat}, ${lon});
      node["amenity"="clinic"](around:${radius}, ${lat}, ${lon});
      node["healthcare"="clinic"](around:${radius}, ${lat}, ${lon});
    );
    out body;
  `;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch POIs");
    }

    const data = await response.json();
    return mapOSMToSupportPoints(data.elements, lat, lon);
  } catch (error) {
    console.error("Error fetching POIs from Overpass:", error);
    throw error;
  }
}

export async function geocodeSearch(query: string): Promise<{lat: number, lon: number, display_name: string} | null> {
  try {
    const response = await fetch(`${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`);
    if (!response.ok) throw new Error("Failed to geocode");
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

function mapOSMToSupportPoints(elements: unknown[], _centerLat: number, _centerLon: number): SupportPoint[] {
  void _centerLat; void _centerLon;
  return elements.map((el) => {
    const point = el as { id: string | number; lat: number; lon: number; tags?: Record<string, string> };
    let category: SupportCategory = "Support";
    let type = "Support Point";
    let desc = "Local support point";

    const amenity = point.tags?.amenity;
    const healthcare = point.tags?.healthcare;

    if (amenity === "police") {
      category = "Police";
      type = "Police Station";
      desc = "24/7 Police Station. Contact for immediate security assistance.";
    } else if (amenity === "hospital") {
      category = "Hospital";
      type = "Hospital";
      desc = "General hospital facility.";
    } else if (amenity === "pharmacy") {
      category = "Pharmacy";
      type = "Pharmacy";
      desc = "Local pharmacy. Operating hours may vary.";
    } else if (amenity === "clinic" || healthcare === "clinic") {
      category = "Clinic";
      type = "Clinic";
      desc = "Medical clinic.";
    }

    const name = point.tags?.name || `Unnamed ${type}`;
    const address = point.tags?.["addr:street"]
      ? `${point.tags["addr:street"]} ${point.tags["addr:housenumber"] || ""}`.trim()
      : (point.tags?.["addr:full"] || "Address unavailable");

    return {
      id: `osm_${point.id}`,
      name,
      type,
      category,
      address,
      latitude: point.lat,
      longitude: point.lon,
      distance: "", // Set by UI
      description: desc,
      verified: null,
      verificationDate: null,
      freshness: "Source data; freshness unavailable",
      routeRelevant: false, 
      routeProximity: null,
      distanceMeters: 0,
    };
  });
}
