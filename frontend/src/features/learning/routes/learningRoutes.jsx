import LearnCoursePage from "../pages/LearnCoursePage";
import StartLearningPage from "../pages/StartLearningPage";

const learningRoutes = [
    {
        path: "/learning",
        element: <StartLearningPage />,
    },
    {
        path: "/learning/courses/:courseId",
        element: <LearnCoursePage />,
    },
    {
        path: "/learning/courses/:courseId/lessons/:lessonId",
        element: <LearnCoursePage />,
    },
    {
        path: "/learning/courses/:courseId/quizzes/:quizId",
        element: <LearnCoursePage />,
    },
    {
        path: "/learning/courses/:courseId/chapters/:chapterId/assignment",
        element: <LearnCoursePage />,
    },
];

export default learningRoutes;
