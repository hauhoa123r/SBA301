import { Link } from "react-router-dom";
import { CalendarDays, Eye, UserRound } from "lucide-react";

export default function CourseList({ courses }) {
    if (courses.length === 0) {
        return (
            <div className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-10 text-center text-brand-textSecondary">
                No courses found. Try another search keyword.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
                <article
                    key={course.id}
                    className="overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5 transition hover:-translate-y-1 hover:border-brand-accent/40"
                >
                    <div className="aspect-video overflow-hidden">
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-[#a78bfa]">
                                {course.category}
                            </span>
                            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                {course.status}
                            </span>
                        </div>

                        <h2
                            className="mb-2 min-h-14 text-lg font-bold leading-7 text-white"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            {course.title}
                        </h2>

                        <p className="mb-4 line-clamp-2 min-h-10 text-sm leading-5 text-brand-textSecondary">
                            {course.description}
                        </p>

                        <div className="mb-5 grid grid-cols-2 gap-3 text-xs text-brand-textSecondary">
                            <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                <span className="block uppercase tracking-wider">Course ID</span>
                                <strong className="mt-1 block text-sm text-white">#{course.id}</strong>
                            </div>
                            <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                <span className="block uppercase tracking-wider">Category ID</span>
                                <strong className="mt-1 block text-sm text-white">#{course.category_id}</strong>
                            </div>
                            <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                <span className="flex items-center gap-1 uppercase tracking-wider">
                                    <UserRound className="h-3.5 w-3.5" />
                                    Teacher
                                </span>
                                <strong className="mt-1 block text-sm text-white">#{course.teacher_id}</strong>
                            </div>
                            <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-3">
                                <span className="flex items-center gap-1 uppercase tracking-wider">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    Updated
                                </span>
                                <strong className="mt-1 block text-sm text-white">{course.updated_at}</strong>
                            </div>
                        </div>

                        <Link
                            to={`/courses/${course.id}`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/30 px-4 py-3 text-sm font-semibold text-[#a78bfa] no-underline transition hover:border-brand-accent/60 hover:bg-brand-accent/10 hover:text-white"
                        >
                            <Eye className="h-4 w-4" />
                            View Detail
                        </Link>
                    </div>
                </article>
            ))}
        </div>
    );
}
