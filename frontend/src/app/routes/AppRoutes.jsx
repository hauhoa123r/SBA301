import { BrowserRouter, Routes, Route } from "react-router-dom";
import authRoutes from "../../features/auth/routes/authRoutes";
import courseRoutes from "../../features/course/routes/courseRoutes";
import errorRoutes from "../../shared/routes/errorRoutes";
import NotFoundPage from "../../shared/pages/NotFoundPage";
import userRoutes from "../../features/user/routes/UserRouters";
import learningRoutes from "../../features/learning/routes/learningRoutes";
import managerRoutes from "../../features/manager/routes/managerRoutes";
import MainLayout from "../../shared/layouts/MainLayout";
import teacherRoutes from "../../features/teacher/routes/teacherRoutes";

function renderRoute(route) {
  return (
    <Route
      key={route.path || "index"}
      index={route.index}
      path={route.path}
      element={route.element}
    >
      {route.children?.map((childRoute) => renderRoute(childRoute))}
    </Route>
  );
}

function AppRoutes() {
  const routesWithLayout = [
    ...authRoutes,
    ...courseRoutes,
    ...errorRoutes,
    ...userRoutes,
    ...managerRoutes,
  ];

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {routesWithLayout.map((route) => renderRoute(route))}
        </Route>

        {learningRoutes.map((route) => renderRoute(route))}
        {teacherRoutes.map((route) => renderRoute(route))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;