import { BrowserRouter, Routes, Route } from "react-router-dom";
import authRoutes from "../../features/auth/routes/authRoutes";
import courseRoutes from "../../features/course/routes/courseRoutes";
import errorRoutes from "../../features/error/routes/errorRoutes";
import NotFoundPage from "../../features/error/pages/NotFoundPage";
import userRoutes from "../../features/user/routes/UserRouters";
import learningRoutes from "../../features/learning/routes/learningRoutes";
import reportRoutes from "../../features/report/routes/reportRoutes";
import transactionRoutes from "../../features/transaction/routes/transactionRoutes";
import moderatorRoutes from "../../features/moderator/routes/moderatorRoutes";
function AppRoutes() {
  const routes = [
    ...authRoutes,
    ...courseRoutes,
    ...learningRoutes,
    ...moderatorRoutes,
    ...reportRoutes,
    ...transactionRoutes,
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
