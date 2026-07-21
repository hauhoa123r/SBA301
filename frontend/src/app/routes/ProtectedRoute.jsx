import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../provider/useAuth";
import { getRoleHomePath, hasRole } from "../../shared/utils/roles";

export default function ProtectedRoute({ requiredRole, children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requiredRole && !hasRole(user, requiredRole)) {
        const historyIndex = window.history.state?.idx;
        if (typeof historyIndex === "number" && historyIndex > 0) {
            return <NavigateBack />;
        }
        return <Navigate to={getRoleHomePath(user)} replace />;
    }

    return children;
}

function NavigateBack() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate(-1);
    }, [navigate]);

    return null;
}
