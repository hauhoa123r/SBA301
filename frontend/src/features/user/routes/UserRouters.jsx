import ViewProfilePage from "../pages/ViewProfilePage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const userRoutes = [
  {
    path: "/user/profile",
    element: (
      <ProtectedRoute>
        <ViewProfilePage />
      </ProtectedRoute>
    ),
  },
];

export default userRoutes;
