import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import {
  CourseDetailError,
  CourseDetailLoading,
  useCourseDetail,
} from "@/entities/course";
import { NotFoundPage } from "@/pages/not-found";
import { CourseOverview } from "@/widgets/course-overview";

interface MainLayoutOutletContext {
  setShowChrome?: (visible: boolean) => void;
}

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const layoutContext = useOutletContext<MainLayoutOutletContext | undefined>();
  const setShowChrome = layoutContext?.setShowChrome;
  const { course, isLoading, isNotFound, isError, errorMessage } =
    useCourseDetail(id);

  useEffect(() => {
    setShowChrome?.(true);
  }, [setShowChrome]);

  if (isLoading) return <CourseDetailLoading />;
  if (isNotFound) return <NotFoundPage />;
  if (isError || !course) return <CourseDetailError message={errorMessage} />;

  return <CourseOverview course={course} />;
}

