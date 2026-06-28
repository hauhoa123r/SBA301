import { Search } from "lucide-react";

export default function CourseSearchSection({ keyword, onKeywordChange, onSearch }) {
    return (
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                    Browse Courses
                </p>
                <h1
                    className="text-4xl font-extrabold text-brand-white md:text-5xl"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                    View Courses
                </h1>
                <p className="mt-3 text-sm leading-6 text-brand-textSecondary md:text-base">
                    Search and explore published courses with key fields from the course database table.
                </p>
            </div>

            <form onSubmit={onSearch} className="flex w-full max-w-xl gap-3">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                    <input
                        value={keyword}
                        onChange={(event) => onKeywordChange(event.target.value)}
                        placeholder="Search by title, category, teacher..."
                        className="h-12 w-full rounded-xl border border-brand-accent/20 bg-brand-light py-3 pl-11 pr-4 text-sm text-brand-white outline-none transition focus:border-brand-accent/60"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-accent px-5 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover"
                >
                    <Search className="h-4 w-4" />
                    Search
                </button>
            </form>
        </div>
    );
}
