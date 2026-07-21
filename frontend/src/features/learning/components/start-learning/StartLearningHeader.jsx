import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, Flame, LayoutGrid, Menu } from "lucide-react";
import HeroLogo from "../../../../shared/components/HeroLogo";
import UserProfileMenu from "../../../../shared/components/UserProfileMenu";

export default function StartLearningHeader({
    selectedCourseId,
    setSelectedCourseId,
    enrolledCourses = [],
    sidebarOpen = false,
    onSidebarToggle,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const selectedCourse = enrolledCourses.find((c) => c.id === selectedCourseId) || enrolledCourses[0];

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-accent/20 bg-brand-dark/95 px-4 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
                <button
                    type="button"
                    onClick={onSidebarToggle}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-accent/20 bg-brand-light text-brand-accentPale transition hover:border-brand-accent/50 hover:text-brand-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent lg:hidden"
                    aria-controls="start-learning-navigation"
                    aria-expanded={sidebarOpen}
                    aria-label={sidebarOpen ? "Đóng menu học tập" : "Mở menu học tập"}
                >
                    <Menu className="h-5 w-5" />
                </button>
                <Link to="/" className="shrink-0 no-underline">
                    <HeroLogo />
                </Link>
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="hidden min-w-0 items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-light px-4 py-2 text-sm font-medium text-brand-textMutedLight md:inline-flex hover:border-brand-accentSoft/50 transition-all duration-200"
                        aria-expanded={isOpen}
                        aria-controls="learning-course-picker"
                        aria-label="Chọn chương trình học"
                    >
                        <LayoutGrid className="h-4 w-4 text-brand-accentSoft" />
                        <span className="truncate">Chương trình bạn chọn:</span>
                        <span className="font-bold text-brand-accentSoft">
                            {selectedCourse ? selectedCourse.title : enrolledCourses.length ? "Đang tải..." : "Chưa có khóa học"}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-brand-textSecondary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && enrolledCourses.length > 0 && (
                        <div id="learning-course-picker" className="absolute left-0 mt-2 w-64 rounded-xl border border-brand-accent/25 bg-brand-dark/95 backdrop-blur-xl py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {enrolledCourses.map((course) => (
                                <button
                                    key={course.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCourseId(course.id);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors duration-150 ${
                                        selectedCourse?.id === course.id
                                            ? "bg-brand-accent/15 text-brand-accentSoft font-semibold"
                                            : "text-brand-textSecondary hover:bg-brand-light hover:text-brand-white"
                                    }`}
                                >
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-status-warning/20 bg-status-warning/10 px-3 py-2 text-sm font-bold text-status-warningSoft sm:flex">
                    <Flame className="h-4 w-4" />
                    0
                </div>
                <button
                    type="button"
                    className="relative grid h-10 w-10 place-items-center rounded-xl border border-brand-accent/20 bg-brand-light text-brand-textMutedLight transition hover:border-brand-accent/50 hover:text-brand-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
                    aria-label="Thông báo, hiện có 0 thông báo mới"
                >
                    <Bell className="h-4 w-4" />
                    <span aria-hidden="true" className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-status-danger px-1 text-[11px] font-black text-brand-white">0</span>
                </button>
                <UserProfileMenu variant="icon" />
            </div>
        </header>
    );
}
