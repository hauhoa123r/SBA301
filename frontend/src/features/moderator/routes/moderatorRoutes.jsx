import ProtectedRoute from "../../../app/routes/ProtectedRoute";
import ModeratorDashboardPage from "../pages/ModeratorDashboardPage";

const moderatorRoutes = [
    {
        path: "/moderator",
        element: (
            <ProtectedRoute allowedRoles={["moderator"]} demoRole="moderator">
                <ModeratorDashboardPage />
            </ProtectedRoute>
        ),
    },
];

export default moderatorRoutes;
