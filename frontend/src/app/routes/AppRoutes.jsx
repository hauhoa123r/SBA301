import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import authRoutes from "../../features/auth/routes/authRoutes";
function AppRoutes() {

    const routes = [
        ...authRoutes
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