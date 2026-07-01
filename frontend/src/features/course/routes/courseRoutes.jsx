import Homepage from "../pages/Homepage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import CourseDetailPage from "../../course-catalog/pages/CourseDetailPage";
import ViewCoursesPage from "../../course-catalog/pages/ViewCoursesPage";
import AboutPage from "../../public/pages/AboutPage";
import BlogPage from "../../public/pages/BlogPage";
import ContactPage from "../../public/pages/ContactPage";
import CourseModerationPage from "../pages/CourseModerationPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const courseModeratorPaths = [
    "/moderator/courses",
    "/moderator/courses/review",
    "/moderator/courses/approve",
    "/moderator/courses/reject",
    "/moderator/courses/hide",
];

const courseRoutes = [
    {
        path: "/",
        element: <Homepage />
    },
    {
        path: "/courses",
        element: <ViewCoursesPage />
    },
    {
        path: "/courses/:id",
        element: <CourseDetailPage />
    },
    {
        path: "/about",
        element: <AboutPage />
    },
    {
        path: "/blog",
        element: <BlogPage />
    },
    {
        path: "/contact",
        element: <ContactPage />
    },
    {
        path: "/user/change-password",
        element: <ChangePasswordPage />
    },
    ...courseModeratorPaths.map((path) => ({
        path,
        element: (
            <ProtectedRoute allowedRoles={["moderator"]} demoRole="moderator">
                <CourseModerationPage />
            </ProtectedRoute>
        )
    }))
];

export default courseRoutes;
