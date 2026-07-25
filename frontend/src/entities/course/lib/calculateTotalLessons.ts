import type { CourseDetail } from "../model/types";

function toSafeNumber(value: unknown): number | null {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function calculateTotalLessons(course: CourseDetail | null | undefined): number {
  const totalLessons = toSafeNumber(course?.totalLessons);
  if (totalLessons !== null) return Math.max(0, totalLessons);

  const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
  return chapters.reduce(
    (total, chapter) => total + (chapter.lessons?.length ?? 0),
    0,
  );
}

