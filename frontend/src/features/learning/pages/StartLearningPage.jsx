import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { UserRound, Loader2 } from "lucide-react";
import LearningProfileView from "./learning-profile-view";
import MyCoursesView from "../components/start-learning/MyCoursesView";
import OverviewPanel from "../components/start-learning/OverviewPanel";
import StudyPlanView from "../components/start-learning/StudyPlanView";
import TestPracticeView from "../components/start-learning/TestPracticeView";
import { getLearningCourse } from "../service/learningMock";
import { getLearningStats } from "../api/learning-profile-api";

export default function StartLearningPage() {
    const { activeView = "overview", selectedCourseId, setSelectedCourseId, setEnrolledCourses } = useOutletContext() || {};
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
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
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-brand-accentSoft" />
                <p className="text-sm text-brand-textSecondary">Đang tải tiến trình học tập...</p>
            </div>
        );
    }

    return (
        <>
            <LearningGreeting studentName={stats?.studentName || "Hầu Văn Hoà"} />

            <div className="mt-6 space-y-6">
                {activeView === "overview" && (
                    <OverviewPanel
                        course={course}
                        totalActivities={stats?.totalActivities}
                        openLessons={stats?.openLessons}
                        firstLesson={firstLesson}
                        completedActivities={stats?.completedActivities}
                        earnedCups={stats?.earnedCups}
                        totalCups={stats?.totalCups}
                    />
                )}
                {activeView === "study-plan" && <StudyPlanView course={course} />}
                {activeView === "my-courses" && <MyCoursesView course={course} />}
                {activeView === "test-practice" && <TestPracticeView course={course} firstLesson={firstLesson} />}
                {activeView === "profile" && <LearningProfileView course={course} totalLessons={totalLessons} firstLesson={firstLesson} />}
            </div>
        </>
    );
}

function LearningGreeting({ studentName }) {
    return (
        <section className="border-b border-brand-accent/15 pb-5">
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-accent text-brand-white">
                    <UserRound className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-black md:text-3xl">Xin chào, {studentName}</h1>
                    <p className="mt-1 text-sm text-brand-textSecondary">Cùng Edujar tiến bộ mỗi ngày nào!</p>
                </div>
            </div>
        </section>
    );
}
