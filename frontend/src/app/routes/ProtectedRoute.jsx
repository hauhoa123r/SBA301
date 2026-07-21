import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../provider/useAuth";
import { hasAnyRole } from "../../shared/utils/roles";

export default function ProtectedRoute({ allowedRoles = [], children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (!hasAnyRole(user, allowedRoles)) {
        return <Navigate to="/forbidden" replace />;
    }

    return children;
}
