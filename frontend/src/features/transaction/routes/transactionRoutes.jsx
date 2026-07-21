import RefundRequestsPage from "../pages/RefundRequestsPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const transactionRoutes = [
    {
        path: "/moderator/transactions/refunds",
        element: (
            <ProtectedRoute requiredRole="MODERATOR">
                <RefundRequestsPage />
            </ProtectedRoute>
        ),
    },
];

export default transactionRoutes;
