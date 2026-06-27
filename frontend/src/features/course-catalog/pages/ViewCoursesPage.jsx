import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COURSES } from "../../course/services/mockup";
import CourseList from "../components/CourseList";
import CourseSearchSection from "../components/CourseSearchSection";

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
        <section className="container mx-auto px-6 py-12 text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
                <CourseSearchSection
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    onSearch={handleSearch}
                />

                <div className="mb-5 flex items-center justify-between text-sm text-brand-textSecondary">
                    <span>
                        Showing {visibleCourses.length} of {filteredCourses.length} courses
                    </span>
                    <span>
                        Page {currentPage} / {totalPages}
                    </span>
                </div>

                <CourseList courses={visibleCourses} />

                <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-brand-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                            key={page}
                            type="button"
                            onClick={() => goToPage(page)}
                            className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${page === currentPage
                                    ? "bg-brand-accent text-brand-white"
                                    : "border border-brand-accent/20 text-brand-textSecondary hover:border-brand-accent/60 hover:text-brand-white"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        type="button"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-brand-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
        </section>
    );
}
