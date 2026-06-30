import { Route } from 'react-router-dom';
import TeacherLayout from '../components/TeacherLayout';
import TeacherDashboardPage from '../pages/TeacherDashboardPage';
import ManageCoursesPage from '../pages/ManageCoursesPage';
import StudentReviewsPage from '../pages/StudentReviewsPage';
import CreateCoursePage from '../pages/CreateCoursePage';
import EditCoursePage from '../pages/EditCoursePage';
import CurriculumDesignPage from '../pages/CurriculumDesignPage';

export const teacherRoutes = (
  <Route path="teacher" element={<TeacherLayout />}>
    <Route path="dashboard" element={<TeacherDashboardPage />} />
    <Route path="courses" element={<ManageCoursesPage />} />
    <Route path="courses/create" element={<CreateCoursePage />} />
    <Route path="courses/edit/:courseId" element={<EditCoursePage />} />
    <Route path="courses/:courseId/curriculum" element={<CurriculumDesignPage />} />
    <Route path="reviews" element={<StudentReviewsPage />} />
  </Route>
);
