import React, { createContext, useState, useEffect, useCallback } from 'react';
import type {
  ApplicationTab,
  TimeOfDay,
  RouteOption,
  HelpPoint,
  PhysicalReport,
  ActiveTrip,
  TrustedContact,
  SavedPlace,
  PrivacySettings,
} from '../lib/types';
import { FixtureApiClient } from '../api/fixtureClient';
import { getWalkingRoutes } from '../api/routing/routingClient';
import type { NormalizedRoute } from '../api/routing/types';

import { normalizeRoute } from '../lib/routes';
import { useCurrentTime, formatKolkataTime } from '../lib/timeUtils';

interface SafetyContextType {
  tab: ApplicationTab;
  setTab: (t: ApplicationTab) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
  liveCurrentTime: string;
  selectedTimeDisplay: string;
  userLocationName: string;
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  originLocation: string;
  setOriginLocation: (loc: string) => void;
  destinationLocation: string;
  setDestinationLocation: (loc: string) => void;
  originCoords: [number, number];
  setOriginCoords: (coords: [number, number]) => void;
  destinationCoords: [number, number];
  setDestinationCoords: (coords: [number, number]) => void;
  routes: RouteOption[];
  normalizedRoutes: NormalizedRoute[];
  isLoadingRoutes: boolean;
  isFallbackRouting: boolean;
  routingStatusMessage?: string;
  selectedRoute: RouteOption | null;
  helpPoints: HelpPoint[];
  reports: PhysicalReport[];
  savedPlaces: SavedPlace[];
  addSavedPlace: (place: Omit<SavedPlace, 'id'>) => void;
  editSavedPlace: (id: string, place: Partial<SavedPlace>) => void;
  deleteSavedPlace: (id: string) => void;
  setOriginFromSavedPlace: (place: SavedPlace) => void;
  setDestinationFromSavedPlace: (place: SavedPlace) => void;
  contacts: TrustedContact[];
  privacy: PrivacySettings;
  activeTrip: ActiveTrip | null;
  userConsented: boolean;
  setUserConsented: (c: boolean) => void;
  startTrip: (routeId?: string, contactId?: string) => void;
  logTripCheckIn: (msg: string, eventType?: 'checkin_ok' | 'route_adjustment' | 'destination_reached' | 'trip_cancelled') => void;
  endTrip: () => void;
  resetTrip: () => void;
  addPhysicalReport: (rep: Omit<PhysicalReport, 'id' | 'submittedAt'>) => void;
  addContact: (c: Omit<TrustedContact, 'id'>) => void;
  editContact: (id: string, contact: Partial<TrustedContact>) => void;
  removeContact: (id: string) => void;
  updatePrivacy: (key: keyof PrivacySettings, val: any) => void;
  navigateToRouteDetail: (routeId: string) => void;
  triggerRouteSearch: (origin: [number, number], destination: [number, number]) => Promise<void>;
}

export const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tab, setTabState] = useState<ApplicationTab>(() => {
    if (typeof window !== 'undefined') {
      return normalizeRoute(window.location.pathname);
    }
    return '/route';
  });

  const setTab = (newTab: ApplicationTab) => {
    const normalized = normalizeRoute(newTab);
    if (typeof window !== 'undefined' && window.location.pathname !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setTabState(normalized);
  };

  useEffect(() => {
    const handlePopState = () => {
      const normalized = normalizeRoute(window.location.pathname);
      setTabState(normalized);
    };

    const initialNormalized = normalizeRoute(window.location.pathname);
    if (typeof window !== 'undefined' && window.location.pathname !== initialNormalized) {
      window.history.replaceState({}, '', initialNormalized);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const liveCurrentTime = useCurrentTime();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('now');

  const selectedTimeDisplay =
    timeOfDay === 'now'
      ? liveCurrentTime
      : timeOfDay === '18:00'
      ? '6:00 PM'
      : timeOfDay === '21:00'
      ? '9:00 PM'
      : '11:30 PM';

  const [selectedRouteId, setSelectedRouteId] = useState<string>('valhalla-route-1');
  const [userLocationName, setUserLocationName] = useState<string>('Mumbai');

  // Detect user geolocation on load if available
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setUserLocationName('Current location');
        },
        () => {
          setUserLocationName('Mumbai');
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Default Journey: Shivaji Park, Mumbai -> Dadar Station, Mumbai
  const [originLocation, setOriginLocation] = useState<string>('Shivaji Park, Mumbai');
  const [destinationLocation, setDestinationLocation] = useState<string>('Dadar Station, Mumbai');
  const [originCoords, setOriginCoords] = useState<[number, number]>([72.8373, 19.0269]);
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([72.8433, 19.0180]);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [normalizedRoutes, setNormalizedRoutes] = useState<NormalizedRoute[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState<boolean>(true);
  const [isFallbackRouting, setIsFallbackRouting] = useState<boolean>(false);
  const [routingStatusMessage, setRoutingStatusMessage] = useState<string | undefined>(undefined);

  const [helpPoints, setHelpPoints] = useState<HelpPoint[]>([]);
  const [reports, setReports] = useState<PhysicalReport[]>([]);
  const [userConsented, setUserConsented] = useState<boolean>(true);

  const DEFAULT_SAVED_PLACES: SavedPlace[] = [
    { id: 'sp-1', name: 'Home', label: 'Home', address: 'Shivaji Park, Mumbai', coordinates: [72.8373, 19.0269], isDemo: true },
    { id: 'sp-2', name: 'Transit Hub', label: 'Work', address: 'Dadar Station West, Mumbai', coordinates: [72.8433, 19.0180], isDemo: true },
    { id: 'sp-3', name: 'Campus', label: 'College', address: 'Matunga West, Mumbai', coordinates: [72.8500, 19.0280], isDemo: true },
  ];

  const DEFAULT_CONTACTS: TrustedContact[] = [
    {
      id: 'c-1',
      name: 'Aarti Nandurkar',
      relationship: 'Sister',
      phone: '+91 98221 44556',
      sharesCheckIns: true,
      sharesETA: true,
      isDemo: true,
    },
    {
      id: 'c-2',
      name: 'Dev Kulkarni',
      relationship: 'Roommate',
      phone: '+91 94223 88990',
      sharesCheckIns: true,
      sharesETA: false,
      isDemo: true,
    },
  ];

  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saferpath_saved_places');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.warn('Failed to parse saved places from localStorage:', err);
        }
      }
    }
    return DEFAULT_SAVED_PLACES;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saferpath_saved_places', JSON.stringify(savedPlaces));
    }
  }, [savedPlaces]);

  const [contacts, setContacts] = useState<TrustedContact[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saferpath_trusted_contacts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.warn('Failed to parse trusted contacts from localStorage:', err);
        }
      }
    }
    return DEFAULT_CONTACTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saferpath_trusted_contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const [privacy, setPrivacy] = useState<PrivacySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saferpath_privacy');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.warn('Failed to parse privacy settings from localStorage:', err);
        }
      }
    }
    return {
      storeSearchHistoryLocally: true,
      shareLocationWithContacts: true,
      autoPurgeHours: 24,
      anonymousReportingOnly: true,
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('saferpath_privacy', JSON.stringify(privacy));
    }
  }, [privacy]);

  // Active Trip state with localStorage persistence
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saferpath_active_trip');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.warn('Failed to parse active trip from localStorage:', err);
        }
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeTrip) {
        localStorage.setItem('saferpath_active_trip', JSON.stringify(activeTrip));
      } else {
        localStorage.removeItem('saferpath_active_trip');
      }
    }
  }, [activeTrip]);

  // Fetch real routes from routingClient (Valhalla / fixture fallback)
  const triggerRouteSearch = useCallback(
    async (
      orig: [number, number] = originCoords,
      dest: [number, number] = destinationCoords
    ) => {
      setIsLoadingRoutes(true);
      try {
        const result = await getWalkingRoutes({
          origin: orig,
          destination: dest,
          originName: originLocation,
          destinationName: destinationLocation,
          timeOfDay,
        });

        setNormalizedRoutes(result.routes);
        setIsFallbackRouting(result.isFallback);
        setRoutingStatusMessage(result.message);

        if (result.routes.length > 0) {
          if (!result.routes.some((r) => r.id === selectedRouteId)) {
            setSelectedRouteId(result.routes[0].id);
          }
        }

        // Sync legacy RouteOption list for backward compatibility with distinct context per route
        const legacyRoutes: RouteOption[] = result.routes.map((nr, idx) => ({
          id: nr.id,
          name: nr.name,
          via: nr.via,
          durationMinutes: nr.durationMinutes,
          distanceKm: nr.distanceKm,
          supportLevel: nr.supportLevel,
          confidence: nr.confidence || (idx === 2 ? 'Moderate' : 'High'),
          freshness: nr.freshness || (idx === 0 ? 'Observed 10 mins ago' : idx === 1 ? 'Observed 25 mins ago' : 'Observed 1 hour ago'),
          lightingEvidence: nr.lightingEvidence || (idx === 0 ? 'Well lit corridor' : idx === 1 ? 'Mixed lighting' : 'Limited recent evidence'),
          footfallEvidence: nr.footfallEvidence || (idx === 0 ? 'Moderate activity' : idx === 1 ? 'Higher activity' : 'Lower activity'),
          helpPointsCount: nr.helpPointsCount !== undefined ? nr.helpPointsCount : (idx === 0 ? 3 : idx === 1 ? 4 : 2),
          cautionPointsCount: idx === 2 ? 1 : 0,
          whySummary: nr.whySummary,
          segments: [],
        }));
        setRoutes(legacyRoutes);
      } catch (err) {
        console.error('Failed to search walking routes:', err);
      } finally {
        setIsLoadingRoutes(false);
      }
    },
    [destinationCoords, destinationLocation, originCoords, originLocation, selectedRouteId, timeOfDay]
  );

  // Initial routing search & re-search on origin/destination coordinate shift
  useEffect(() => {
    triggerRouteSearch(originCoords, destinationCoords);
  }, [originCoords, destinationCoords, triggerRouteSearch]);

  // Deterministically load contextual evidence fixtures whenever timeOfDay shifts
  useEffect(() => {
    let isMounted = true;
    FixtureApiClient.getRoutesForTime(timeOfDay).then((data) => {
      if (isMounted && data.length > 0) {
        setRoutes((prev) => (prev.length === 0 ? data : prev));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [timeOfDay]);

  // Load help points and reports fixtures on mount
  useEffect(() => {
    FixtureApiClient.getHelpPoints().then(setHelpPoints);
    FixtureApiClient.getPhysicalReports().then(setReports);
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  const navigateToRouteDetail = (routeId: string) => {
    setSelectedRouteId(routeId);
    setTab('route-evidence');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startTrip = useCallback(
    (routeId?: string, contactId?: string) => {
      const targetId = routeId || selectedRouteId;
      const targetRoute = routes.find((r) => r.id === targetId) || selectedRoute || routes[0];
      if (!targetRoute) return;

      const now = new Date();
      const nowStr = formatKolkataTime(now);

      const newTrip: ActiveTrip = {
        id: `trip-${Date.now()}`,
        routeId: targetRoute.id,
        routeName: targetRoute.via ? `${targetRoute.name} (${targetRoute.via})` : targetRoute.name,
        origin: originLocation,
        destination: destinationLocation,
        travelTime: selectedTimeDisplay,
        startedAt: nowStr,
        startedAtTimestamp: now.getTime(),
        durationMinutes: targetRoute.durationMinutes,
        remainingDistanceKm: targetRoute.distanceKm,
        status: 'In progress',
        trustedContactId: contactId,
        checkInLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: nowStr,
            event: 'walk_commenced',
            message: `Trip started on ${targetRoute.name}. Est. duration ${targetRoute.durationMinutes} mins.`,
          },
        ],
      };

      setActiveTrip(newTrip);
      setTab('/trip');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [selectedRouteId, routes, selectedRoute, originLocation, destinationLocation, selectedTimeDisplay, setTab]
  );

  const logTripCheckIn = useCallback(
    (
      msg: string,
      eventType: 'checkin_ok' | 'route_adjustment' | 'destination_reached' | 'trip_cancelled' = 'checkin_ok'
    ) => {
      const now = new Date();
      const nowStr = formatKolkataTime(now);

      setActiveTrip((prev) => {
        if (!prev) return null;
        const isEnded = eventType === 'destination_reached' || eventType === 'trip_cancelled';
        return {
          ...prev,
          status: isEnded ? 'Completed' : prev.status,
          endedAt: isEnded ? nowStr : prev.endedAt,
          checkInLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowStr,
              event: eventType,
              message: msg,
            },
            ...prev.checkInLogs,
          ],
        };
      });
    },
    []
  );

  const endTrip = useCallback(() => {
    logTripCheckIn('Destination reached. Check-in session completed.', 'destination_reached');
  }, [logTripCheckIn]);

  const resetTrip = useCallback(() => {
    setActiveTrip(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saferpath_active_trip');
    }
  }, []);

  const addSavedPlace = useCallback((place: Omit<SavedPlace, 'id'>) => {
    const newPlace: SavedPlace = {
      ...place,
      id: `sp-${Date.now()}`,
    };
    setSavedPlaces((prev) => [...prev, newPlace]);
  }, []);

  const editSavedPlace = useCallback((id: string, updated: Partial<SavedPlace>) => {
    setSavedPlaces((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  }, []);

  const deleteSavedPlace = useCallback((id: string) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setOriginFromSavedPlace = useCallback(
    (place: SavedPlace) => {
      setOriginLocation(place.address);
      if (place.coordinates) {
        setOriginCoords(place.coordinates);
        triggerRouteSearch(place.coordinates, destinationCoords);
      } else {
        triggerRouteSearch(originCoords, destinationCoords);
      }
      setTab('/route');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [destinationCoords, originCoords, triggerRouteSearch, setTab]
  );

  const setDestinationFromSavedPlace = useCallback(
    (place: SavedPlace) => {
      setDestinationLocation(place.address);
      if (place.coordinates) {
        setDestinationCoords(place.coordinates);
        triggerRouteSearch(originCoords, place.coordinates);
      } else {
        triggerRouteSearch(originCoords, destinationCoords);
      }
      setTab('/route');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [originCoords, destinationCoords, triggerRouteSearch, setTab]
  );

  const addPhysicalReport = (rep: Omit<PhysicalReport, 'id' | 'submittedAt'>) => {
    const newRep: PhysicalReport = {
      ...rep,
      id: `rep-${Date.now()}`,
      submittedAt: 'Just now',
    };
    setReports((prev) => [newRep, ...prev]);
  };

  const addContact = useCallback((contact: Omit<TrustedContact, 'id'>) => {
    setContacts((prev) => [...prev, { ...contact, id: `c-${Date.now()}` }]);
  }, []);

  const editContact = useCallback((id: string, updated: Partial<TrustedContact>) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
  }, []);

  const removeContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const updatePrivacy = (key: keyof PrivacySettings, val: any) => {
    setPrivacy((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <SafetyContext.Provider
      value={{
        tab,
        setTab,
        timeOfDay,
        setTimeOfDay,
        liveCurrentTime,
        selectedTimeDisplay,
        userLocationName,
        selectedRouteId,
        setSelectedRouteId,
        originLocation,
        setOriginLocation,
        destinationLocation,
        setDestinationLocation,
        originCoords,
        setOriginCoords,
        destinationCoords,
        setDestinationCoords,
        routes,
        normalizedRoutes,
        isLoadingRoutes,
        isFallbackRouting,
        routingStatusMessage,
        selectedRoute,
        helpPoints,
        reports,
        savedPlaces,
        addSavedPlace,
        editSavedPlace,
        deleteSavedPlace,
        setOriginFromSavedPlace,
        setDestinationFromSavedPlace,
        contacts,
        privacy,
        activeTrip,
        userConsented,
        setUserConsented,
        startTrip,
        logTripCheckIn,
        endTrip,
        resetTrip,
        addPhysicalReport,
        addContact,
        editContact,
        removeContact,
        updatePrivacy,
        navigateToRouteDetail,
        triggerRouteSearch,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export { useSafety } from './useSafety';
