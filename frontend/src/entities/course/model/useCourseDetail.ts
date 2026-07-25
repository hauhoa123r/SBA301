import { useEffect, useState } from "react";

import { getApiErrorStatus } from "@/shared/api";

import { getCourseById } from "../api/courseApi";
import type { CourseDetail } from "./types";

const COURSE_LOAD_ERROR_MESSAGE =
  "Không thể tải thông tin khóa học. Vui lòng thử lại sau.";

export interface CourseDetailState {
  course: CourseDetail | null;
  isLoading: boolean;
  isNotFound: boolean;
  isError: boolean;
  errorMessage: string;
}

const initialState: CourseDetailState = {
  course: null,
  isLoading: true,
  isNotFound: false,
  isError: false,
  errorMessage: "",
};

export function useCourseDetail(
  courseId: number | string | undefined,
): CourseDetailState {
  const [state, setState] = useState<CourseDetailState>(initialState);

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async (): Promise<void> => {
      setState(initialState);

      try {
        const course = await getCourseById(courseId);
        if (!isMounted) return;

        setState({
          course,
          isLoading: false,
          isNotFound: false,
          isError: false,
          errorMessage: "",
        });
      } catch (error: unknown) {
        if (!isMounted) return;

        const isNotFound = getApiErrorStatus(error) === 404;
        setState({
          course: null,
          isLoading: false,
          isNotFound,
          isError: !isNotFound,
          errorMessage: isNotFound ? "" : COURSE_LOAD_ERROR_MESSAGE,
        });
      }
    };

    void fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  return state;
}

