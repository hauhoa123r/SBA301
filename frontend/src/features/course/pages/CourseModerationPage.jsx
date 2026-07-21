import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    Filter,
    GraduationCap,
    MessageSquareText,
    Search,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import ModeratorLayout from "../../moderator/components/ModeratorLayout";
import {
    approveCourseForPublication,
    getPendingCoursesForReview,
} from "../services/api/courseManagementService";

const REVIEW_STATUS = {
    PENDING: "PENDING",
};

const STATUS_STYLES = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
};

const COURSE_STATUS_TABS = [
    {
        title: "Pending Review",
        path: "/moderator/courses/review",
        status: REVIEW_STATUS.PENDING,
        icon: Eye,
        tone: "text-sky-600",
        bg: "bg-sky-50",
    },
];

const formatDate = (value) => {
    if (!value) return "No submit date";

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
};

const formatPrice = (value) => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function CourseModerationPage() {
    const location = useLocation();
    const initialTab = COURSE_STATUS_TABS.find((tab) => tab.path === location.pathname);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState(initialTab?.status || REVIEW_STATUS.PENDING);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState(false);

    const filteredCourses = useMemo(() => {
        const searchValue = keyword.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesStatus = statusFilter === "ALL" || course.status === statusFilter;
            const chapterText = course.chapters
                ?.flatMap((chapter) => [chapter.title, ...(chapter.lessons || []).map((lesson) => lesson.title)])
                .join(" ");
            const matchesKeyword = [course.title, course.instructor, course.category, course.description, chapterText]
                .join(" ")
                .toLowerCase()
                .includes(searchValue);

            return matchesStatus && matchesKeyword;
        });
    }, [courses, keyword, statusFilter]);

    const selectedCourse = useMemo(
        () => filteredCourses.find((course) => course.id === selectedCourseId) || filteredCourses[0],
        [filteredCourses, selectedCourseId]
    );

    useEffect(() => {
        const fetchPendingCourses = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getPendingCoursesForReview();
                setCourses(data);
                setSelectedCourseId(data[0]?.id ?? null);
            } catch {
                setError("Cannot load pending courses.");
            } finally {
                setLoading(false);
            }
        };

        fetchPendingCourses();
    }, []);

    const handleApproveSelectedCourse = async () => {
        if (!selectedCourse) return;

        try {
            setActionLoading(true);
            setActionMessage("");
            setActionError(false);
            await approveCourseForPublication(selectedCourse.id);

            const nextCourse = filteredCourses.find((course) => course.id !== selectedCourse.id);
            setCourses((items) => items.filter((course) => course.id !== selectedCourse.id));
            setSelectedCourseId(nextCourse?.id ?? null);
            setActionMessage(`Course "${selectedCourse.title}" was approved and published.`);
        } catch {
            setActionError(true);
            setActionMessage("Cannot approve this course. Please make sure it is still pending.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <ModeratorLayout
            eyebrow="Course Moderation"
            title="Review Courses"
            description="Review submitted courses with PENDING status before publication."
            actions={
                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[520px]">
                    {COURSE_STATUS_TABS.map((item) => {
                        const Icon = item.icon;
                        const count = courses.filter((course) => course.status === item.status).length;

                        return (
                            <button
                                type="button"
                                key={item.title}
                                onClick={() => setStatusFilter(item.status)}
                                className={`rounded-lg border p-4 text-left text-slate-950 shadow-sm transition ${
                                        statusFilter === item.status
                                            ? "border-violet-300 bg-violet-50"
                                            : "border-slate-200 bg-white hover:border-violet-200"
                                    }`}
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${item.bg} ${item.tone}`}>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <span className="text-2xl font-bold text-slate-950">{count}</span>
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">{item.title}</h2>
                            </button>
                        );
                    })}
                    <article className="rounded-lg border border-slate-200 bg-white p-4 text-left text-slate-950 shadow-sm">
                        <BookOpen className="mb-3 h-5 w-5 text-violet-600" />
                        <span className="block text-2xl font-bold text-slate-950">
                            {courses.reduce((total, course) => total + (course.totalLessons || 0), 0)}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-800">Lessons to inspect</h2>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 text-left text-slate-950 shadow-sm">
                        <GraduationCap className="mb-3 h-5 w-5 text-emerald-600" />
                        <span className="block text-2xl font-bold text-slate-950">
                            {new Set(courses.map((course) => course.instructor).filter(Boolean)).size}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-800">Instructors</h2>
                    </article>
                </div>
            }
        >
            <section className="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[1fr_260px]">
                <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                        placeholder="Search course, instructor, category, issue..."
                        className="h-12 w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                </label>

                <label className="relative block">
                    <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    >
                        <option value="ALL">All pending courses</option>
                        <option value={REVIEW_STATUS.PENDING}>Pending review</option>
                    </select>
                </label>
            </section>

            {loading && (
                <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    Loading pending courses...
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-10 text-center text-rose-600 shadow-sm">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                            <h2 className="text-sm font-semibold uppercase text-slate-500">Pending queue</h2>
                        </div>

                        <div className="divide-y divide-slate-200">
                            {filteredCourses.map((course) => (
                                <button
                                    type="button"
                                    key={course.id}
                                    onClick={() => setSelectedCourseId(course.id)}
                                    className={`grid w-full gap-3 px-5 py-5 text-left transition ${
                                        selectedCourse?.id === course.id
                                            ? "bg-violet-50"
                                            : "bg-white hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="h-20 w-28 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-20 w-28 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                                <BookOpen className="h-6 w-6" />
                                            </span>
                                        )}
                                        <div>
                                            <h3 className="font-semibold leading-6 text-slate-950">{course.title}</h3>
                                            <p className="mt-1 text-sm text-slate-600">
                                                {course.instructor || "Unknown instructor"} · {course.category || "Uncategorized"}
                                            </p>
                                            <span className={`mt-3 inline-flex w-fit rounded-lg border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[course.status] || STATUS_STYLES.PENDING}`}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredCourses.length === 0 && (
                            <div className="p-10 text-center text-slate-500">
                                No pending courses match the current review filters.
                            </div>
                        )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                        {actionMessage && (
                            <div className={`mb-6 rounded-lg border px-4 py-3 text-sm font-semibold ${
                                actionError
                                    ? "border-rose-100 bg-rose-50 text-rose-700"
                                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
                            }`}>
                                {actionMessage}
                            </div>
                        )}

                        {selectedCourse ? (
                            <div>
                                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <span className="mb-3 inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                                            {selectedCourse.status}
                                        </span>
                                        <h2 className="text-2xl font-bold leading-tight text-slate-950">
                                            {selectedCourse.title}
                                        </h2>
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                            {selectedCourse.description || "No course description was submitted."}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleApproveSelectedCourse}
                                        disabled={actionLoading || selectedCourse.status !== REVIEW_STATUS.PENDING}
                                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
                                        title="Approve course for publication"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        {actionLoading ? "Approving..." : "Approve"}
                                    </button>
                                </div>

                                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <GraduationCap className="mb-2 h-5 w-5 text-violet-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Instructor</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.instructor || "Unknown"}</strong>
                                    </article>
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <BookOpen className="mb-2 h-5 w-5 text-sky-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Lessons</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.totalLessons || 0} lessons</strong>
                                    </article>
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <Clock3 className="mb-2 h-5 w-5 text-emerald-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Duration</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.durationText || selectedCourse.duration || "No duration"}</strong>
                                    </article>
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <CalendarDays className="mb-2 h-5 w-5 text-amber-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Submitted</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{formatDate(selectedCourse.createdAt)}</strong>
                                    </article>
                                </div>

                                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Category</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.category || "Uncategorized"}</strong>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Lowest plan price</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{formatPrice(selectedCourse.price)}</strong>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Students</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.students || 0}</strong>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-200">
                                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase text-slate-500">Curriculum to review</h3>
                                    </div>
                                    <div className="divide-y divide-slate-200">
                                        {(selectedCourse.chapters || []).map((chapter, index) => (
                                            <article key={chapter.id || `${chapter.title}-${index}`} className="p-5">
                                                <h4 className="font-semibold text-slate-950">
                                                    Chapter {chapter.orderIndex ?? index + 1}: {chapter.title}
                                                </h4>
                                                <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                                                    {(chapter.lessons || []).map((lesson, lessonIndex) => (
                                                        <li key={lesson.id || `${lesson.title}-${lessonIndex}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                                                            <span>{lesson.orderIndex ?? lessonIndex + 1}. {lesson.title}</span>
                                                            <span className="text-xs font-semibold text-slate-500">{lesson.duration || "No duration"}</span>
                                                        </li>
                                                    ))}
                                                    {(chapter.lessons || []).length === 0 && (
                                                        <li className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                                                            No lessons submitted for this chapter.
                                                        </li>
                                                    )}
                                                </ul>
                                            </article>
                                        ))}
                                    </div>
                                    {(selectedCourse.chapters || []).length === 0 && (
                                        <div className="p-5 text-sm text-slate-500">
                                            No curriculum content was submitted for this course.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 rounded-lg border border-violet-100 bg-violet-50 p-5">
                                    <div className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                                        <MessageSquareText className="mt-0.5 h-5 w-5 text-violet-600" />
                                        <p>
                                            US39 approval publishes a pending course. Reject and hide actions belong to US40-US41 and are intentionally not changed here.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-500">
                                Select a pending course to review its content.
                            </div>
                        )}
                    </section>
                </div>
            )}

        </ModeratorLayout>
    );
}
