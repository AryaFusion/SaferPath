import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { currentAccount, onboardingStatus, revoke, verifyCode } from "../api/identity";
import { currentAccount, onboardingStatus, revoke, updateProfile, verifyCode } from "../api/identity";
import { session } from "../api/client";
import type { Account, OnboardingStatus } from "../api/types";
import type { Account, OnboardingStatus, ProfileUpdatePayload } from "../api/types";

type AuthPhase="initializing"|"authenticated"|"unauthenticated"|"error";
interface AuthContextValue { phase:AuthPhase; account:Account|null; onboarding:OnboardingStatus|null; error:string|null; isAuthenticated:boolean; currentUser:{name:string;email:string;phone:string;home?:string;work?:string;college?:string}|null; verify:(email:string,code:string)=>Promise<void>; refresh:()=>Promise<void>; logout:()=>Promise<void>; login:(email:string)=>void; register:(data:unknown)=>void; updateUser:(data:unknown)=>void }
const AuthContext=createContext<AuthContextValue|undefined>(undefined);
export function AuthProvider({children}:{children:ReactNode}){const [phase,setPhase]=useState<AuthPhase>("initializing");const [account,setAccount]=useState<Account|null>(null);const [onboarding,setOnboarding]=useState<OnboardingStatus|null>(null);const [error,setError]=useState<string|null>(null);const clear=()=>{session.clear();setAccount(null);setOnboarding(null);setPhase("unauthenticated")};const refresh=async()=>{if(!session.get()){clear();return}try{const [next,status]=await Promise.all([currentAccount(),onboardingStatus()]);setAccount(next);setOnboarding(status);setError(null);setPhase("authenticated")}catch(e){clear();setError(e instanceof Error?e.message:"Unable to restore your session.")}};useEffect(()=>{void refresh()
},[]);const verify=async(email:string,code:string)=>{const result=await verifyCode(email,code);setAccount(result.account);await refresh()};const logout=async()=>{try{await revoke()}catch{void 0}finally{clear()}};const currentUser=account?{name:account.display_name||"SaferPath user",email:"Verified account",phone:""}:null;return <AuthContext.Provider value={{phase,account,onboarding,error,isAuthenticated:phase==="authenticated",currentUser,verify,refresh,logout,login:()=>undefined,register:()=>undefined,updateUser:()=>undefined}}>{children}</AuthContext.Provider>}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error("useAuth must be used within AuthProvider");return value}
export type AuthPhase = "initializing" | "authenticated" | "unauthenticated" | "error";

export interface AuthContextValue {
  phase: AuthPhase;
  account: Account | null;
  onboarding: OnboardingStatus | null;
  error: string | null;
  isAuthenticated: boolean;
  currentUser: { name: string; email: string; phone?: string } | null;
  verify: (email: string, code: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: ProfileUpdatePayload) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AuthPhase>("initializing");
  const [account, setAccount] = useState<Account | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clear = () => {
    session.clear();
    setAccount(null);
    setOnboarding(null);
    setPhase("unauthenticated");
  };

  const refresh = async () => {
    if (!session.get()) {
      clear();
      return;
    }
    try {
      const [nextAccount, nextStatus] = await Promise.all([
        currentAccount(),
        onboardingStatus(),
      ]);
      setAccount(nextAccount);
      setOnboarding(nextStatus);
      setError(null);
      setPhase("authenticated");
    } catch (e) {
      clear();
      setError(e instanceof Error ? e.message : "Unable to restore your session.");
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const verify = async (email: string, code: string) => {
    const result = await verifyCode(email, code);
    setAccount(result.account);
    await refresh();
  };

  const logout = async () => {
    try {
      await revoke();
    } catch {
      // Ignore network errors on logout
    } finally {
      clear();
    }
  };

  const updateUser = async (data: ProfileUpdatePayload) => {
    await updateProfile(data);
    await refresh();
  };

  const currentUser = account
    ? {
        name: account.display_name || "SaferPath user",
        email: "Verified account",
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        phase,
        account,
        onboarding,
        error,
        isAuthenticated: phase === "authenticated",
        currentUser,
        verify,
        refresh,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
