import Homepage from "../pages/Homepage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import CourseDetailPage from "../../course-catalog/pages/CourseDetailPage";
import ViewCoursesPage from "../../course-catalog/pages/ViewCoursesPage";
import AboutPage from "../../../shared/components/AboutPage";
import BlogPage from "../../../shared/components/BlogPage";
import ContactPage from "../../../shared/components/ContactPage";

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
    }
];

export default courseRoutes;
