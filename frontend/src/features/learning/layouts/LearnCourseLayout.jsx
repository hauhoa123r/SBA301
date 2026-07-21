import { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import NotFoundPage from "../../../shared/pages/NotFoundPage";
import LearnCourseHeader from "../components/learn-course/LearnCourseHeader";
import LearnCourseSidebar from "../components/learn-course/LearnCourseSidebar";
import { getCourseLearningDetails, getCourseProgress, updateLessonProgress } from "../api/learning-api";
import {
    buildLearningActivities,
    getChapterStats,
    getInitialAnswers,
} from "../shared/learnCourseUtils";

export default function LearnCourseLayout() {
    const { courseId, lessonId, quizId, chapterId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courseNotFound, setCourseNotFound] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [completedLessons, setCompletedLessons] = useState(() => new Set());
    const [completedChapterIds, setCompletedChapterIds] = useState(() => new Set());
    const [passedQuizzes, setPassedQuizzes] = useState(() => new Set());
    const [submittedAssignments, setSubmittedAssignments] = useState(() => new Set());
    const [answers, setAnswers] = useState({});
    const [quizResults, setQuizResults] = useState({});
    const [assignmentText, setAssignmentText] = useState("");
    const [savingLessonId, setSavingLessonId] = useState(null);
    const [progressError, setProgressError] = useState("");

    useEffect(() => {
        let isMounted = true;
        // Keep the existing loading transition while the selected course changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setCourseNotFound(false);
        setLoadError("");

        const loadCourse = async () => {
            try {
                const [courseResult, progressResult] = await Promise.allSettled([
                    getCourseLearningDetails(courseId),
                    getCourseProgress(courseId),
                ]);

                if (!isMounted) return;
                if (courseResult.status === "rejected") throw courseResult.reason;

                const data = courseResult.value;
                setCourse(data);
                if (progressResult.status === "fulfilled") {
                    const courseProgress = progressResult.value;
                    setCompletedLessons(new Set(courseProgress.completedLessonIds.map(Number)));
                    setCompletedChapterIds(new Set(courseProgress.completedChapterIds.map(Number)));
                    setProgressError("");
                } else {
                    console.error("Failed to load course progress:", progressResult.reason);
                    setCompletedLessons(new Set());
                    setCompletedChapterIds(new Set());
                    setProgressError(
                        progressResult.reason?.response?.data?.message
                        || "Không thể tải tiến độ đã lưu. Hãy restart backend rồi tải lại trang."
                    );
                }

                if (data) setAnswers(getInitialAnswers(data));
            } catch (err) {
                console.error("Failed to fetch owned course details:", err);
                if (!isMounted) return;

                if (err.response?.status === 403) {
                    const historyIndex = window.history.state?.idx;
                    if (typeof historyIndex === "number" && historyIndex > 0) {
                        navigate(-1);
                    } else {
                        navigate("/learning", { replace: true });
                    }
                    return;
                }

                if (err.response?.status === 404) {
                    setCourseNotFound(true);
                } else {
                    setLoadError(err.response?.data?.message || "Không thể tải khóa học. Vui lòng thử lại.");
                }
                setCourse(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCourse();
        return () => {
            isMounted = false;
        };
    }, [courseId, navigate]);

    useEffect(() => {
        if (!sidebarOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setSidebarOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [sidebarOpen]);

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

    if (courseNotFound) return <NotFoundPage />;

    if (loadError || !course) {
        return (
            <div role="alert" className="flex min-h-screen items-center justify-center bg-brand-darker px-5 text-brand-white">
                <div className="max-w-xl border-y border-status-danger/30 px-6 py-10 text-center">
                    <h1 className="text-xl font-black">Không thể tải khóa học</h1>
                    <p className="mt-3 text-sm text-brand-textSecondary">{loadError || "Dữ liệu khóa học không hợp lệ."}</p>
                    <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold hover:bg-brand-accentHover">
                        Tải lại
                    </button>
                </div>
            </div>
        );
    }

    const { allLessons, allQuizzes, allAssignments, totalActivities } = buildLearningActivities(course);
    const activeLesson = allLessons.find((lesson) => lesson.id === Number(lessonId)) || allLessons[0];
    const activeQuiz = allQuizzes.find((quiz) => quiz.id === Number(quizId));
    const activeAssignment = allAssignments.find((assignment) => assignment.chapter.id === Number(chapterId));
    const activeChapter = activeQuiz?.chapter || activeAssignment?.chapter || activeLesson.chapter;
    const mode = activeQuiz ? "quiz" : activeAssignment ? "assignment" : "lesson";
    const completedCount = completedLessons.size + passedQuizzes.size + submittedAssignments.size;
    const progress = totalActivities ? Math.round((completedCount / totalActivities) * 100) : 0;
    const chapterStats = getChapterStats({ course, completedLessons, passedQuizzes, submittedAssignments });
    const completedChapters = course.chapters.filter((chapter) => completedChapterIds.has(chapter.id));

    const goLesson = (id) => navigate(`/learning/courses/${course.id}/lessons/${id}`);
    const goQuiz = (id) => navigate(`/learning/courses/${course.id}/quizzes/${id}`);
    const goAssignment = (id) => navigate(`/learning/courses/${course.id}/chapters/${id}/assignment`);

    const handleLessonComplete = async (lessonId) => {
        if (completedLessons.has(lessonId) || savingLessonId !== null) return;

        setSavingLessonId(lessonId);
        setProgressError("");
        try {
            const courseProgress = await updateLessonProgress(course.id, lessonId, true);
            setCompletedLessons(new Set(courseProgress.completedLessonIds.map(Number)));
            setCompletedChapterIds(new Set(courseProgress.completedChapterIds.map(Number)));
        } catch (error) {
            console.error("Failed to save lesson progress:", error);
            setProgressError(error.response?.data?.message || "Không thể lưu tiến độ bài học. Vui lòng thử lại.");
        } finally {
            setSavingLessonId(null);
        }
    };

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
        <div className="user-ui-scope min-h-screen bg-brand-darker text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <div className="min-h-screen lg:grid lg:grid-cols-[345px_1fr]">
                <LearnCourseSidebar
                    course={course}
                    activeChapter={activeChapter}
                    activeLesson={activeLesson}
                    activeQuiz={activeQuiz}
                    activeAssignment={activeAssignment}
                    chapterStats={chapterStats}
                    completedChapterIds={completedChapterIds}
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
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className="min-w-0">
                    <LearnCourseHeader
                        sidebarOpen={sidebarOpen}
                        onSidebarToggle={() => setSidebarOpen((current) => !current)}
                    />

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
                                completedChapterIds,
                                completedChapters,
                                completedCount,
                                completedLessons,
                                course,
                                handleAssignmentSubmit,
                                handleLessonComplete,
                                handleQuizSubmit,
                                handleQuizRetake,
                                mode,
                                progress,
                                progressError,
                                quizResults,
                                setAnswers,
                                setAssignmentText,
                                savingLessonId,
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
