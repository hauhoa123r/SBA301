import { Link } from "react-router-dom";
import { BarChart3, ClipboardList, Home, LogOut, PlaySquare, Route } from "lucide-react";

const navItems = [
    { view: "overview", to: "/learning", icon: Home, label: "Overview" },
    { view: "study-plan", to: "/learning#study-plan", icon: Route, label: "Study plan" },
    { view: "my-courses", to: "/learning#my-courses", icon: PlaySquare, label: "My courses" },
    { view: "test-practice", to: "/learning#test-practice", icon: ClipboardList, label: "Test Practice" },
    { view: "profile", to: "/learning#profile", icon: BarChart3, label: "Learning Profile" },
];

export default function StartLearningSidebar({ activeView }) {
    return (
        <aside className="learning-start-sidebar group/sidebar hidden w-full overflow-x-hidden border-r border-[#7c3aed]/15 bg-[#0d0718] px-3 py-5 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <nav className="space-y-2">
                {navItems.map((item) => (
                    <StartNavItem key={item.view} {...item} active={activeView === item.view} />
                ))}
            </nav>
            <Link to="/" className="mt-8 flex h-12 items-center gap-3 overflow-hidden rounded-xl border border-[#7c3aed]/20 bg-[#160e2e] px-3 text-sm font-semibold text-[#cbd5e1] no-underline transition hover:border-[#7c3aed]/50 hover:text-white">
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
                    ? "bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/20"
                    : "text-[#94a3b8] hover:bg-[#160e2e] hover:text-white"
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
