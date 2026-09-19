import React, { createContext, useState, useEffect, useCallback } from 'react';
import type {
  ApplicationTab,
  TimeOfDay,
  RouteOption,
  HelpPoint,
  PhysicalReport,
  ActiveTrip,
  TrustedContact,
  PrivacySettings,
} from '../lib/types';
import { FixtureApiClient } from '../api/fixtureClient';
import { getWalkingRoutes } from '../api/routing/routingClient';
import type { NormalizedRoute } from '../api/routing/types';

import { normalizeRoute } from '../lib/routes';

interface SafetyContextType {
  tab: ApplicationTab;
  setTab: (t: ApplicationTab) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (t: TimeOfDay) => void;
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
  contacts: TrustedContact[];
  privacy: PrivacySettings;
  activeTrip: ActiveTrip | null;
  userConsented: boolean;
  setUserConsented: (c: boolean) => void;
  startTrip: (routeId: string) => void;
  logTripCheckIn: (msg: string, eventType?: 'checkin_ok' | 'route_adjustment' | 'destination_reached') => void;
  endTrip: () => void;
  addPhysicalReport: (rep: Omit<PhysicalReport, 'id' | 'submittedAt'>) => void;
  addContact: (c: Omit<TrustedContact, 'id'>) => void;
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

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('23:30'); // Default to 11:30 PM
  const [selectedRouteId, setSelectedRouteId] = useState<string>('valhalla-route-1');

  
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

  const [contacts, setContacts] = useState<TrustedContact[]>([
    {
      id: 'c-1',
      name: 'Aarti Nandurkar',
      relationship: 'Sister',
      phone: '+91 98221 44556',
      sharesCheckIns: true,
      sharesETA: true,
    },
    {
      id: 'c-2',
      name: 'Dev Kulkarni',
      relationship: 'Roommate',
      phone: '+91 94223 88990',
      sharesCheckIns: true,
      sharesETA: false,
    },
  ]);

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    storeSearchHistoryLocally: true,
    shareLocationWithContacts: true,
    autoPurgeHours: 24,
    anonymousReportingOnly: true,
  });

  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);

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

        // Sync legacy RouteOption list for backward compatibility
        const legacyRoutes: RouteOption[] = result.routes.map((nr) => ({
          id: nr.id,
          name: nr.name,
          via: nr.via,
          durationMinutes: nr.durationMinutes,
          distanceKm: nr.distanceKm,
          supportLevel: nr.supportLevel,
          confidence: 'High',
          freshness: 'Observed 10 mins ago',
          lightingEvidence: 'Well lit corridor',
          footfallEvidence: 'Moderate activity',
          helpPointsCount: 3,
          cautionPointsCount: 0,
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

  const startTrip = (routeId: string) => {
    const targetRoute = routes.find((r) => r.id === routeId) || routes[0];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveTrip({
      id: `trip-${Date.now()}`,
      routeId: targetRoute.id,
      routeName: `${targetRoute.name} (${targetRoute.via})`,
      startedAt: nowStr,
      durationMinutes: targetRoute.durationMinutes,
      remainingDistanceKm: targetRoute.distanceKm,
      status: 'In progress',
      checkInLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          event: 'walk_commenced',
          message: `Walk started on ${targetRoute.name} ${targetRoute.via}. Est. travel time ${targetRoute.durationMinutes} mins.`,
        },
      ],
    });

    setTab('active-trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logTripCheckIn = (
    msg: string,
    eventType: 'checkin_ok' | 'route_adjustment' | 'destination_reached' = 'checkin_ok'
  ) => {
    if (!activeTrip) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveTrip((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        status: eventType === 'destination_reached' ? 'Completed' : prev.status,
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
  };

  const endTrip = () => {
    logTripCheckIn('Destination reached. Check-in session completed. Telemetry queued for 24h purge.', 'destination_reached');
  };

  const addPhysicalReport = (rep: Omit<PhysicalReport, 'id' | 'submittedAt'>) => {
    const newRep: PhysicalReport = {
      ...rep,
      id: `rep-${Date.now()}`,
      submittedAt: 'Just now',
    };
    setReports((prev) => [newRep, ...prev]);
  };

  const addContact = (contact: Omit<TrustedContact, 'id'>) => {
    setContacts((prev) => [...prev, { ...contact, id: `c-${Date.now()}` }]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

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
        contacts,
        privacy,
        activeTrip,
        userConsented,
        setUserConsented,
        startTrip,
        logTripCheckIn,
        endTrip,
        addPhysicalReport,
        addContact,
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
