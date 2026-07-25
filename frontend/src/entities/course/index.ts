export { getCourseById, getCourses } from "./api/courseApi";
export { calculateTotalLessons } from "./lib/calculateTotalLessons";
export { BADGE_COLORS, type CourseBadge } from "./model/courseBadges";
export { courseChapters } from "./model/courseDetailData";
export type {
  Chapter,
  CourseCatalogItem,
  CourseDetail,
  Lesson,
} from "./model/types";
export { useCourseDetail, type CourseDetailState } from "./model/useCourseDetail";
export { CourseCard, type CourseCardProps } from "./ui/CourseCard";
export { CourseContent, type CourseContentProps } from "./ui/CourseContent";
export { CourseDetailError, type CourseDetailErrorProps } from "./ui/CourseDetailError";
export { CourseDetailLoading } from "./ui/CourseDetailLoading";
export { CourseHeader, type CourseHeaderProps } from "./ui/CourseHeader";

