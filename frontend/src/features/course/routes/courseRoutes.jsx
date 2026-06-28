import Homepage from "../public/Homepage";
import CourseDetailPage from "../pages/CourseDetailPage";
import ViewCoursesPage from "../pages/ViewCoursesPage";
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
    }
];

export default courseRoutes;
