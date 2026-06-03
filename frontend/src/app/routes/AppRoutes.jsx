import { BrowserRouter, Routes, Route } from "react-router-dom";
import authRoutes from "../../features/auth/routes/authRoutes";
import courseRoutes from "../../features/course/routes/courseRoutes";
import errorRoutes from "../../features/error/routes/errorRoutes";
import NotFoundPage from "../../features/error/pages/NotFoundPage";
import userRoutes from "../../features/user/routes/UserRouters";
function AppRoutes() {
  const routes = [
    ...authRoutes,
    ...courseRoutes,
    ...errorRoutes,
    ...userRoutes,
  ];

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
