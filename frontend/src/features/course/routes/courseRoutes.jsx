import Homepage from "../pages/Homepage";
import ChangePasswordPage from "../pages/ChangePasswordPage";

const courseRoutes = [
    {
        path: "/",
        element: <Homepage />
    },
    {
        path: "/user/change-password",
        element: <ChangePasswordPage />
    }
];

export default courseRoutes;