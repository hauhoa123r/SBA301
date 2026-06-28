import { BarChart2, Clock, Play, Star } from "lucide-react";
import { BADGE_COLORS } from "../services/mockup";

export default function CourseCard({ course }) {
    const fmt = (n) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(n);

    return (
        <div className="group bg-brand-cardBg border border-brand-accent/10 rounded-2xl overflow-hidden hover:border-brand-accent/40 transition-all hover:shadow-xl hover:shadow-brand-accent/10 hover:-translate-y-1 cursor-pointer">
            <div className="relative overflow-hidden aspect-video">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-brand-cardBg/80 to-brand-transparent" />

                <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-brand-accentSoft bg-brand-accent/20 px-2.5 py-1 rounded-md border border-brand-accent/20">
                        {course.category}
                    </span>
                </div>

                {course.badge && (
                    <div className="absolute top-3 right-3">
                        <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${BADGE_COLORS[course.badge]
                                }`}
                        >
                            {course.badge}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-brand-accent/90 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 text-brand-white fill-brand-white ml-0.5" />
                    </div>
                </div>
            </div>

            <div className="p-5">
                <h3
                    className="text-brand-white font-semibold text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-accentSoft transition-colors"
                    style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                >
                    {course.title}
                </h3>

                <p
                    className="text-brand-textSecondary text-xs mb-3"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                    }}
                >
                    by {course.instructor}
                </p>

                <div className="flex items-center gap-3 text-xs text-brand-textSecondary mb-4">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-status-warning fill-status-warning" />
                        <span className="text-brand-white font-semibold">
                            {course.rating}
                        </span>
                        <span>
                            ({(course.students / 1000).toFixed(1)}k)
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>{course.level}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span
                        className="text-lg font-bold text-brand-white"
                        style={{
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                        }}
                    >
                        {fmt(course.price)}
                    </span>

                    <button className="text-xs text-brand-accentSoft hover:text-brand-white border border-brand-accent/30 hover:border-brand-accent/60 hover:bg-brand-accent/10 px-3 py-1.5 rounded-lg transition-all">
                        Enroll
                    </button>
                </div>
            </div>
        </div>
    );
}
