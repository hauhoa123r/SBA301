import { Link } from "react-router-dom";
import { Bell, ChevronDown, Flame, LayoutGrid, Menu } from "lucide-react";
import Logo from "../../../../shared/components/logo";
import UserProfileMenu from "../../../../shared/components/UserProfileMenu";

export default function StartLearningHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-accent/20 bg-brand-dark/95 px-4 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
                <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand-accent/20 bg-brand-light text-brand-accentPale">
                    <Menu className="h-5 w-5" />
                </button>
                <Link to="/" className="shrink-0 no-underline">
                    <Logo />
                </Link>
                <button type="button" className="hidden min-w-0 items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-light px-4 py-2 text-sm font-medium text-brand-textMutedLight md:inline-flex">
                    <LayoutGrid className="h-4 w-4 text-brand-accentSoft" />
                    <span className="truncate">Chương trình bạn chọn:</span>
                    <span className="font-bold text-brand-accentSoft">HSK 3</span>
                    <ChevronDown className="h-4 w-4 text-brand-textSecondary" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-status-warning/20 bg-status-warning/10 px-3 py-2 text-sm font-bold text-status-warningSoft sm:flex">
                    <Flame className="h-4 w-4" />
                    0
                </div>
                <button type="button" className="relative grid h-10 w-10 place-items-center rounded-xl border border-brand-accent/20 bg-brand-light text-brand-textMutedLight">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-status-danger px-1 text-[11px] font-black text-brand-white">0</span>
                </button>
                <UserProfileMenu variant="icon" />
            </div>
        </header>
    );
}
