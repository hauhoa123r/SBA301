import Homepage from "../pages/home/Homepage";
import CourseDetailPage from "../pages/detail/CourseDetailPage";
import PaymentCheckoutPage from "../pages/payment/PaymentCheckoutPage";
import PaymentResultPage from "../pages/payment/PaymentResultPage";
import ViewCoursesPage from "../pages/catalog/ViewCoursesPage";
import AboutPage from "../../../shared/components/about/AboutPage";
import BlogPage from "../../../shared/components/blog/BlogPage";
import ContactPage from "../../../shared/components/contact/ContactPage";

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
        path: "/payment/checkout",
        element: <PaymentCheckoutPage />
    },
    {
        path: "/payment/result",
        element: <PaymentResultPage />
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
