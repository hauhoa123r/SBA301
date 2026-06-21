import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, Search, UserRound } from "lucide-react";
import HeroFooter from "../../../shared/components/HeroFooter";
import HeroHeader from "../../../shared/components/HeroHeader";
import { COURSES } from "../../course/services/mockup";

const COURSES_PER_PAGE = 6;

export default function ViewCoursesPage() {
    const [keyword, setKeyword] = useState("");
    const [submittedKeyword, setSubmittedKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const filteredCourses = useMemo(() => {
        const searchValue = submittedKeyword.trim().toLowerCase();

        if (!searchValue) return COURSES;

        return COURSES.filter((course) =>
            [
                course.title,
                course.description,
                course.category,
                course.instructor,
                course.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(searchValue)
        );
    }, [submittedKeyword]);

    const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
    const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
    const visibleCourses = filteredCourses.slice(startIndex, startIndex + COURSES_PER_PAGE);

    const handleSearch = (event) => {
        event.preventDefault();
        setSubmittedKeyword(keyword);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    };

    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <HeroHeader />

            <main className="container mx-auto px-6 py-12">
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                            Browse Courses
                        </p>
                        <h1
                            className="text-4xl font-extrabold text-white md:text-5xl"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            View Courses
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-brand-textSecondary md:text-base">
                            Search and explore published courses with key fields from the course database table.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-3">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                            <input
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                placeholder="Search by title, category, teacher..."
                                className="h-12 w-full rounded-xl border border-brand-accent/20 bg-brand-light py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-brand-accent/60"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand-accent px-5 text-sm font-semibold text-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>
                    </form>
                </div>

                <div className="mb-5 flex items-center justify-between text-sm text-brand-textSecondary">
                    <span>
                        Showing {visibleCourses.length} of {filteredCourses.length} courses
                    </span>
                    <span>
                        Page {currentPage} / {totalPages}
                    </span>
                </div>

                {visibleCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {visibleCourses.map((course) => (
                            <article
                                key={course.id}
                                className="overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5 transition hover:-translate-y-1 hover:border-brand-accent/40"
                            >
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="p-5">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-[#a78bfa]">
                                            {course.category}
                                        </span>
                                        <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                            {course.status}
                                        </span>
                                    </div>

                                    <h2
                                        className="mb-2 min-h-14 text-lg font-bold leading-7 text-white"
                                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                    >
                                        {course.title}
                                    </h2>

                                    <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-brand-textSecondary">
                                        {course.description}
                                    </p>

                                    <div className="mb-5 grid grid-cols-2 gap-3 text-xs text-brand-textSecondary">
                                        <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                            <span className="block uppercase tracking-wider">Course ID</span>
                                            <strong className="mt-1 block text-sm text-white">#{course.id}</strong>
                                        </div>
                                        <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                            <span className="block uppercase tracking-wider">Category ID</span>
                                            <strong className="mt-1 block text-sm text-white">#{course.category_id}</strong>
                                        </div>
                                        <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                            <span className="flex items-center gap-1 uppercase tracking-wider">
                                                <UserRound className="h-3.5 w-3.5" />
                                                Teacher
                                            </span>
                                            <strong className="mt-1 block text-sm text-white">#{course.teacher_id}</strong>
                                        </div>
                                        <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                            <span className="flex items-center gap-1 uppercase tracking-wider">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                Updated
                                            </span>
                                            <strong className="mt-1 block text-sm text-white">{course.updated_at}</strong>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/30 px-4 py-3 text-sm font-semibold text-[#a78bfa] no-underline transition hover:border-brand-accent/60 hover:bg-brand-accent/10 hover:text-white"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View Detail
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary">
                        No courses found. Try another search keyword.
                    </div>
                )}

                <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${page === currentPage
                                    ? "bg-brand-accent text-white"
                                    : "border border-brand-accent/20 text-brand-textSecondary hover:border-brand-accent/60 hover:text-white"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
