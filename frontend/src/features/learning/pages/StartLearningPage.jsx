import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { BookOpen, Loader2, UserRound } from "lucide-react";
import LearningProfileView from "./learning-profile-view";
import MyCoursesView from "../components/start-learning/MyCoursesView";
import OverviewPanel from "../components/start-learning/OverviewPanel";
import StudyPlanView from "../components/start-learning/StudyPlanView";
import TestPracticeView from "../components/start-learning/TestPracticeView";
import { getLearningStats } from "../api/learning-profile-api";
import { getCourseLearningDetails } from "../api/learning-api";
import UserReveal from "../../../shared/components/animation/UserReveal";

export default function StartLearningPage() {
    const { activeView = "overview", selectedCourseId, setSelectedCourseId, setEnrolledCourses } = useOutletContext() || {};
    
    const [stats, setStats] = useState(null);
    const [course, setCourse] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setError("");

        const loadLearningData = async () => {
            try {
                const data = await getLearningStats(selectedCourseId);
                if (!active) return;

                const enrolledCourses = Array.isArray(data.enrolledCourses) ? data.enrolledCourses : [];
                const selectedIsOwned = enrolledCourses.some((item) => String(item.id) === String(selectedCourseId));
                const targetCourseId = selectedIsOwned
                    ? selectedCourseId
                    : data.courseId || enrolledCourses[0]?.id || null;

                setStats({ ...data, enrolledCourses });
                setEnrolledCourses(enrolledCourses);

                if (!targetCourseId) {
                    setSelectedCourseId(null);
                    setCourse(null);
                    return;
                }

                if (String(targetCourseId) !== String(selectedCourseId)) {
                    setSelectedCourseId(targetCourseId);
                }
                const courseDetails = await getCourseLearningDetails(targetCourseId);
                if (active) setCourse(courseDetails);
            } catch (requestError) {
                console.error("Error fetching owned learning courses", requestError);
                if (active) {
                    setCourse(null);
                    setError(requestError.response?.data?.message || "Không thể tải các khóa học bạn đang sở hữu.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadLearningData();
        return () => {
            active = false;
        };
    }, [selectedCourseId, setSelectedCourseId, setEnrolledCourses]);

    if (loading && !stats) {
        return (
            <div role="status" aria-live="polite" className="flex min-h-[400px] flex-col items-center justify-center gap-3">
                <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-brand-accentSoft" />
                <p className="text-sm text-brand-textSecondary">Đang tải khóa học của bạn...</p>
            </div>
        );
    }

    if (error) {
        return <LearningMessage title="Không thể tải khóa học" message={error} />;
    }

    if (!stats?.enrolledCourses?.length || !course) {
        return (
            <>
                <LearningGreeting studentName={stats?.studentName || "bạn"} />
                <LearningMessage
                    title="Bạn chưa sở hữu khóa học nào"
                    message="Các khóa học đã thanh toán thành công sẽ xuất hiện tại đây."
                    showCatalogLink
                />
            </>
        );
    }

    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const firstLesson = course.chapters[0]?.lessons[0];

    return (
        <>
            <LearningGreeting studentName={stats?.studentName || "bạn"} />

            <UserReveal key={activeView} className="mt-6 space-y-6" distance={22}>
                {activeView === "overview" && (
                    <OverviewPanel
                        course={course}
                        statsCourseId={stats?.courseId}
                        statsCourseTitle={stats?.courseTitle}
                        totalActivities={stats?.totalActivities}
                        openLessons={stats?.openLessons}
                        completedActivities={stats?.completedActivities}
                        earnedCups={stats?.earnedCups}
                        totalCups={stats?.totalCups}
                        isRefreshing={loading}
                    />
                )}
                {activeView === "study-plan" && <StudyPlanView course={course} />}
                {activeView === "my-courses" && <MyCoursesView course={course} />}
                {activeView === "test-practice" && <TestPracticeView course={course} firstLesson={firstLesson} />}
                {activeView === "profile" && <LearningProfileView course={course} totalLessons={totalLessons} firstLesson={firstLesson} />}
            </UserReveal>
        </>
    );
}

function LearningMessage({ title, message, showCatalogLink = false }) {
    return (
        <section className="mx-auto mt-10 flex min-h-72 max-w-2xl flex-col items-center justify-center border-y border-brand-accent/15 px-5 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-light text-brand-accentSoft">
                <BookOpen aria-hidden="true" className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-xl font-black text-brand-white">{title}</h2>
            <p className="mt-2 text-sm text-brand-textSecondary">{message}</p>
            {showCatalogLink && (
                <Link to="/courses" className="mt-6 rounded-lg bg-brand-accent px-5 py-3 text-sm font-black text-brand-white no-underline hover:bg-brand-accentHover">
                    Xem danh sách khóa học
                </Link>
            )}
        </section>
    );
}

function LearningGreeting({ studentName }) {
    return (
        <UserReveal as="section" className="border-b border-brand-accent/15 pb-5" distance={18}>
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-accent text-brand-white">
                    <UserRound className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-black md:text-3xl">Xin chào, {studentName}</h1>
                    <p className="mt-1 text-sm text-brand-textSecondary">Cùng Edujar tiến bộ mỗi ngày nào!</p>
                </div>
            </div>
        </UserReveal>
    );
}
