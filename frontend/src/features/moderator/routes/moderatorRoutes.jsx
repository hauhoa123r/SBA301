import CourseModerationPage from "../../course/pages/CourseModerationPage";
import ModeratorDashboardPage from "../pages/ModeratorDashboardPage";

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
        element: <ModeratorDashboardPage />,
    },
    ...courseModerationPaths.map((path) => ({
        path,
        element: <CourseModerationPage />,
    })),
];

export default moderatorRoutes;
