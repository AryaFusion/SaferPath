export type AppRoute =
  | "/landing"
  | "/welcome"
  | "/route"
  | "/evidence"
  | "/help"
  | "/reports"
  | "/trip"
  | "/saved-places"
  | "/settings"
  | "/privacy"
  | "/emergency";

export interface RouteConfig {
  path: AppRoute;
  label: string;
  isPrimary: boolean;
}

export const VALID_ROUTES: AppRoute[] = [
  "/landing",
  "/welcome",
  "/route",
  "/evidence",
  "/help",
  "/reports",
  "/trip",
  "/saved-places",
  "/settings",
  "/privacy",
  "/emergency",
];

export function isValidRoute(path: string): path is AppRoute {
  return VALID_ROUTES.includes(path as AppRoute);
}

export function normalizeRoute(path: string): AppRoute {
  if (path === "/" || path === "") return "/route";
  // Check for legacy tab names
  if (path === "/planner") return "/route";
  if (path === "/route-evidence") return "/evidence";
  if (path === "/help-points") return "/help";
  if (path === "/report-context") return "/reports";
  if (path === "/active-trip") return "/trip";
  if (path === "/contacts") return "/saved-places";
  if (path === "/about") return "/landing";

  if (isValidRoute(path)) return path;
  return "/route";
}
