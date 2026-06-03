import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChangePasswordPage from "../../course/pages/ChangePasswordPage";

const authRoutes = [
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "/forgot-password",
        element: <ForgotPasswordPage />
    },
    {
        path: "/reset-password",
        element: <ChangePasswordPage mode = "reset" />
    }
];

export default authRoutes;