import { useCallback, useMemo, useState } from "react";

import type { CourseCatalogItem } from "@/entities/course";

export const COURSES_PER_PAGE = 8;

export interface CourseSearchModel {
  keyword: string;
  setKeyword: (value: string) => void;
  currentPage: number;
  totalPages: number;
  filteredCourses: CourseCatalogItem[];
  visibleCourses: CourseCatalogItem[];
  hasSubmittedKeyword: boolean;
  submitSearch: () => void;
  goToPage: (page: number) => void;
  resetPage: () => void;
}

export function useCourseSearch(
  courses: CourseCatalogItem[],
  ownedCourseIds: string[],
): CourseSearchModel {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCourses = useMemo(() => {
    const searchValue = submittedKeyword.trim().toLowerCase();
    const ownedIds = new Set(ownedCourseIds);
    const availableCourses = courses.filter(
      (course) => !ownedIds.has(String(course.id)),
    );

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
        .includes(searchValue),
    );
  }, [courses, ownedCourseIds, submittedKeyword]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCourses.length / COURSES_PER_PAGE),
  );
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const visibleCourses = filteredCourses.slice(
    startIndex,
    startIndex + COURSES_PER_PAGE,
  );

  const submitSearch = useCallback((): void => {
    setSubmittedKeyword(keyword);
    setCurrentPage(1);
  }, [keyword]);

  const goToPage = useCallback((page: number): void => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }, [totalPages]);

  const resetPage = useCallback((): void => {
    setCurrentPage(1);
  }, []);

  return {
    keyword,
    setKeyword,
    currentPage,
    totalPages,
    filteredCourses,
    visibleCourses,
    hasSubmittedKeyword: Boolean(submittedKeyword),
    submitSearch,
    goToPage,
    resetPage,
  };
}
