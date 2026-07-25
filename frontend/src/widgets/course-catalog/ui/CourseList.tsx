import type { CourseCatalogItem } from "@/entities/course";
import { CourseCard } from "@/entities/course";
import { UserStagger } from "@/shared/ui";

export interface CourseListProps {
  courses: CourseCatalogItem[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function CourseList({
  courses,
  isLoading = false,
  emptyMessage = "Không tìm thấy khóa học nào. Hãy thử từ khóa khác.",
}: CourseListProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary"
      >
        Đang tải khóa học...
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <UserStagger
      as="div"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      itemClassName="h-full"
      step={65}
      distance={22}
    >
      {courses.map((course, index) => (
        <CourseCard key={course.id ?? `course-${index}`} course={course} />
      ))}
    </UserStagger>
  );
}

