import { Navigate } from 'react-router-dom';
import TeacherLayout from '../layout/TeacherLayout';
import TeacherDashboardPage from '../pages/TeacherDashboardPage';
import ManageCoursesPage from '../pages/ManageCoursesPage';
import StudentReviewsPage from '../pages/StudentReviewsPage';
import CreateCoursePage from '../pages/CreateCoursePage';
import EditCoursePage from '../pages/EditCoursePage';
import CurriculumDesignPage from '../pages/CurriculumDesignPage';

const teacherRoutes = [
  {
    path: 'teacher',
    element: <TeacherLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TeacherDashboardPage /> },
      { path: 'courses', element: <ManageCoursesPage /> },
      { path: 'courses/create', element: <CreateCoursePage /> },
      { path: 'courses/edit/:courseId', element: <EditCoursePage /> },
      { path: 'courses/:courseId/curriculum', element: <CurriculumDesignPage /> },
      { path: 'reviews', element: <StudentReviewsPage /> },
    ],
  },
];

export default teacherRoutes;
