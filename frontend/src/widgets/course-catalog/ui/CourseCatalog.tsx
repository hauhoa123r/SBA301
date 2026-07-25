import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { getCourses, type CourseCatalogItem } from "@/entities/course";
import { hasRole } from "@/entities/user";
import { useAuth } from "@/features/auth";
import { CourseSearchSection, useCourseSearch } from "@/features/course-search";
import { getEnrollmentStats } from "@/features/enrollment";
import { getApiErrorMessage } from "@/shared/api";
import { UserReveal } from "@/shared/ui";

import { CourseList } from "./CourseList";

export function CourseCatalog() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseCatalogItem[]>([]);
  const [ownedCourseIds, setOwnedCourseIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const search = useCourseSearch(courses, ownedCourseIds);
  const resetSearchPage = search.resetPage;

  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const isStudent = hasRole(user, "STUDENT");
        const enrollmentPromise = isStudent
          ? getEnrollmentStats()
          : Promise.resolve(null);
        const [data, enrollmentStats] = await Promise.all([
          getCourses(),
          enrollmentPromise,
        ]);

        if (isMounted) {
          setCourses(data);
          setOwnedCourseIds(
            Array.isArray(enrollmentStats?.enrolledCourses)
              ? enrollmentStats.enrolledCourses.map((course) => String(course.id))
              : [],
          );
          resetSearchPage();
          setErrorMessage("");
        }
      } catch (error: unknown) {
        if (isMounted) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "Không thể tải danh sách khóa học từ máy chủ.",
            ),
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void fetchCourses();

    return () => {
      isMounted = false;
    };
  }, [resetSearchPage, user]);

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    search.submitSearch();
  };

  return (
    <section
      className="user-ui-scope container mx-auto px-4 py-10 text-brand-textPrimary sm:px-6 sm:py-12"
      style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
    >
      <CourseSearchSection
        keyword={search.keyword}
        onKeywordChange={search.setKeyword}
        onSearch={handleSearch}
      />

      <UserReveal
        as="div"
        className="mb-5 flex flex-col gap-1 text-sm text-brand-textSecondary sm:flex-row sm:items-center sm:justify-between"
        distance={14}
        duration={480}
      >
        <span>
          Hiển thị {search.visibleCourses.length} / {search.filteredCourses.length} khóa học
        </span>
        <span>
          Trang {search.currentPage} / {search.totalPages}
        </span>
      </UserReveal>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-2xl border border-status-danger/20 bg-status-danger/10 p-6 text-sm font-semibold text-status-danger"
        >
          {errorMessage}
        </div>
      ) : (
        <CourseList
          courses={search.visibleCourses}
          isLoading={isLoading}
          emptyMessage={
            !search.hasSubmittedKeyword &&
            courses.length > 0 &&
            ownedCourseIds.length > 0
              ? "Bạn đã sở hữu tất cả khóa học hiện có."
              : undefined
          }
        />
      )}

      <UserReveal
        as="nav"
        aria-label="Phân trang khóa học"
        className="mt-10 overflow-x-auto pb-1"
        distance={14}
        duration={480}
      >
        <div className="mx-auto flex w-max min-w-full items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Trang trước"
            onClick={() => search.goToPage(search.currentPage - 1)}
            disabled={search.currentPage === 1}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {Array.from(
            { length: search.totalPages },
            (_, index) => index + 1,
          ).map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`Đến trang ${page}`}
              aria-current={page === search.currentPage ? "page" : undefined}
              onClick={() => search.goToPage(page)}
              className={`h-10 w-10 shrink-0 rounded-xl text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft ${
                page === search.currentPage
                  ? "bg-brand-accent text-brand-white"
                  : "border border-brand-accent/20 text-brand-textSecondary hover:border-brand-accent/60 hover:text-brand-white"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            aria-label="Trang sau"
            onClick={() => search.goToPage(search.currentPage + 1)}
            disabled={search.currentPage === search.totalPages}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-accent/20 text-brand-textSecondary transition hover:border-brand-accent/60 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </UserReveal>
    </section>
  );
}
