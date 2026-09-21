import { ApiError } from "./types";
const baseUrl=(import.meta.env.VITE_API_URL || "/v1").replace(/\/$/,"");
let token:string|null=sessionStorage.getItem("saferpath_session");
export const session={get:()=>token,set:(value:string)=>{token=value;sessionStorage.setItem("saferpath_session",value)},clear:()=>{token=null;sessionStorage.removeItem("saferpath_session")}};
export async function api<T>(path:string, init:RequestInit={}, authenticated=true):Promise<T>{const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),15000);try{const response=await fetch(`${baseUrl}${path}`,{...init,signal:controller.signal,headers:{"Content-Type":"application/json",...(authenticated&&token?{Authorization:`Bearer ${token}`}:{}),...init.headers}});if(!response.ok)throw new ApiError(response.status,response.status===401?"Your session has expired. Please sign in again.":response.status===429?"Please wait before trying again.":response.status>=500?"The service is temporarily unavailable.":"We could not complete that request.");return response.status===204?undefined as T:await response.json() as T}finally{window.clearTimeout(timer)}}

const baseUrl = (import.meta.env.VITE_API_URL || "/v1").replace(/\/$/, "");

let token: string | null = sessionStorage.getItem("saferpath_session");

export const session = {
  get: (): string | null => token,
  set: (value: string): void => {
    token = value;
    sessionStorage.setItem("saferpath_session", value);
  },
  clear: (): void => {
    token = null;
    sessionStorage.removeItem("saferpath_session");
  },
};

export function getEphemeralSessionId(): string {
  let id = sessionStorage.getItem("saferpath_ephemeral_session_id");
  if (!id) {
    id = `sess_${crypto.randomUUID()}`;
    sessionStorage.setItem("saferpath_ephemeral_session_id", id);
  }
  return id;
}

export function generateIdempotencyKey(prefix = "idem"): string {
  return `${prefix}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
  authenticated = true
): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined),
    };

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
      let serverMessage: string | null = null;
      let errorCode: string | undefined;

      try {
        const errorData = await response.json();
        if (errorData) {
          if (errorData.error?.message) {
            serverMessage = errorData.error.message;
            errorCode = errorData.error.code;
          } else if (typeof errorData.detail === "string") {
            serverMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail) && errorData.detail[0]?.msg) {
            serverMessage = errorData.detail[0].msg;
          } else if (errorData.message) {
            serverMessage = errorData.message;
          }
        }
      } catch {
        // Fallback to default message if body isn't json
      }

      const defaultMessage =
        response.status === 401
          ? "Your session has expired. Please sign in again."
          : response.status === 403
          ? "You do not have permission to perform this action."
          : response.status === 404
          ? "The requested item was not found."
          : response.status === 409
          ? "There was a conflict with the current state."
          : response.status === 422
          ? "The requested input is invalid or outside the pilot area."
          : response.status === 429
          ? "Please wait before trying again."
          : response.status >= 500
          ? "The service is temporarily unavailable."
          : "We could not complete that request.";

      throw new ApiError(response.status, serverMessage || defaultMessage, errorCode);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(408, "The request timed out. Please try again.");
    }
    throw new ApiError(0, "Network unavailable. Please check your connection.");
  } finally {
    window.clearTimeout(timer);
  }
}
