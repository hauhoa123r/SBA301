import { Link } from "react-router-dom";
import { getChapterStats, progressSets, resumeLesson } from "../../shared/learnCourseUtils";

export default function ProfileProgress({ course }) {
    const progress = course.progress;
    const chapters = getChapterStats({ course, ...progressSets(progress) });
    const next = resumeLesson(course, progress);
    const seconds = (progress?.lessonPlayback || []).reduce((sum, item) => sum + item.watchSeconds, 0);
    const metrics = [
        ["Bài học hoàn thành", progress?.completedLessonIds.length || 0],
        ["Quiz đã đạt", progress?.passedQuizIds.length || 0],
        ["Bài tập đã nộp", progress?.submittedAssignmentIds.length || 0],
        ["Thời gian xem video", `${Math.floor(seconds / 60)} phút`],
    ];
    return <div className="mt-5 space-y-5 rounded-2xl border border-brand-border bg-brand-menu p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-black">{course.displayTitle}</h3>
            <p>{progress?.completedActivities || 0}/{progress?.totalActivities || 0} hoạt động · {progress?.progressPercent || 0}%</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-brand-border p-4">
                <p className="text-sm text-brand-textSecondary">{label}</p><p className="mt-2 text-xl font-bold">{value}</p>
            </div>)}
        </div>
        {course.chapters.map(chapter => <div key={chapter.id} className="flex justify-between gap-3 border-b border-brand-border py-2 text-sm">
            <span>{chapter.title}</span><span>{chapters[chapter.id].done}/{chapters[chapter.id].total} hoạt động</span>
        </div>)}
        {next && <Link to={`/learning/courses/${course.id}/lessons/${next.id}`} className="inline-block rounded-xl bg-brand-accent px-4 py-2 font-bold no-underline">Tiếp tục học</Link>}
    </div>;
}
