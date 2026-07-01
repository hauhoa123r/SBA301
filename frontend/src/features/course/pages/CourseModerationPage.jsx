import { useMemo, useState } from "react";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Filter,
    MessageSquareText,
    Search,
    ShieldAlert,
    XCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import ModeratorLayout from "../../moderator/components/ModeratorLayout";

const COURSES = [
    {
        id: 1,
        title: "React Fundamentals",
        instructor: "Nguyen Minh Hai",
        category: "Frontend",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 2,
        title: "Node.js API Design",
        instructor: "Tran Quoc Bao",
        category: "Backend",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 3,
        title: "UI Design Essentials",
        instructor: "Le Thu Anh",
        category: "Design",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 4,
        title: "Data Analysis with SQL",
        instructor: "Pham Gia Huy",
        category: "Data",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 5,
        title: "Java Spring Boot",
        instructor: "Doan Nhat Linh",
        category: "Backend",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 6,
        title: "Python for Automation",
        instructor: "Hoang Nam",
        category: "Programming",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 7,
        title: "Cloud Deployment Basics",
        instructor: "Vo Khanh Duy",
        category: "DevOps",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
    {
        id: 8,
        title: "Business English",
        instructor: "Mai Phuong",
        category: "Language",
        thumbnail_url: "/images/undraw_morning-news_h9nz.svg",
    },
];

const REVIEW_STATUS = {
    PENDING: "PENDING_REVIEW",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    HIDDEN: "HIDDEN",
};

const REVIEW_COURSES = COURSES.slice(0, 8).map((course, index) => ({
    ...course,
    status: [REVIEW_STATUS.PENDING, REVIEW_STATUS.PENDING, REVIEW_STATUS.APPROVED, REVIEW_STATUS.HIDDEN][index % 4],
    submittedAt: ["2026-06-18", "2026-06-19", "2026-06-20", "2026-06-21"][index % 4],
    issues: [
        "Missing lesson preview",
        "Needs pricing confirmation",
        "Ready for publishing",
        "Copyright report attached",
    ][index % 4],
}));

const STATUS_STYLES = {
    PENDING_REVIEW: "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    REJECTED: "border-rose-200 bg-rose-50 text-rose-700",
    HIDDEN: "border-slate-200 bg-slate-100 text-slate-700",
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
    {
        title: "Approved",
        path: "/moderator/courses/approve",
        status: REVIEW_STATUS.APPROVED,
        icon: CheckCircle2,
        tone: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        title: "Rejected",
        path: "/moderator/courses/reject",
        status: REVIEW_STATUS.REJECTED,
        icon: XCircle,
        tone: "text-rose-600",
        bg: "bg-rose-50",
    },
    {
        title: "Hidden",
        path: "/moderator/courses/hide",
        status: REVIEW_STATUS.HIDDEN,
        icon: EyeOff,
        tone: "text-amber-600",
        bg: "bg-amber-50",
    },
];

export default function CourseModerationPage() {
    const location = useLocation();
    const initialTab = COURSE_STATUS_TABS.find((tab) => tab.path === location.pathname);
    const [courses, setCourses] = useState(REVIEW_COURSES);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState(initialTab?.status || "ALL");

    const filteredCourses = useMemo(() => {
        const searchValue = keyword.trim().toLowerCase();

        return courses.filter((course) => {
            const matchesStatus = statusFilter === "ALL" || course.status === statusFilter;
            const matchesKeyword = [course.title, course.instructor, course.category, course.issues]
                .join(" ")
                .toLowerCase()
                .includes(searchValue);

            return matchesStatus && matchesKeyword;
        });
    }, [courses, keyword, statusFilter]);

    const updateCourseStatus = (courseId, nextStatus) => {
        setCourses((items) =>
            items.map((course) =>
                course.id === courseId ? { ...course, status: nextStatus } : course
            )
        );
    };

    return (
        <ModeratorLayout
            eyebrow="Course Moderation"
            title="Course Management"
            description="Review submissions and manage approved, rejected, or hidden courses from one workspace."
            actions={
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:min-w-[520px]">
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
                        <option value="ALL">All statuses</option>
                        <option value={REVIEW_STATUS.PENDING}>Pending review</option>
                        <option value={REVIEW_STATUS.APPROVED}>Approved</option>
                        <option value={REVIEW_STATUS.REJECTED}>Rejected</option>
                        <option value={REVIEW_STATUS.HIDDEN}>Hidden</option>
                    </select>
                </label>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-[1.6fr_1fr_160px_170px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase text-slate-500 max-lg:hidden">
                    <span>Course</span>
                    <span>Review note</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                <div className="divide-y divide-slate-200">
                    {filteredCourses.map((course) => (
                        <article key={course.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.6fr_1fr_160px_170px] lg:items-center">
                            <div className="flex gap-4">
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    className="h-20 w-28 rounded-lg object-cover"
                                />
                                <div>
                                    <h2 className="font-semibold leading-6 text-slate-950">{course.title}</h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {course.instructor} · {course.category} · Submitted {course.submittedAt}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-slate-600">
                                <MessageSquareText className="mt-0.5 h-4 w-4 text-violet-600" />
                                <span>{course.issues}</span>
                            </div>

                            <span className={`w-fit rounded-lg border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[course.status]}`}>
                                {course.status.replace("_", " ")}
                            </span>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    type="button"
                                    onClick={() => updateCourseStatus(course.id, REVIEW_STATUS.APPROVED)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                                    title="Approve course"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateCourseStatus(course.id, REVIEW_STATUS.REJECTED)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50"
                                    title="Reject course"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateCourseStatus(course.id, REVIEW_STATUS.HIDDEN)}
                                    className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-200 text-amber-700 transition hover:bg-amber-50"
                                    title="Hide course"
                                >
                                    <EyeOff className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="p-10 text-center text-slate-500">
                        No courses match the current moderation filters.
                    </div>
                )}
            </section>

            <div className="mt-8 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                UI currently uses mock data so the review flow can be integrated with backend endpoints later.
            </div>
        </ModeratorLayout>
    );
}
