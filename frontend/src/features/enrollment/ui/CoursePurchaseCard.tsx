import { BookOpen, Clock3, Library, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CourseDetail } from "@/entities/course";
import { useSubscription } from "@/features/subscription/useSubscription";
import { UserImage, UserReveal } from "@/shared/ui";

export interface CoursePurchaseCardProps { course: CourseDetail; totalLessons: number; }

export function CoursePurchaseCard({ course, totalLessons }: CoursePurchaseCardProps) {
  const { status, loading, error } = useSubscription();
  const accessible = status?.active || (course.id !== undefined && status?.legacyCourseIds.includes(course.id));
  return (
    <UserReveal as="aside" className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
      <div className="overflow-hidden rounded-3xl border border-brand-accent/20 bg-brand-cardBg shadow-xl">
        <UserImage src={course.thumbnailUrl} alt={course.title || "Khóa học"} className="aspect-video w-full object-cover" />
        <div className="p-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-brand-accentSoft"><Library size={18} /> Học cùng gói đăng ký</span>
          <h2 className="mt-3 text-2xl font-black text-brand-white">Một gói, mọi khóa học</h2>
          <p className="mt-3 text-sm leading-7 text-brand-textSecondary">Truy cập khóa học này và toàn bộ thư viện trong thời hạn gói. Chọn Free Trial, Standard hoặc Premium để bắt đầu.</p>
          {error && <p role="alert" className="mt-3 text-sm text-status-danger">{error}</p>}
          {loading ? <p role="status" className="mt-5 text-sm text-brand-textSecondary">Đang kiểm tra quyền học…</p> : <Link to={accessible ? `/learning/courses/${course.id}` : "/subscriptions"} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 font-bold text-white hover:bg-brand-accentHover">{accessible ? "Vào học ngay" : "Chọn gói / Học thử"}<ArrowRight size={18} /></Link>}
          <ul className="mt-6 space-y-4 border-t border-brand-border pt-6 text-sm text-brand-textSecondary">
            <li className="flex gap-3"><BookOpen size={18} /> {totalLessons} bài học</li>
            <li className="flex gap-3"><Clock3 size={18} /> Thời lượng {course.duration}</li>
            <li>Lưu tiến độ để tiếp tục học khi quay lại.</li>
          </ul>
        </div>
      </div>
    </UserReveal>
  );
}
