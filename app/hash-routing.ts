import type { DemoView } from "./ui-contracts";
import { screenCatalog } from "./screen-catalog.ts";

export const rootRouteByView: Record<DemoView, string> = {
  welcome: "/welcome",
  home: "/home",
  chats: "/chats",
  calls: "/calls",
  wallet: "/wallet",
  market: "/market",
  portfolio: "/portfolio",
  mining: "/mining",
  security: "/security",
  documents: "/documents",
  settings: "/settings",
};

export function normalizeHash(hash: string): string {
  const raw = hash.replace(/^#/, "").trim();
  if (!raw || raw === "/") return "/welcome";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/").replace(/\/$/, "") || "/welcome";
}

export function toHashRoute(route: string): string {
  return `#${normalizeHash(route)}`;
}

export function routeToView(route: string): DemoView {
  const normalized = normalizeHash(route);
  if (normalized.startsWith("/access") || normalized === "/splash" || normalized === "/welcome") return "welcome";
  if (normalized.startsWith("/chats")) return "chats";
  if (normalized.startsWith("/calls")) return "calls";
  if (normalized.startsWith("/wallet")) return "wallet";
  if (normalized.startsWith("/market")) return "market";
  if (normalized.startsWith("/portfolio")) return "portfolio";
  if (normalized.startsWith("/mining")) return "mining";
  if (normalized.startsWith("/security")) return "security";
  if (normalized.startsWith("/documents") || normalized.startsWith("/notifications")) return "documents";
  if (normalized.startsWith("/settings") || normalized.startsWith("/support") || normalized === "/profile") return "settings";
  return "home";
}

const canonicalRoutes = new Set(screenCatalog.map(target => target.route));
const walletRuntimeRoute = /^\/wallet\/(?:chudo|btc|eth|usdt-ethereum|sol)(?:\/(?:receive|send(?:\/(?:review|confirmation|receipt))?))?$/;

export function isKnownScreenRoute(route: string, allowInternal = false): boolean {
  const normalized = normalizeHash(route);
  if (canonicalRoutes.has(normalized)) return true;
  if (normalized === "/wallet/add-asset" || walletRuntimeRoute.test(normalized)) return true;
  return allowInternal && normalized === "/internal/screen-map";
}

export function fallbackRouteForUnknown(route: string): string {
  const normalized = normalizeHash(route);
  if (normalized.startsWith("/market")) return "/market";
  if (normalized.startsWith("/security")) return "/security";
  if (normalized.startsWith("/wallet")) return "/wallet";
  if (normalized.startsWith("/calls")) return "/calls";
  if (normalized.startsWith("/chats")) return "/chats";
  if (normalized.startsWith("/portfolio")) return "/portfolio";
  if (normalized.startsWith("/mining")) return "/mining";
  if (normalized.startsWith("/documents") || normalized.startsWith("/notifications")) return "/documents";
  if (normalized.startsWith("/settings") || normalized.startsWith("/support") || normalized.startsWith("/profile")) return "/settings";
  return "/home";
}
