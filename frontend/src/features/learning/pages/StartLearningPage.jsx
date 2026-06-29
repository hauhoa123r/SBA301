import { useOutletContext } from "react-router-dom";
import { UserRound } from "lucide-react";
import LearningProfileView from "./learning-profile-view";
import MyCoursesView from "../components/start-learning/MyCoursesView";
import OverviewPanel from "../components/start-learning/OverviewPanel";
import StudyPlanView from "../components/start-learning/StudyPlanView";
import TestPracticeView from "../components/start-learning/TestPracticeView";
import { getLearningCourse } from "../service/learningMock";

const studentName = "Hầu Văn Hoà";

export default function StartLearningPage() {
    const { activeView = "overview" } = useOutletContext() || {};
    const course = getLearningCourse(1);
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const totalActivities = course.chapters.reduce((total, chapter) => total + chapter.lessons.length * 2 + 1, 0);
    const firstLesson = course.chapters[0].lessons[0];

    return (
        <>
            <LearningGreeting />

            <div className="mt-6 space-y-6">
                {activeView === "overview" && (
                    <OverviewPanel
                        course={course}
                        totalActivities={totalActivities}
                        totalLessons={totalLessons}
                        firstLesson={firstLesson}
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

function LearningGreeting() {
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
