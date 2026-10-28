import { ChevronDown, GraduationCap, CheckCircle2 } from "lucide-react";
import ProgressBar from "./ProgressBar";

export default function CourseHero({ course, progress, completedCount, totalActivities, completedChapters }) {
    return <details className="workspace-overview">
        <summary><span><GraduationCap size={18} />Tổng quan khóa học</span><ChevronDown size={17} className="workspace-chevron" /></summary>
        <div className="workspace-overview-body"><h2>{course.displayTitle || course.title}</h2><p>Giảng viên: {course.teacherName || "Chưa cập nhật"}</p>
            <div className="workspace-overview-metrics"><span><strong>{completedCount}/{totalActivities}</strong> hoạt động hoàn thành</span><span><strong>{completedChapters}/{course.chapters.length}</strong> chương hoàn thành</span><span><strong>{progress}%</strong> tiến độ</span></div>
            <ProgressBar value={progress} />
            {totalActivities > 0 && completedCount === totalActivities && <p className="workspace-success" role="status"><CheckCircle2 size={17} />Bạn đã hoàn thành toàn bộ hoạt động của khóa học.</p>}
        </div>
    </details>;
}
