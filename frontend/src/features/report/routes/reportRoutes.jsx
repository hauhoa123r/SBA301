import ViolationReportsPage from "../pages/ViolationReportsPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const reportRoutes = [
    {
        path: "/moderator/reports/violations",
        element: (
            <ProtectedRoute allowedRoles={["moderator"]} demoRole="moderator">
                <ViolationReportsPage />
            </ProtectedRoute>
        ),
    },
];

export default reportRoutes;
