import NotFoundPage from "../pages/NotFoundPage";
import ForbiddenPage from "../pages/ForbiddenPage";
const errorRoutes = [
    {   
        path: "/404",
        element: <NotFoundPage />
    },
    {
        path: "/forbidden",
        element: <ForbiddenPage />
    }
];
export default errorRoutes;
