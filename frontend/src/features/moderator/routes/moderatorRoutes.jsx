import CourseModerationPage from "../../course/pages/CourseModerationPage";
import ModeratorDashboardPage from "../pages/ModeratorDashboardPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const moderatorOnly = (element) => (
    <ProtectedRoute requiredRole="MODERATOR">
        {element}
    </ProtectedRoute>
);

const courseModerationPaths = [
    "/moderator/courses",
    "/moderator/courses/review",
    "/moderator/courses/approve",
    "/moderator/courses/reject",
    "/moderator/courses/hide",
];

const moderatorRoutes = [
    {
        path: "/moderator",
        element: moderatorOnly(<ModeratorDashboardPage />),
    },
    ...courseModerationPaths.map((path) => ({
        path,
        element: moderatorOnly(<CourseModerationPage />),
    })),
];

export default moderatorRoutes;
