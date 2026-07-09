import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../provider/useAuth";

const normalizeRole = (role) =>
    String(role || "")
        .replace(/^ROLE_/i, "")
        .trim()
        .toLowerCase();

const extractRoles = (user) => {
    if (!user) return [];

    const roleSources = [
        user.role,
        user.roles,
        user.authority,
        user.authorities,
        user.permission,
        user.permissions,
    ];

    return roleSources
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .map((value) => {
            if (typeof value === "object" && value !== null) {
                return value.role || value.name || value.authority;
            }

            return value;
        })
        .map(normalizeRole)
        .filter(Boolean);
};

export default function ProtectedRoute({ allowedRoles = [], children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const acceptedRoles = allowedRoles.map(normalizeRole);
    const userRoles = extractRoles(user);
    const hasRequiredRole =
        acceptedRoles.length === 0 || userRoles.some((role) => acceptedRoles.includes(role));

    if (!hasRequiredRole) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
