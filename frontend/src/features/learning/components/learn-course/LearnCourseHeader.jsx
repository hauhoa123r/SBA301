import { Link } from "react-router-dom";
import { Bell, Home, Menu } from "lucide-react";
import UserProfileMenu from "../../../../shared/components/UserProfileMenu";

export default function LearnCourseHeader({ sidebarOpen = false, onSidebarToggle }) {
    return (
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-brand-border bg-brand-header/95 px-4 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-5 text-brand-courseMuted">
                <button
                    type="button"
                    onClick={onSidebarToggle}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-brand-border text-brand-courseMuted transition hover:border-brand-accent/60 hover:text-brand-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent lg:hidden"
                    aria-controls="learn-course-navigation"
                    aria-expanded={sidebarOpen}
                    aria-label={sidebarOpen ? "Đóng nội dung khóa học" : "Mở nội dung khóa học"}
                >
                    <Menu className="h-5 w-5" />
                </button>
                <Link to="/courses" className="hidden items-center gap-2 text-base font-semibold text-brand-courseMuted no-underline hover:text-brand-white sm:inline-flex md:text-lg">
                    <Home className="h-4 w-4" />
                    Khóa học
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    className="grid h-10 w-10 place-items-center rounded-xl text-brand-courseMuted transition hover:bg-brand-panel hover:text-brand-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                    aria-label="Thông báo học tập"
                >
                    <Bell className="h-5 w-5" />
                </button>
                <UserProfileMenu variant="icon" />
            </div>
        </header>
    );
}
