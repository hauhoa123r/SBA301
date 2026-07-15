import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Loader2, UserRound } from "lucide-react";
import LearningProfileView from "./learning-profile-view";
import MyCoursesView from "../components/start-learning/MyCoursesView";
import OverviewPanel from "../components/start-learning/OverviewPanel";
import StudyPlanView from "../components/start-learning/StudyPlanView";
import TestPracticeView from "../components/start-learning/TestPracticeView";
import { getLearningCourse } from "../service/learningMock";
import { getLearningStats } from "../api/learning-profile-api";
import UserReveal from "../../../shared/components/animation/UserReveal";
import ContinueLearningSection from "../components/start-learning/continue-learning/ContinueLearningSection";

export default function StartLearningPage() {
    const { activeView = "overview", selectedCourseId, setSelectedCourseId, setEnrolledCourses } = useOutletContext() || {};
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        // Keep the existing loading transition while the selected course changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        getLearningStats(selectedCourseId)
            .then((data) => {
                if (active) {
                    setStats(data);
                    if (data.enrolledCourses) {
                        setEnrolledCourses(data.enrolledCourses);
                    }
                    if (!selectedCourseId && data.courseId) {
                        setSelectedCourseId(data.courseId);
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error("Error fetching learning stats", err);
                if (active) {
                    setLoading(false);
                }
            });
        return () => {
            active = false;
        };
    }, [selectedCourseId, setSelectedCourseId, setEnrolledCourses]);

    // Use course from stats or fallback to course 1
    const courseIdToLoad = selectedCourseId || stats?.courseId || 1;
    const course = getLearningCourse(courseIdToLoad) || getLearningCourse(1);
    
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const firstLesson = course.chapters[0]?.lessons[0];

    if (loading && !stats) {
        if (activeView !== "overview") {
            return (
                <div role="status" aria-live="polite" className="flex min-h-[400px] flex-col items-center justify-center gap-3">
                    <Loader2 aria-hidden="true" className="h-10 w-10 animate-spin text-brand-accentSoft" />
                    <p className="text-sm text-brand-textSecondary">Đang tải dữ liệu học tập...</p>
                </div>
            );
        }

        return (
            <div aria-busy="true" className="mx-auto w-full max-w-7xl space-y-6">
                <div aria-hidden="true" className="flex animate-pulse items-center gap-4 border-b border-brand-accent/15 pb-5">
                    <span className="h-12 w-12 rounded-full bg-brand-light" />
                    <span className="space-y-2">
                        <span className="block h-7 w-56 max-w-[65vw] rounded-lg bg-brand-light" />
                        <span className="block h-4 w-44 max-w-[52vw] rounded bg-brand-panel" />
                    </span>
                </div>
                <ContinueLearningSection course={course} isRefreshing />
            </div>
        );
    }

    return (
        <>
            <LearningGreeting studentName={stats?.studentName || "Hầu Văn Hoà"} />

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
