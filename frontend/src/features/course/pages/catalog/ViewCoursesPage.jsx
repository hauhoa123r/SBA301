import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CourseList from "../../components/catalog/CourseList";
import CourseSearchSection from "../../components/catalog/CourseSearchSection";
import { getCourses } from "../../services/api/courseService";
import UserReveal from "../../../../shared/components/animation/UserReveal";
import useAuth from "../../../../app/provider/useAuth";
import { hasRole } from "../../../../shared/utils/roles";
import { getLearningStats } from "../../../learning/api/learning-profile-api";

const COURSES_PER_PAGE = 8;

export default function ViewCoursesPage() {
    const { user } = useAuth();
    const [keyword, setKeyword] = useState("");
    const [submittedKeyword, setSubmittedKeyword] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [courses, setCourses] = useState([]);
    const [ownedCourseIds, setOwnedCourseIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const isStudent = hasRole(user, "STUDENT");
                const [data, learningStats] = await Promise.all([
                    getCourses(),
                    isStudent ? getLearningStats() : Promise.resolve(null),
                ]);

                if (isMounted) {
                    setCourses(data);
                    setOwnedCourseIds(
                        Array.isArray(learningStats?.enrolledCourses)
                            ? learningStats.enrolledCourses.map((course) => String(course.id))
                            : []
                    );
                    setCurrentPage(1);
                    setErrorMessage("");
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error.response?.data?.message || "Không thể tải danh sách khóa học từ máy chủ.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCourses();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const filteredCourses = useMemo(() => {
        const searchValue = submittedKeyword.trim().toLowerCase();
        const ownedIds = new Set(ownedCourseIds);
        const availableCourses = courses.filter((course) => !ownedIds.has(String(course.id)));

        if (!searchValue) return availableCourses;

        return availableCourses.filter((course) =>
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
    }, [courses, ownedCourseIds, submittedKeyword]);

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
        <section className="user-ui-scope container mx-auto px-4 py-10 text-brand-textPrimary sm:px-6 sm:py-12" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                <CourseSearchSection keyword={keyword} onKeywordChange={setKeyword} onSearch={handleSearch} />

                <UserReveal as="div" className="mb-5 flex flex-col gap-1 text-sm text-brand-textSecondary sm:flex-row sm:items-center sm:justify-between" distance={14} duration={480}>
                    <span>
                        Hiển thị {visibleCourses.length} / {filteredCourses.length} khóa học
                    </span>
                    <span>
                        Trang {currentPage} / {totalPages}
                    </span>
                </UserReveal>

                {errorMessage ? (
                    <div role="alert" className="rounded-2xl border border-status-danger/20 bg-status-danger/10 p-6 text-sm font-semibold text-status-danger">
                        {errorMessage}
                    </div>
                ) : (
                    <CourseList
                        courses={visibleCourses}
                        isLoading={isLoading}
                        emptyMessage={
                            !submittedKeyword && courses.length > 0 && ownedCourseIds.length > 0
                                ? "Bạn đã sở hữu tất cả khóa học hiện có."
                                : undefined
                        }
                    />
                )}

                <UserReveal as="nav" aria-label="Phân trang khóa học" className="mt-10 overflow-x-auto pb-1" distance={14} duration={480}>
                    <div className="mx-auto flex w-max min-w-full items-center justify-center gap-2 sm:gap-3">
                        <button type="button" aria-label="Trang trước" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-40">
                            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                            <button key={page} type="button" aria-label={`Đến trang ${page}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => goToPage(page)} className={`h-10 w-10 shrink-0 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft ${page === currentPage ? "bg-brand-accent text-brand-white" : "border border-brand-accent/20 text-brand-textSecondary hover:border-brand-accent/60 hover:text-brand-white"}`}>
                                {page}
                            </button>
                        ))}

                        <button type="button" aria-label="Trang sau" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-40">
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </div>
                </UserReveal>
        </section>
    );
}
