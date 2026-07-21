import LearnCoursePage from "../pages/LearnCoursePage";
import LearnCourseLayout from "../layouts/LearnCourseLayout";
import LearningLayout from "../layouts/LearningLayout";
import StartLearningPage from "../pages/StartLearningPage";
import ProtectedRoute from "../../../app/routes/ProtectedRoute";

const learningRoutes = [
    {
        path: "/learning",
        element: (
            <ProtectedRoute requiredRole="STUDENT">
                <LearningLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <StartLearningPage />,
            },
        ],
    },
    {
        path: "/learning/courses/:courseId",
        element: (
            <ProtectedRoute requiredRole="STUDENT">
                <LearnCourseLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <LearnCoursePage />,
            },
            {
                path: "lessons/:lessonId",
                element: <LearnCoursePage />,
            },
            {
                path: "quizzes/:quizId",
                element: <LearnCoursePage />,
            },
            {
                path: "chapters/:chapterId/assignment",
                element: <LearnCoursePage />,
            },
        ],
    },
];

export default learningRoutes;
