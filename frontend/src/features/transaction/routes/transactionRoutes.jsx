import RefundRequestsPage from "../pages/RefundRequestsPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const transactionRoutes = [
    {
        path: "/moderator/transactions/refunds",
        element: (
            <ProtectedRoute allowedRoles={["moderator"]} demoRole="moderator">
                <RefundRequestsPage />
            </ProtectedRoute>
        ),
    },
];

export default transactionRoutes;
