import { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

export interface ActiveTripData {
  id: string;
  origin: string;
  destination: string;
  travelMode: string;
  departureTime: string;
  date: string;
  selectedRoute: string;
  checkInEnabled: boolean;
  eta: string;
  context: {
    lights: string;
    activity: string;
    help: string;
    reports: string;
    freshness: string;
  };
}

export interface CurrentLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export type LocationStatus = "idle" | "requesting" | "tracking" | "denied" | "unavailable" | "error" | "stopped";

interface JourneyContextType {
  activeTrip: ActiveTripData | null;
  startJourney: (tripData: Omit<ActiveTripData, "id">) => void;
  endJourney: () => void;
  triggerDeviation: () => void;
  clearDeviation: () => void;
  isDeviationActive: boolean;
  currentTripLocation: CurrentLocation | null;
  locationTrackingStatus: LocationStatus;
}

const JourneyContext = createContext<JourneyContextType | undefined>(undefined);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [activeTrip, setActiveTrip] = useState<ActiveTripData | null>(null);
  const [isDeviationActive, setIsDeviationActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [currentTripLocation, setCurrentTripLocation] = useState<CurrentLocation | null>(null);
  const [locationTrackingStatus, setLocationTrackingStatus] = useState<LocationStatus>("idle");
  const watchIdRef = useRef<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saferpath_active_trip");
      if (stored) {
        setActiveTrip(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saferpath_active_trip from localStorage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever activeTrip changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (activeTrip) {
        localStorage.setItem("saferpath_active_trip", JSON.stringify(activeTrip));
      } else {
        localStorage.removeItem("saferpath_active_trip");
      }
    } catch (e) {
      console.error("Failed to save saferpath_active_trip to localStorage", e);
    }
  }, [activeTrip, isInitialized]);

  // Geolocation Tracking Effect
  useEffect(() => {
    if (activeTrip) {
      // Start tracking
      setLocationTrackingStatus("requesting");
      if ("geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentTripLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
            setLocationTrackingStatus("tracking");
          },
          (error) => {
            console.error("Geolocation error:", error);
            if (error.code === error.PERMISSION_DENIED) {
              setLocationTrackingStatus("denied");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              setLocationTrackingStatus("unavailable");
            } else {
              setLocationTrackingStatus("error");
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationTrackingStatus("unavailable");
      }
    } else {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLocationTrackingStatus("stopped");
      setCurrentTripLocation(null);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [activeTrip]);

  const startJourney = (tripData: Omit<ActiveTripData, "id">) => {
    setActiveTrip({
      id: `trip_${Date.now()}`,
      ...tripData,
    });
    setIsDeviationActive(false);
  };

  const endJourney = () => {
    setActiveTrip(null);
    setIsDeviationActive(false);
  };

  const triggerDeviation = () => {
    setIsDeviationActive(true);
  };

  const clearDeviation = () => {
    setIsDeviationActive(false);
  };

  return (
    <JourneyContext.Provider value={{ 
      activeTrip, 
      startJourney, 
      endJourney, 
      triggerDeviation, 
      clearDeviation, 
      isDeviationActive,
      currentTripLocation,
      locationTrackingStatus
    }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return context;
}
