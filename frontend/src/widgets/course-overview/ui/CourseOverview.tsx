import { calculateTotalLessons, CourseContent, CourseHeader, type CourseDetail } from "@/entities/course";
import { CoursePurchaseCard } from "@/features/enrollment";

export interface CourseOverviewProps { course: CourseDetail; }

export function CourseOverview({ course }: CourseOverviewProps) {
  const totalLessons = calculateTotalLessons(course);
  return (
    <div className="user-ui-scope text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
      <section aria-labelledby="course-detail-title" className="relative mx-auto grid max-w-[1500px] gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
        <section className="min-w-0">
          <CourseHeader course={course} />
          <CourseContent key={course.id} chapters={course.chapters} courseDuration={course.duration} totalLessons={totalLessons} />
        </section>
        <CoursePurchaseCard course={course} totalLessons={totalLessons} />
      </section>
    </div>
  );
}
