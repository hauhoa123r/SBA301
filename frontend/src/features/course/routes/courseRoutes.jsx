import Homepage from "../pages/home/Homepage";
import { Navigate } from 'react-router-dom';
import CourseDetailPage from "../pages/detail/CourseDetailPage";
import PaymentCheckoutPage from "../pages/payment/PaymentCheckoutPage";
import PaymentResultPage from "../pages/payment/PaymentResultPage";
import ViewCoursesPage from "../pages/catalog/ViewCoursesPage";
import AboutPage from "../../../shared/components/about/AboutPage";
import BlogPage from "../../../shared/components/blog/BlogPage";
import ContactPage from "../../../shared/components/contact/ContactPage";
import CourseManagementLayout from '../layouts/CourseManagementLayout'; 
import CourseDashboardPage from '../pages/management/CourseDashboardPage';
import ManageCoursesPage from '../pages/management/ManageCoursesPage';
import StudentReviewsPage from '../pages/management/StudentReviewsPage';
import CreateCoursePage from '../pages/management/CreateCoursePage';
import EditCoursePage from '../pages/management/EditCoursePage';
import CurriculumDesignPage from '../pages/management/CurriculumDesignPage';

export const courseRoutes = [
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

export const managementCourseRoutes = [
    {
        path: "/management",
        element: <CourseManagementLayout />,
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: 'dashboard', element: <CourseDashboardPage /> },
            { path: 'courses', element: <ManageCoursesPage /> },
            { path: 'courses/create', element: <CreateCoursePage /> },
            { path: 'courses/edit/:courseId', element: <EditCoursePage /> },
            { path: 'courses/:courseId/curriculum', element: <CurriculumDesignPage /> },
            { path: 'reviews', element: <StudentReviewsPage /> },
        ]
    }
];
