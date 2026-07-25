import { hasRole, type User, type UserRole } from "@/entities/user";

export type RouteAccessDecision = "allow" | "login" | "forbidden";

export function resolveRouteAccess(
    user: User | null | undefined,
    requiredRole?: UserRole,
): RouteAccessDecision {
    if (!user) return "login";
    if (!hasRole(user, requiredRole ?? "STUDENT")) return "forbidden";
    return "allow";
}
