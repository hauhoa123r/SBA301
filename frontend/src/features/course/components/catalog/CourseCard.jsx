import { BookOpenText, Clock, Play, Star } from "lucide-react";

export default function CourseCard({ course }) {
    const rating = Number(course.rating ?? 5.0);
    const totalLessons = course.totalLessons ?? 0;
    const durationText = course.durationText ?? "0m";

    return (
        <div className="group bg-brand-cardBg border border-brand-accent/10 rounded-2xl overflow-hidden hover:border-brand-accent/40 transition-all hover:shadow-xl hover:shadow-brand-accent/10 hover:-translate-y-1 cursor-pointer">
            <div className="relative overflow-hidden aspect-video">
                <img src={course.thumbnailUrl || "/images/logo-removebg-preview.png"} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                <div className="absolute inset-0 bg-gradient-to-t from-brand-cardBg/80 to-brand-transparent" />

                <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-brand-accentSoft bg-brand-accent/20 px-2.5 py-1 rounded-md border border-brand-accent/20">
                        {course.category ?? "Chưa phân loại"}
                    </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-brand-accent/90 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-brand-white fill-brand-white ml-0.5" />
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-brand-white font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-accentSoft transition-colors" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                    {course.title}
                </h3>

                <p className="text-brand-textSecondary text-xs mb-3" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                    Giảng viên: {course.instructor ?? "Đang cập nhật"}
                </p>

                <p className="line-clamp-2 min-h-10 text-sm leading-5 text-brand-textSecondary mb-4">
                    {course.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-brand-textSecondary mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-status-warning fill-status-warning" />
                        <span className="text-brand-white font-semibold">{rating.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <BookOpenText className="w-3.5 h-3.5" />
                        <span>{totalLessons} bài học</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{durationText}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
