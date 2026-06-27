import { Link } from "react-router-dom";
import { Bell, Home, Menu } from "lucide-react";
import UserProfileMenu from "../../../../shared/components/UserProfileMenu";

export default function LearnCourseHeader() {
    return (
        <header className="flex h-[68px] items-center justify-between border-b border-brand-border bg-brand-header px-5 md:px-8">
            <div className="flex items-center gap-5 text-brand-courseMuted">
                <Menu className="h-5 w-5" />
                <Link to="/courses" className="inline-flex items-center gap-2 text-lg font-semibold text-brand-courseMuted no-underline hover:text-brand-white">
                    <Home className="h-4 w-4" />
                    Khóa học
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-brand-courseMuted" />
                <UserProfileMenu variant="icon" />
            </div>
        </header>
    );
}
