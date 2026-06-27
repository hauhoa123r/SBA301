import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ChangePasswordPage from "../pages/ChangePasswordPage.jsx";

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
    },
    {
        path: "/user/change-password",
        element: <ChangePasswordPage />
    }
];

export default authRoutes;