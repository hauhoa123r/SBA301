import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { NotFoundPage } from "@/pages/not-found";
import { BrandLogo } from "@/shared/ui";
import LearnCourseHeader from "../components/learn-course/LearnCourseHeader";
import LearnCourseSidebar from "../components/learn-course/LearnCourseSidebar";
import { useWorkspaceViewport } from "../hooks/useWorkspaceViewport";
import "../components/learn-course/learningWorkspace.css";
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const wide = useWorkspaceViewport();
    const sidebarVisible = wide && !sidebarCollapsed && !focusMode;

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

    if (loading) {
        return (
            <div className="learning-workspace workspace-loading" role="status" aria-label="Đang tải nội dung khóa học" aria-busy="true">
                <div className="workspace-loading-top"><BrandLogo /><span>Đang chuẩn bị bài học…</span></div>
                <div className="workspace-loading-body"><div className="workspace-skeleton workspace-skeleton-nav" /><div><div className="workspace-skeleton workspace-skeleton-title" /><div className="workspace-skeleton workspace-skeleton-video" /><div className="workspace-skeleton workspace-skeleton-title" /></div></div>
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

    if (!activeChapter) return <div className="learning-workspace workspace-empty-course"><h1>Khóa học chưa có nội dung học tập</h1><p>Hãy quay lại khi giảng viên cập nhật bài học mới.</p><button className="workspace-primary-button" onClick={() => navigate("/learning")}>Về góc học tập</button></div>;
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
        <div className={`learning-workspace user-ui-scope ${sidebarVisible ? "has-sidebar" : ""} ${focusMode ? "is-focus" : ""}`}>
            <a className="workspace-skip" href="#workspace-content">Đến nội dung bài học</a>
            <LearnCourseHeader course={course} progress={progress} focusMode={focusMode}
                onFocusToggle={() => { setFocusMode(value => !value); setSidebarOpen(false); }}
                sidebarOpen={wide ? sidebarVisible : sidebarOpen}
                onSidebarToggle={() => {
                    if (wide) { if (focusMode) { setFocusMode(false); setSidebarCollapsed(false); } else setSidebarCollapsed(value => !value); }
                    else setSidebarOpen(value => !value);
                }} />
            <div className="workspace-body">
                <LearnCourseSidebar
                    key={course.id}
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
                    lessonPlayback={savedProgress?.lessonPlayback}
                    onLessonSelect={goLesson}
                    onQuizSelect={goQuiz}
                    onAssignmentSelect={goAssignment}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    wide={wide}
                    visible={sidebarVisible}
                />

                <main className="workspace-main" id="workspace-content" tabIndex={-1}>
                    <div className="workspace-content">
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
                                lessonNumber: allLessons.findIndex(item => item.id === activeLesson?.id) + 1,
                                lessonCount: allLessons.length,
                                goAssignment,
                            }}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
