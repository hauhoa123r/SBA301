import type { AuthRedirectLocation } from "./auth.types";
import { isRecord } from "./authSession";

const AUTH_PATHS = ["/login", "/register", "/oauth/callback"] as const;

function readLocationPart(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function getRequestedPath(location: AuthRedirectLocation): string {
  const from = isRecord(location.state) && isRecord(location.state.from) ? location.state.from : undefined;
  const statePath = from
    ? `${readLocationPart(from.pathname)}${readLocationPart(from.search)}${readLocationPart(from.hash)}`
    : "";
  const queryReturnTo = new URLSearchParams(location.search).get("returnTo");
  const requestedPath = queryReturnTo ? queryReturnTo : statePath;
  return requestedPath.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "";
}

export function getRoleHomePath(): string {
  return "/";
}

export function getPostLoginPath(requestedPath = ""): string {
  const fallback = getRoleHomePath();
  if (!requestedPath.startsWith("/") || requestedPath.startsWith("//")) return fallback;

  const pathname = requestedPath.split(/[?#]/, 1)[0] ?? "";
  if (AUTH_PATHS.some((authPath) => authPath === pathname)) return fallback;

  return requestedPath;
}
