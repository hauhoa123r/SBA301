import { Link } from "react-router-dom";
import { Bell, ChevronDown, Flame, LayoutGrid, Menu } from "lucide-react";
import Logo from "../../../../shared/components/logo";
import UserProfileMenu from "../../../../shared/components/UserProfileMenu";

export default function StartLearningHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#7c3aed]/20 bg-[#090514]/95 px-4 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-4">
                <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#7c3aed]/20 bg-[#160e2e] text-[#c4b5fd]">
                    <Menu className="h-5 w-5" />
                </button>
                <Link to="/" className="shrink-0 no-underline">
                    <Logo />
                </Link>
                <button type="button" className="hidden min-w-0 items-center gap-2 rounded-full border border-[#7c3aed]/25 bg-[#160e2e] px-4 py-2 text-sm font-medium text-[#cbd5e1] md:inline-flex">
                    <LayoutGrid className="h-4 w-4 text-[#a78bfa]" />
                    <span className="truncate">Chương trình bạn chọn:</span>
                    <span className="font-bold text-[#a78bfa]">HSK 3</span>
                    <ChevronDown className="h-4 w-4 text-[#94a3b8]" />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm font-bold text-amber-300 sm:flex">
                    <Flame className="h-4 w-4" />
                    0
                </div>
                <button type="button" className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#7c3aed]/20 bg-[#160e2e] text-[#cbd5e1]">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white">0</span>
                </button>
                <UserProfileMenu variant="icon" />
            </div>
        </header>
    );
}
