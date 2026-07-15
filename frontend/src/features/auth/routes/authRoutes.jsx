import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "../pages/VerifyEmailPage.jsx";
import OAuthCallbackPage from "../pages/OAuthCallbackPage.jsx";

const authRoutes = [
    {
        path: "/oauth/callback",
        element: <OAuthCallbackPage />
    },
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
        element: <ResetPasswordPage />
    },
    {
        path: "/verify-email",
        element: <VerifyEmailPage />
    }
];

export default authRoutes;
