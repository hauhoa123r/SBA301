import LearnCoursePage from "../pages/LearnCoursePage";
import LearnCourseLayout from "../layouts/LearnCourseLayout";
import LearningLayout from "../layouts/LearningLayout";
import StartLearningPage from "../pages/StartLearningPage";

const learningRoutes = [
    {
        path: "/learning",
        element: <LearningLayout />,
        children: [
            {
                index: true,
                element: <StartLearningPage />,
            },
        ],
    },
    {
        path: "/learning/courses/:courseId",
        element: <LearnCourseLayout />,
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
