import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface TrustedContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface PreferencesState {
  notifications: {
    journeyUpdates: boolean;
    routeDeviations: boolean;
    checkInReminders: boolean;
    reportStatus: boolean;
    serviceUpdates: boolean;
  };
  privacy: {
    locationSharing: boolean;
    journeySharing: boolean;
    reportPrivacy: "Public route context" | "Private (Admin only)";
  };
  accessibility: {
    textSize: "Default" | "Large" | "Larger";
    reducedMotion: boolean;
    highContrast: boolean;
  };
  language: string;
  trustedContact: TrustedContact | null;
}

interface PreferencesContextType {
  preferences: PreferencesState;
  updateNotifications: (notifs: Partial<PreferencesState["notifications"]>) => void;
  updatePrivacy: (priv: Partial<PreferencesState["privacy"]>) => void;
  updateAccessibility: (acc: Partial<PreferencesState["accessibility"]>) => void;
  updateLanguage: (lang: string) => void;
  updateTrustedContact: (contact: TrustedContact | null) => void;
  clearLocalData: () => void;
}

const defaultPreferences: PreferencesState = {
  notifications: {
    journeyUpdates: true,
    routeDeviations: true,
    checkInReminders: true,
    reportStatus: true,
    serviceUpdates: false,
  },
  privacy: {
    locationSharing: false,
    journeySharing: true,
    reportPrivacy: "Public route context",
  },
  accessibility: {
    textSize: "Default",
    reducedMotion: false,
    highContrast: false,
  },
  language: "English",
  trustedContact: null,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saferpath_preferences");
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saferpath_preferences", e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("saferpath_preferences", JSON.stringify(preferences));
    } catch (e) {
      console.error("Failed to save saferpath_preferences", e);
    }
  }, [preferences, isInitialized]);

  const updateNotifications = (notifs: Partial<PreferencesState["notifications"]>) => {
    setPreferences((prev) => ({ ...prev, notifications: { ...prev.notifications, ...notifs } }));
  };

  const updatePrivacy = (priv: Partial<PreferencesState["privacy"]>) => {
    setPreferences((prev) => ({ ...prev, privacy: { ...prev.privacy, ...priv } }));
  };

  const updateAccessibility = (acc: Partial<PreferencesState["accessibility"]>) => {
    setPreferences((prev) => ({ ...prev, accessibility: { ...prev.accessibility, ...acc } }));
  };

  const updateLanguage = (lang: string) => {
    setPreferences((prev) => ({ ...prev, language: lang }));
  };

  const updateTrustedContact = (contact: TrustedContact | null) => {
    setPreferences((prev) => ({ ...prev, trustedContact: contact }));
  };

  const clearLocalData = () => {
    localStorage.removeItem("saferpath_preferences");
    setPreferences(defaultPreferences);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updateNotifications,
        updatePrivacy,
        updateAccessibility,
        updateLanguage,
        updateTrustedContact,
        clearLocalData,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
