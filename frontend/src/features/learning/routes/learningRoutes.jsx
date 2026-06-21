import LearnCoursePage from "../pages/LearnCoursePage";

const learningRoutes = [
    {
        path: "/learning",
        element: <LearnCoursePage />,
    },
    {
        path: "/learning/courses/:courseId",
        element: <LearnCoursePage />,
    },
];

export default learningRoutes;
