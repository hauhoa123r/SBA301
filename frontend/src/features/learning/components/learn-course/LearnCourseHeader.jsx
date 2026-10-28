import { Link } from "react-router-dom";
import { ArrowLeft, Focus, PanelLeft, Minimize2 } from "lucide-react";
import { UserProfileMenu } from "@/features/auth";
import { NotificationCenter } from "@/features/notifications/NotificationCenter";
import ProgressBar from "./ProgressBar";

export default function LearnCourseHeader({ course, progress, sidebarOpen, onSidebarToggle, focusMode, onFocusToggle }) {
    return <header className="workspace-topbar">
        <div className="workspace-topbar-start">
            <Link to="/learning" className="workspace-brand" aria-label="Edujar — trở về góc học tập">
                <span className="workspace-brand-mark" aria-hidden="true">学</span><strong>Edujar<span>.</span></strong>
            </Link>
            <button type="button" className="workspace-icon-button" onClick={onSidebarToggle}
                aria-controls="learn-course-navigation" aria-expanded={sidebarOpen}
                aria-label={sidebarOpen ? "Thu gọn nội dung khóa học" : "Mở nội dung khóa học"} title="Nội dung khóa học">
                <PanelLeft size={19} />
            </button>
            <div className="workspace-course-name"><span>KHÔNG GIAN HỌC TẬP</span><p title={course.title}>{course.displayTitle || course.title}</p></div>
        </div>
        <div className="workspace-topbar-actions">
            <div className="workspace-topbar-progress"><span>Tiến độ <strong>{progress}%</strong></span><ProgressBar value={progress} label="Tiến độ khóa học" /></div>
            <button type="button" className={`workspace-focus-button ${focusMode ? "is-active" : ""}`} aria-pressed={focusMode} onClick={onFocusToggle}
                aria-label={focusMode ? "Thoát chế độ tập trung" : "Bật chế độ tập trung"} title={focusMode ? "Thoát chế độ tập trung" : "Chế độ tập trung"}>
                {focusMode ? <Minimize2 size={17} /> : <Focus size={17} />}<span>{focusMode ? "Thoát tập trung" : "Tập trung"}</span>
            </button>
            <NotificationCenter />
            <UserProfileMenu variant="icon" />
            <Link className="workspace-mobile-back workspace-icon-button" to="/learning" aria-label="Về góc học tập"><ArrowLeft size={18} /></Link>
        </div>
    </header>;
}
