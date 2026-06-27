import { useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import LearningProfileView from "../../learning-profile/pages/learning-profile-view";
import MyCoursesView from "../components/start-learning/MyCoursesView";
import OverviewPanel from "../components/start-learning/OverviewPanel";
import StartLearningHeader from "../components/start-learning/StartLearningHeader";
import StartLearningSidebar from "../components/start-learning/StartLearningSidebar";
import StudyPlanView from "../components/start-learning/StudyPlanView";
import TestPracticeView from "../components/start-learning/TestPracticeView";
import { getLearningCourse } from "../service/learningMock";

const studentName = "Hậu Văn Hoà";

export default function StartLearningPage() {
    const { hash } = useLocation();
    const course = getLearningCourse(1);
    const totalLessons = course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const totalActivities = course.chapters.reduce((total, chapter) => total + chapter.lessons.length * 2 + 1, 0);
    const firstLesson = course.chapters[0].lessons[0];
    const activeView = hash.replace("#", "") || "overview";

    return (
        <div className="min-h-screen bg-[#07030f] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <StartLearningHeader />

            <div className="group/page grid transition-[grid-template-columns] duration-300 ease-out lg:grid-cols-[80px_1fr] lg:has-[.learning-start-sidebar:hover]:grid-cols-[260px_1fr]">
                <StartLearningSidebar activeView={activeView} />

                <main className="start-learning-surface min-w-0 px-4 py-6 md:px-7 xl:px-9">
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
                </main>
            </div>
        </div>
    );
}

function LearningGreeting() {
    return (
        <section className="border-b border-[#7c3aed]/15 pb-5">
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#7c3aed] text-white">
                    <UserRound className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-black md:text-3xl">Xin chào, {studentName}</h1>
                    <p className="mt-1 text-sm text-[#94a3b8]">Cùng Edujar tiến bộ mỗi ngày nào!</p>
                </div>
            </div>
        </section>
    );
}
