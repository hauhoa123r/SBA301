import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { resolveRouteAccess } from "./routeAccess";

interface ProtectedRouteProps {
    children: ReactElement;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, initializing } = useAuth();
    const location = useLocation();

    if (initializing) return <div role="status">Đang kiểm tra phiên đăng nhập…</div>;

    const access = resolveRouteAccess(user);

    if (access === "login") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (access === "forbidden") {
        return <Navigate to="/404" replace />;
    }

    return children;
}
