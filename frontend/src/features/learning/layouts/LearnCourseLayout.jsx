import { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import NotFoundPage from "../../../shared/pages/NotFoundPage";
import LearnCourseHeader from "../components/learn-course/LearnCourseHeader";
import LearnCourseSidebar from "../components/learn-course/LearnCourseSidebar";
import { getCourseLearningDetails } from "../api/learning-api";
import { getLearningCourse } from "../service/learningMock";
import {
    buildLearningActivities,
    getChapterStats,
    getCompletedChapters,
    getInitialAnswers,
} from "../shared/learnCourseUtils";

export default function LearnCourseLayout() {
    const { courseId, lessonId, quizId, chapterId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    const [completedLessons, setCompletedLessons] = useState(() => new Set([1001, 1002]));
    const [passedQuizzes, setPassedQuizzes] = useState(() => new Set([5001]));
    const [submittedAssignments, setSubmittedAssignments] = useState(() => new Set());
    const [answers, setAnswers] = useState({});
    const [quizResults, setQuizResults] = useState({});
    const [assignmentText, setAssignmentText] = useState("");

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        getCourseLearningDetails(courseId)
            .then((data) => {
                if (isMounted) {
                    setCourse(data);
                    if (data) {
                        setAnswers(getInitialAnswers(data));
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch course details from API, falling back to mock:", err);
                if (isMounted) {
                    const mockData = getLearningCourse(courseId);
                    setCourse(mockData);
                    if (mockData) {
                        setAnswers(getInitialAnswers(mockData));
                    }
                    setLoading(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-brand-darker text-brand-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-accent border-t-transparent"></div>
                    <p className="text-sm font-bold text-brand-textSoft">Đang tải thông tin khóa học...</p>
                </div>
            </div>
        );
    }

    if (!course) return <NotFoundPage />;

    const { allLessons, allQuizzes, allAssignments, totalActivities } = buildLearningActivities(course);
    const activeLesson = allLessons.find((lesson) => lesson.id === Number(lessonId)) || allLessons[0];
    const activeQuiz = allQuizzes.find((quiz) => quiz.id === Number(quizId));
    const activeAssignment = allAssignments.find((assignment) => assignment.chapter.id === Number(chapterId));
    const activeChapter = activeQuiz?.chapter || activeAssignment?.chapter || activeLesson.chapter;
    const mode = activeQuiz ? "quiz" : activeAssignment ? "assignment" : "lesson";
    const completedCount = completedLessons.size + passedQuizzes.size + submittedAssignments.size;
    const progress = totalActivities ? Math.round((completedCount / totalActivities) * 100) : 0;
    const chapterStats = getChapterStats({ course, completedLessons, passedQuizzes, submittedAssignments });
    const completedChapters = getCompletedChapters({ course, completedLessons, passedQuizzes, submittedAssignments });

    const goLesson = (id) => navigate(`/learning/courses/${course.id}/lessons/${id}`);
    const goQuiz = (id) => navigate(`/learning/courses/${course.id}/quizzes/${id}`);
    const goAssignment = (id) => navigate(`/learning/courses/${course.id}/chapters/${id}/assignment`);

    const handleQuizSubmit = () => {
        if (!activeQuiz) return;

        const correctCount = activeQuiz.questions.filter((question) => {
            if (question.questionType === "SPEAKING") {
                const ansStr = answers[question.id]?.toString() || "";
                const match = ansStr.match(/(\d+)$/);
                if (match) {
                    const speakingScore = Number(match[1]);
                    return speakingScore >= 60; // 60% passing threshold for speech pronunciation
                }
                return false;
            }
            const selected = Number(answers[question.id]);
            return question.answers.some((item) => item.id === selected && (item.isCorrect || item.is_correct));
        }).length;
        const score = Math.round((correctCount / activeQuiz.questions.length) * 100);
        const isPassed = score >= activeQuiz.passScore || score >= activeQuiz.pass_score;

        setQuizResults((prev) => ({ ...prev, [activeQuiz.id]: { score, isPassed } }));
        if (isPassed) setPassedQuizzes((prev) => new Set(prev).add(activeQuiz.id));
    };

    const handleQuizRetake = (quizId) => {
        setQuizResults((prev) => {
            const next = { ...prev };
            delete next[quizId];
            return next;
        });
        const quizToReset = allQuizzes.find((q) => q.id === Number(quizId));
        if (quizToReset) {
            setAnswers((prev) => {
                const next = { ...prev };
                quizToReset.questions.forEach((q) => {
                    delete next[q.id];
                });
                return next;
            });
        }
    };

    const handleAssignmentSubmit = () => {
        if (!activeAssignment || !assignmentText.trim()) return;

        setSubmittedAssignments((prev) => new Set(prev).add(activeAssignment.id));
        setAssignmentText("");
    };

    return (
        <div className="min-h-screen bg-brand-darker text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <div className="grid min-h-screen lg:grid-cols-[345px_1fr]">
                <LearnCourseSidebar
                    course={course}
                    activeChapter={activeChapter}
                    activeLesson={activeLesson}
                    activeQuiz={activeQuiz}
                    activeAssignment={activeAssignment}
                    chapterStats={chapterStats}
                    completedLessons={completedLessons}
                    passedQuizzes={passedQuizzes}
                    submittedAssignments={submittedAssignments}
                    completedCount={completedCount}
                    totalActivities={totalActivities}
                    progress={progress}
                    mode={mode}
                    onLessonSelect={goLesson}
                    onQuizSelect={goQuiz}
                    onAssignmentSelect={goAssignment}
                />

                <main className="min-w-0">
                    <LearnCourseHeader />

                    <div className="mx-auto max-w-6xl px-5 py-7 md:px-8">
                        <Outlet
                            context={{
                                answers,
                                assignmentText,
                                activeChapter,
                                activeLesson,
                                activeQuiz,
                                activeAssignment,
                                chapterStats,
                                completedChapters,
                                completedCount,
                                completedLessons,
                                course,
                                handleAssignmentSubmit,
                                handleQuizSubmit,
                                handleQuizRetake,
                                mode,
                                progress,
                                quizResults,
                                setAnswers,
                                setAssignmentText,
                                setCompletedLessons,
                                submittedAssignments,
                                totalActivities,
                                goLesson,
                                goQuiz,
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
