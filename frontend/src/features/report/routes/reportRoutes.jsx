import ViolationReportsPage from "../pages/ViolationReportsPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const reportRoutes = [
    {
        path: "/moderator/reports/violations",
        element: (
            <ProtectedRoute requiredRole="MODERATOR">
                <ViolationReportsPage />
            </ProtectedRoute>
        ),
    },
];

export default reportRoutes;
