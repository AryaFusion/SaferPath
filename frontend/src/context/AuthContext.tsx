import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  home?: string;
  work?: string;
  college?: string;
  createdAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

interface AuthContextType extends AuthState {
  login: (email: string) => void;
  register: (userData: Partial<User>) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    currentUser: null,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saferpath_auth");
      if (stored) {
        setAuthState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse saferpath_auth", e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem("saferpath_auth", JSON.stringify(authState));
    } catch (e) {
      console.error("Failed to save saferpath_auth", e);
    }
  }, [authState, isInitialized]);

  const login = (email: string) => {
    // For prototype, we just mock the user data based on email if it doesn't match current
    const user: User = authState.currentUser?.email === email ? authState.currentUser : {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email: email,
      phone: "",
      createdAt: new Date().toISOString(),
    };
    
    setAuthState({
      isAuthenticated: true,
      currentUser: user,
    });
  };

  const register = (userData: Partial<User>) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      home: userData.home || "",
      work: userData.work || "",
      college: userData.college || "",
      createdAt: new Date().toISOString(),
    };
    setAuthState({
      isAuthenticated: true,
      currentUser: newUser,
    });
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      currentUser: null,
    });
  };

  const updateUser = (data: Partial<User>) => {
    setAuthState((prev) => ({
      ...prev,
      currentUser: prev.currentUser ? { ...prev.currentUser, ...data } : null,
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
