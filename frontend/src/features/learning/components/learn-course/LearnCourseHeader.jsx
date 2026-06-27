import { Link } from "react-router-dom";
import { Bell, Home, Menu } from "lucide-react";
import UserProfileMenu from "../../../../shared/components/UserProfileMenu";

export default function LearnCourseHeader() {
    return (
        <header className="flex h-[68px] items-center justify-between border-b border-[#2b1852] bg-[#140a28] px-5 md:px-8">
            <div className="flex items-center gap-5 text-[#a7b0c7]">
                <Menu className="h-5 w-5" />
                <Link to="/courses" className="inline-flex items-center gap-2 text-lg font-semibold text-[#a7b0c7] no-underline hover:text-white">
                    <Home className="h-4 w-4" />
                    Khóa học
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <Bell className="h-5 w-5 text-[#a7b0c7]" />
                <UserProfileMenu variant="icon" />
            </div>
        </header>
    );
}
