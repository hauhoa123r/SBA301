import { Search } from "lucide-react";
import UserReveal from "../../../../shared/components/animation/UserReveal";

export default function CourseSearchSection({ keyword, onKeywordChange, onSearch }) {
    return (
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <UserReveal as="div" className="max-w-2xl" distance={20} duration={560}>
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                    Khám phá khóa học
                </p>
                <h1 className="text-4xl font-extrabold text-brand-white md:text-5xl" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                    Danh sách khóa học
                </h1>
                <p className="mt-3 text-sm leading-6 text-brand-textSecondary md:text-base">
                    Tìm kiếm và khám phá các khóa học đã xuất bản theo tên, danh mục hoặc giảng viên.
                </p>
            </UserReveal>

            <UserReveal as="form" onSubmit={onSearch} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row" delay={70} distance={20} duration={560} role="search">
                <div className="relative flex-1">
                    <label htmlFor="course-search" className="sr-only">Tìm khóa học theo tên, danh mục hoặc giảng viên</label>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" aria-hidden="true" />
                    <input id="course-search" type="search" value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="Tìm theo tên, danh mục, giảng viên..." className="h-12 w-full rounded-xl border border-brand-accent/20 bg-brand-light py-3 pl-11 pr-4 text-sm text-brand-white outline-none transition focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30" />
                </div>
                <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark sm:w-auto">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Tìm kiếm
                </button>
            </UserReveal>
        </div>
    );
}
