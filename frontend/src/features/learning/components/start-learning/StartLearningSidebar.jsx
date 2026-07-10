import { Link } from "react-router-dom";
import { BarChart3, ClipboardList, Home, LogOut, PlaySquare, Route } from "lucide-react";

const navItems = [
    { view: "overview", to: "/learning", icon: Home, label: "Tổng quan" },
    { view: "study-plan", to: "/learning#study-plan", icon: Route, label: "Kế hoạch học" },
    { view: "my-courses", to: "/learning#my-courses", icon: PlaySquare, label: "Khóa học của tôi" },
    { view: "test-practice", to: "/learning#test-practice", icon: ClipboardList, label: "Luyện kiểm tra" },
    { view: "profile", to: "/learning#profile", icon: BarChart3, label: "Hồ sơ học tập" },
];

export default function StartLearningSidebar({ activeView }) {
    return (
        <aside className="learning-start-sidebar group/sidebar hidden w-full overflow-x-hidden border-r border-brand-accent/15 bg-brand-sidebar px-3 py-5 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <StartNavItem key={item.view} {...item} active={activeView === item.view} />
                ))}
            </nav>
            <Link to="/" className="mt-8 flex h-12 items-center gap-3 overflow-hidden rounded-xl border border-brand-accent/20 bg-brand-light px-3 text-sm font-semibold text-brand-textMutedLight no-underline transition hover:border-brand-accent/50 hover:text-brand-white">
                <span className="grid h-9 w-9 shrink-0 place-items-center">
                    <LogOut className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                    Trở về trang chủ
                </span>
            </Link>
        </aside>
    );
}

function StartNavItem({ to, icon: Icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex h-12 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-left text-sm font-bold no-underline transition ${
                active
                    ? "bg-brand-accent text-brand-white shadow-lg shadow-brand-accent/20"
                    : "text-brand-textSecondary hover:bg-brand-light hover:text-brand-white"
            }`}
        >
            <span className="grid h-9 w-9 shrink-0 place-items-center">
                <Icon className="h-5 w-5" />
            </span>
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100">
                {label}
            </span>
        </Link>
    );
}
