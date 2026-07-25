import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "@/entities/user";
import { useAuth } from "@/features/auth";
import { resolveRouteAccess } from "./routeAccess";

interface RoleRouteProps {
    children: ReactElement;
    requiredRole: UserRole;
}

export function RoleRoute({ children, requiredRole }: RoleRouteProps) {
    const { user } = useAuth();
    const location = useLocation();

    const access = resolveRouteAccess(user, requiredRole);

    if (access === "login") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (access === "forbidden") {
        return <Navigate to="/404" replace />;
    }

    return children;
}
