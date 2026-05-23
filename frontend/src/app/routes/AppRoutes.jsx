import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import authRoutes from "../../features/auth/routes/authRoutes";
import userRoutes from "../../features/user/routes/userRoutes";
import errorRoutes from "../../features/error/routes/errorRoutes";
function AppRoutes() {

    const routes = [
        ...authRoutes,
        ...userRoutes,
        ...errorRoutes
    ];

    return (
        <BrowserRouter>
            <Routes>
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={route.element}
                    />
                ))}
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;