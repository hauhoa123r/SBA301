import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { NotFoundPage } from "@/pages/not-found";
import LearnCourseHeader from "../components/learn-course/LearnCourseHeader";
import LearnCourseSidebar from "../components/learn-course/LearnCourseSidebar";
import { getCourseLearningDetails, getCourseProgress, updateLessonProgress, saveLessonPlayback, submitQuiz, submitAssignment } from "../api/learning-api";
import {
    buildLearningActivities,
    getChapterStats,
    getInitialAnswers,
    answersFromResults,
    quizAnswerPayload,
} from "../shared/learnCourseUtils";

export default function LearnCourseLayout() {
    const { courseId, lessonId, quizId, chapterId, assignmentId } = useParams();
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
    const [assignmentDrafts, setAssignmentDrafts] = useState({});
    const [savedProgress, setSavedProgress] = useState(null);
    const [savingActivity, setSavingActivity] = useState(false);
    const writeQueue = useRef(Promise.resolve());
    const currentCourseId = useRef(courseId);
    const [savingLessonId, setSavingLessonId] = useState(null);
    const [progressError, setProgressError] = useState("");

    const applyProgress = (data) => {
        if (String(data.courseId) !== String(currentCourseId.current)) return;
        setSavedProgress(data);
        setCompletedLessons(new Set(data.completedLessonIds.map(Number)));
        setCompletedChapterIds(new Set(data.completedChapterIds.map(Number)));
        setPassedQuizzes(new Set(data.passedQuizIds.map(Number)));
        setSubmittedAssignments(new Set(data.submittedAssignmentIds.map(Number)));
    };
    const enqueue = (operation) => {
        const next = writeQueue.current.catch(() => {}).then(operation);
        writeQueue.current = next;
        return next;
    };

    useEffect(() => {
        let isMounted = true;
        currentCourseId.current = courseId;
        // Keep the existing loading transition while the selected course changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setCourseNotFound(false);
        setLoadError("");
        setSavedProgress(null);
        setCompletedLessons(new Set());
        setCompletedChapterIds(new Set());
        setPassedQuizzes(new Set());
        setSubmittedAssignments(new Set());
        setQuizResults({});
        setAnswers({});
        setAssignmentDrafts({});
        setProgressError("");
        setSavingActivity(false);
        setSavingLessonId(null);

        const loadCourse = async () => {
            try {
                const [courseResult, progressResult] = await Promise.allSettled([
                    getCourseLearningDetails(courseId),
                    getCourseProgress(courseId),
                ]);

                if (!isMounted) return;
                if (courseResult.status === "rejected") throw courseResult.reason;
                if (progressResult.status === "rejected") throw progressResult.reason;

                const data = courseResult.value;
                setCourse(data);
                const courseProgress = progressResult.value;
                applyProgress(courseProgress);
                setQuizResults(Object.fromEntries(courseProgress.quizResults.map(result => [result.quizId, result])));
                setAnswers({ ...getInitialAnswers(data), ...answersFromResults(courseProgress.quizResults) });
                setProgressError("");

            } catch (err) {
                console.error("Failed to fetch owned course details:", err);
                if (!isMounted) return;

                if (err.response?.status === 403) {
                    navigate("/subscriptions", { replace: true });
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
    const activeLesson = allLessons.find((lesson) => lesson.id === Number(lessonId)) || allLessons.find(lesson => !completedLessons.has(lesson.id)) || allLessons[0];
    const activeQuiz = allQuizzes.find((quiz) => quiz.id === Number(quizId)) || (!allLessons.length && !assignmentId && !chapterId ? allQuizzes[0] : null);
    const activeAssignment = allAssignments.find((assignment) => assignmentId ? assignment.id === Number(assignmentId) : assignment.chapter.id === Number(chapterId));
    const activeChapter = activeQuiz?.chapter || activeAssignment?.chapter || activeLesson?.chapter;
    const mode = activeQuiz ? "quiz" : activeAssignment ? "assignment" : "lesson";
    const completedCount = savedProgress?.completedActivities ?? 0;
    const progress = savedProgress?.progressPercent ?? 0;
    const chapterStats = getChapterStats({ course, completedLessons, passedQuizzes, submittedAssignments });
    const completedChapters = course.chapters.filter((chapter) => completedChapterIds.has(chapter.id));

    const goLesson = (id) => navigate(`/learning/courses/${course.id}/lessons/${id}`);
    const goQuiz = (id) => navigate(`/learning/courses/${course.id}/quizzes/${id}`);
    const goAssignment = (id) => navigate(`/learning/courses/${course.id}/assignments/${id}`);
    const assignmentSubmission = savedProgress?.assignmentSubmissions.find(item => item.assignmentId === activeAssignment?.id);
    const assignmentText = assignmentDrafts[activeAssignment?.id] ?? assignmentSubmission?.text ?? "";
    const setAssignmentText = (text) => setAssignmentDrafts(previous => ({ ...previous, [activeAssignment.id]: text }));

    if (!activeChapter) return <div className="p-8 text-center">Khóa học chưa có nội dung học tập.</div>;
    if ((quizId && !activeQuiz) || (assignmentId && !activeAssignment) || (chapterId && !activeAssignment)
        || (lessonId && !allLessons.some(item => item.id === Number(lessonId)))) return <NotFoundPage />;

    const handleLessonComplete = async (lessonId) => {
        if (savingLessonId !== null || savingActivity) return;

        setSavingLessonId(lessonId);
        setProgressError("");
        try {
            const courseProgress = await enqueue(() => updateLessonProgress(course.id, lessonId, !completedLessons.has(lessonId)));
            applyProgress(courseProgress);
        } catch (error) {
            console.error("Failed to save lesson progress:", error);
            if (String(course.id) === String(currentCourseId.current))
                setProgressError(error.response?.data?.message || "Không thể lưu tiến độ bài học. Vui lòng thử lại.");
        } finally {
            if (String(course.id) === String(currentCourseId.current)) setSavingLessonId(null);
        }
    };

    const handleQuizSubmit = async () => {
        if (!activeQuiz || savingActivity || savingLessonId !== null) return;
        setSavingActivity(true);
        setProgressError("");
        try {
            const data = await enqueue(() => submitQuiz(course.id, activeQuiz.id, quizAnswerPayload(activeQuiz, answers)));
            applyProgress(data);
            if (String(course.id) === String(currentCourseId.current))
                setQuizResults(previous => ({ ...previous, [activeQuiz.id]: data.quizResults.find(item => item.quizId === activeQuiz.id) }));
        } catch (error) {
            if (String(course.id) === String(currentCourseId.current))
                setProgressError(error.response?.data?.message || "Không thể lưu bài kiểm tra. Vui lòng thử lại.");
        } finally { if (String(course.id) === String(currentCourseId.current)) setSavingActivity(false); }
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

    const handleAssignmentSubmit = async () => {
        if (!activeAssignment || !assignmentText.trim() || savingActivity || savingLessonId !== null) return;
        setSavingActivity(true);
        setProgressError("");
        try {
            applyProgress(await enqueue(() => submitAssignment(course.id, activeAssignment.id, assignmentText)));
        } catch (error) {
            if (String(course.id) === String(currentCourseId.current))
                setProgressError(error.response?.data?.message || "Không thể lưu bài nộp. Vui lòng thử lại.");
        } finally { if (String(course.id) === String(currentCourseId.current)) setSavingActivity(false); }
    };

    const handlePlayback = (id, payload) => enqueue(() => saveLessonPlayback(course.id, id, payload))
        .catch(error => {
            if (String(course.id) === String(currentCourseId.current))
                setProgressError(error.response?.data?.message || "Không thể lưu vị trí xem video.");
            throw error;
        });

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
                                savingActivity,
                                assignmentSubmission,
                                handlePlayback,
                                lessonPlayback: savedProgress?.lessonPlayback.find(item => item.lessonId === activeLesson?.id),
                                submittedAssignments,
                                passedQuizzes,
                                totalActivities,
                                goLesson,
                                goQuiz,
                                previousLesson: allLessons[allLessons.findIndex(item => item.id === activeLesson?.id) - 1],
                                nextLesson: allLessons[allLessons.findIndex(item => item.id === activeLesson?.id) + 1],
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
