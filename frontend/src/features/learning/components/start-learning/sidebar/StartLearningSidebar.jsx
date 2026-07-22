import { Link } from "react-router-dom";
import { BarChart3, ClipboardList, Home, LogOut, PlaySquare, Route, X } from "lucide-react";

const navItems = [
    { view: "overview", to: "/learning", icon: Home, label: "Tổng quan" },
    { view: "study-plan", to: "/learning#study-plan", icon: Route, label: "Kế hoạch học" },
    { view: "my-courses", to: "/learning#my-courses", icon: PlaySquare, label: "Khóa học của tôi" },
    { view: "test-practice", to: "/learning#test-practice", icon: ClipboardList, label: "Luyện kiểm tra" },
    { view: "profile", to: "/learning#profile", icon: BarChart3, label: "Hồ sơ học tập" },
];

export default function StartLearningSidebar({ activeView, open = false, onClose }) {
    return (
        <>
            {open && (
                <button
                    type="button"
                    className="fixed inset-x-0 bottom-0 top-16 z-30 bg-brand-black/60 backdrop-blur-[2px] lg:hidden"
                    onClick={onClose}
                    aria-label="Đóng menu học tập"
                />
            )}

            <aside
                id="start-learning-navigation"
                aria-label="Điều hướng khu vực học tập"
                className={`learning-start-sidebar group/sidebar fixed bottom-0 left-0 top-16 z-40 w-[min(20rem,calc(100vw-3rem))] overflow-x-hidden overflow-y-auto border-r border-brand-accent/15 bg-brand-sidebar px-3 py-5 shadow-2xl shadow-brand-black/30 transition-[transform,visibility] duration-300 ${
                    open ? "visible translate-x-0" : "invisible -translate-x-full"
                } lg:visible lg:sticky lg:top-16 lg:z-auto lg:h-[calc(100vh-4rem)] lg:w-full lg:translate-x-0 lg:overflow-y-auto lg:shadow-none`}
            >
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-brand-accent/15 pb-4 lg:hidden">
                    <p className="text-sm font-black text-brand-white">Điều hướng học tập</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/50 hover:text-brand-white"
                        aria-label="Đóng menu học tập"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <StartNavItem key={item.view} {...item} active={activeView === item.view} onNavigate={onClose} />
                    ))}
                </nav>
                <Link
                    to="/"
                    onClick={onClose}
                    className="mt-8 flex h-12 items-center gap-3 overflow-hidden rounded-xl border border-brand-accent/20 bg-brand-light px-3 text-sm font-semibold text-brand-textMutedLight no-underline transition hover:border-brand-accent/50 hover:text-brand-white"
                >
                    <span className="grid h-9 w-9 shrink-0 place-items-center">
                        <LogOut className="h-4 w-4" />
                    </span>
                    <span className="whitespace-nowrap opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover/sidebar:opacity-100">
                        Trở về trang chủ
                    </span>
                </Link>
            </aside>
        </>
    );
}

function StartNavItem({ to, icon: Icon, label, active, onNavigate }) {
    return (
        <Link
            to={to}
            onClick={onNavigate}
            className={`flex h-12 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-left text-sm font-bold no-underline transition ${
                active
                    ? "bg-brand-accent text-brand-white shadow-lg shadow-brand-accent/20"
                    : "text-brand-textSecondary hover:bg-brand-light hover:text-brand-white"
            }`}
        >
            <span className="grid h-9 w-9 shrink-0 place-items-center">
                <Icon className="h-5 w-5" />
            </span>
            <span className="whitespace-nowrap opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover/sidebar:opacity-100">
                {label}
            </span>
        </Link>
    );
}
