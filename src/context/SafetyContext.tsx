import React, { createContext, useContext, useState } from 'react';
import type {
  PageRoute,
  RouteOption,
  HelpPoint,
  StreetReport,
  TrustedContact,
  UserSettingsPermissions,
  ActiveTripState,
} from '../types';
import {
  MOCK_ROUTES,
  MOCK_HELP_POINTS,
  MOCK_REPORTS,
  MOCK_CONTACTS,
  DEFAULT_SETTINGS_PERMISSIONS,
} from '../data/mockData';

interface SafetyContextType {
  currentPage: PageRoute;
  setCurrentPage: (page: PageRoute) => void;
  selectedRouteId: string;
  setSelectedRouteId: (id: string) => void;
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  leavingTime: string;
  setLeavingTime: (val: string) => void;
  routes: RouteOption[];
  helpPoints: HelpPoint[];
  reports: StreetReport[];
  contacts: TrustedContact[];
  settings: UserSettingsPermissions;
  activeTrip: ActiveTripState;
  startTrip: (routeId: string) => void;
  logCheckIn: (message: string, type?: 'checkin' | 'reroute' | 'arrived') => void;
  endTrip: () => void;
  addReport: (rep: Omit<StreetReport, 'id' | 'createdAt' | 'timeAgo'>) => void;
  addContact: (contact: Omit<TrustedContact, 'id'>) => void;
  removeContact: (id: string) => void;
  updateSettings: (key: keyof UserSettingsPermissions, val: boolean) => void;
  navigateToDetail: (routeId: string) => void;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('plan');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-b');
  const [origin, setOrigin] = useState<string>('Sitabuldi Metro Station');
  const [destination, setDestination] = useState<string>('Laxmi Nagar Gate 3');
  const [leavingTime, setLeavingTime] = useState<string>('09:30 PM');

  const [routes] = useState<RouteOption[]>(MOCK_ROUTES);
  const [helpPoints] = useState<HelpPoint[]>(MOCK_HELP_POINTS);
  const [reports, setReports] = useState<StreetReport[]>(MOCK_REPORTS);
  const [contacts, setContacts] = useState<TrustedContact[]>(MOCK_CONTACTS);
  const [settings, setSettings] = useState<UserSettingsPermissions>(DEFAULT_SETTINGS_PERMISSIONS);

  const [activeTrip, setActiveTrip] = useState<ActiveTripState>({
    active: false,
    routeId: null,
    routeName: '',
    startedAt: null,
    etaMinutes: 24,
    distanceRemainingKm: 4.1,
    checkInStatus: 'On route',
    logs: [],
  });

  const navigateToDetail = (routeId: string) => {
    setSelectedRouteId(routeId);
    setCurrentPage('route-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startTrip = (routeId: string) => {
    const r = routes.find((rt) => rt.id === routeId) || routes[0];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveTrip({
      active: true,
      routeId: r.id,
      routeName: `${r.name} (${r.via})`,
      startedAt: nowStr,
      etaMinutes: r.durationMin,
      distanceRemainingKm: r.distanceKm,
      checkInStatus: 'On route — heartbeats active',
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          type: 'start',
          message: `Walk started on ${r.name} ${r.via}. ETA ${r.durationMin} mins.`,
        },
      ],
    });

    setCurrentPage('trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logCheckIn = (message: string, type: 'checkin' | 'reroute' | 'arrived' = 'checkin') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveTrip((prev) => ({
      ...prev,
      checkInStatus: message,
      active: type === 'arrived' ? false : prev.active,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: nowStr,
          type,
          message,
        },
        ...prev.logs,
      ],
    }));
  };

  const endTrip = () => {
    logCheckIn("Trip completed successfully. Logs scheduled for 24-hour purge.", 'arrived');
  };

  const addReport = (rep: Omit<StreetReport, 'id' | 'createdAt' | 'timeAgo'>) => {
    const newReport: StreetReport = {
      ...rep,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
      timeAgo: 'Just now',
    };
    setReports((prev) => [newReport, ...prev]);
  };

  const addContact = (contact: Omit<TrustedContact, 'id'>) => {
    const created: TrustedContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };
    setContacts((prev) => [...prev, created]);
  };

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const updateSettings = (key: keyof UserSettingsPermissions, val: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <SafetyContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedRouteId,
        setSelectedRouteId,
        origin,
        setOrigin,
        destination,
        setDestination,
        leavingTime,
        setLeavingTime,
        routes,
        helpPoints,
        reports,
        contacts,
        settings,
        activeTrip,
        startTrip,
        logCheckIn,
        endTrip,
        addReport,
        addContact,
        removeContact,
        updateSettings,
        navigateToDetail,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
