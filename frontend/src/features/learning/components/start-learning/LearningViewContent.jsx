import { UserReveal } from "@/shared/ui";
import LearningProfileView from "../../pages/learning-profile-view";
import MyCoursesView from "./MyCoursesView";
import OverviewPanel from "./OverviewPanel";
import StudyPlanView from "./StudyPlanView";
import TestPracticeView from "./TestPracticeView";

export default function LearningViewContent({ activeView, course, stats, isRefreshing }) {
    const totalLessons = course.chapters.reduce(
        (total, chapter) => total + chapter.lessons.length,
        0,
    );
    const firstLesson = course.chapters[0]?.lessons[0];

    return (
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
                    isRefreshing={isRefreshing}
                />
            )}
            {activeView === "study-plan" && <StudyPlanView course={course} />}
            {activeView === "my-courses" && <MyCoursesView course={course} />}
            {activeView === "test-practice" && (
                <TestPracticeView course={course} firstLesson={firstLesson} />
            )}
            {activeView === "profile" && (
                <LearningProfileView
                    course={course}
                    totalLessons={totalLessons}
                    firstLesson={firstLesson}
                    stats={stats}
                />
            )}
        </UserReveal>
    );
}
