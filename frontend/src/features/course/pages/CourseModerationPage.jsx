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
    XCircle,
    EyeOff,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import ModeratorLayout from "../../moderator/components/ModeratorLayout";
import {
    approveCourseForPublication,
    getPendingCoursesForReview,
    rejectCourseForRevision,
    getPublishedCoursesForHide,
    hideCourseFromCatalog,
} from "../services/api/courseManagementService";

const REVIEW_STATUS = {
    PENDING: "PENDING",
    PUBLISHED: "PUBLISHED",
};

const STATUS_STYLES = {
    PENDING: "border-amber-200 bg-amber-50 text-amber-700",
    PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const STATUS_LABELS = {
    DRAFT: "Bản nháp",
    PENDING: "Chờ duyệt",
    PUBLISHED: "Đã xuất bản",
    HIDDEN: "Đã ẩn",
};

const COURSE_STATUS_TABS = [
    {
        title: "Chờ duyệt",
        path: "/moderator/courses/review",
        status: REVIEW_STATUS.PENDING,
        icon: Eye,
        tone: "text-sky-600",
        bg: "bg-sky-50",
    },
];

const formatDate = (value) => {
    if (!value) return "Chưa có ngày gửi";

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
    const isHideMode = location.pathname === "/moderator/courses/hide";
    const activeStatus = isHideMode ? REVIEW_STATUS.PUBLISHED : REVIEW_STATUS.PENDING;
    const initialTab = COURSE_STATUS_TABS.find((tab) => tab.path === location.pathname);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState(activeStatus);
    const [hideReason, setHideReason] = useState("");
    const [hideError, setHideError] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [actionError, setActionError] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");
    const courseStatusCards = isHideMode
        ? [
            {
                title: "Đã xuất bản",
                status: REVIEW_STATUS.PUBLISHED,
                icon: EyeOff,
                tone: "text-rose-600",
                bg: "bg-rose-50",
            },
        ]
        : COURSE_STATUS_TABS;
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
        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError("");
                setActionMessage("");
                setActionError(false);
                setStatusFilter(activeStatus);

                const data = isHideMode
                    ? await getPublishedCoursesForHide()
                    : await getPendingCoursesForReview();

                setCourses(data);
                setSelectedCourseId(data[0]?.id ?? null);
            } catch {
                setError(isHideMode ? "Không thể tải khóa học đã xuất bản." : "Không thể tải khóa học chờ duyệt.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [isHideMode, activeStatus]);

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
            setActionMessage(`Khóa học "${selectedCourse.title}" đã được duyệt và xuất bản.`);
        } catch {
            setActionError(true);
            setActionMessage("Không thể duyệt khóa học này. Vui lòng kiểm tra khóa học vẫn đang chờ duyệt.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSelectedCourse = async () => {
        if (!selectedCourse) return;

        const reason = rejectReason.trim();
        if (!reason) {
            setRejectError("Vui lòng nhập lý do từ chối.");
            return;
        }

        try {
            setActionLoading(true);
            setActionMessage("");
            setActionError(false);
            setRejectError("");

            await rejectCourseForRevision(selectedCourse.id, reason);

            const nextCourse = filteredCourses.find((course) => course.id !== selectedCourse.id);
            setCourses((items) => items.filter((course) => course.id !== selectedCourse.id));
            setSelectedCourseId(nextCourse?.id ?? null);
            setRejectReason("");
            setActionMessage(`Khóa học "${selectedCourse.title}" đã bị từ chối và chuyển về bản nháp.`);
        } catch {
            setActionError(true);
            setActionMessage("Không thể từ chối khóa học này. Vui lòng kiểm tra khóa học vẫn đang chờ duyệt.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleHideSelectedCourse = async () => {
        if (!selectedCourse) return;

        const reason = hideReason.trim();
        if (!reason) {
            setHideError("Vui lòng nhập lý do ẩn khóa học.");
            return;
        }

        try {
            setActionLoading(true);
            setActionMessage("");
            setActionError(false);
            setHideError("");

            await hideCourseFromCatalog(selectedCourse.id, reason);

            const nextCourse = filteredCourses.find((course) => course.id !== selectedCourse.id);
            setCourses((items) => items.filter((course) => course.id !== selectedCourse.id));
            setSelectedCourseId(nextCourse?.id ?? null);
            setHideReason("");
            setActionMessage(`Khóa học "${selectedCourse.title}" đã được ẩn khỏi danh mục công khai.`);
        } catch {
            setActionError(true);
            setActionMessage("Không thể ẩn khóa học này. Vui lòng kiểm tra khóa học vẫn đang được xuất bản.");
        } finally {
            setActionLoading(false);
        }
    };
    return (
        <ModeratorLayout
            eyebrow="Kiểm duyệt khóa học"
            title={isHideMode ? "Ẩn khóa học" : "Duyệt khóa học"}
            description={
                isHideMode
                    ? "Ẩn các khóa học đã xuất bản khỏi danh mục công khai."
                    : "Rà soát các khóa học đang chờ duyệt trước khi xuất bản."
            }
            actions={
                <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[520px]">
                    {courseStatusCards.map((item) => {
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
                        <h2 className="text-sm font-semibold text-slate-800">Bài học cần kiểm tra</h2>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-4 text-left text-slate-950 shadow-sm">
                        <GraduationCap className="mb-3 h-5 w-5 text-emerald-600" />
                        <span className="block text-2xl font-bold text-slate-950">
                            {new Set(courses.map((course) => course.instructor).filter(Boolean)).size}
                        </span>
                        <h2 className="text-sm font-semibold text-slate-800">Giảng viên</h2>
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
                        placeholder="Tìm khóa học, giảng viên, danh mục, nội dung..."
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
                        <option value="ALL">{isHideMode ? "Tất cả khóa học đã xuất bản" : "Tất cả khóa học chờ duyệt"}</option>
                        <option value={activeStatus}>{isHideMode ? "Đã xuất bản" : "Chờ duyệt"}</option>
                    </select>
                </label>
            </section>

            {loading && (
                <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                    {isHideMode ? "Đang tải khóa học đã xuất bản..." : "Đang tải khóa học chờ duyệt..."}
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
                            <h2 className="text-sm font-semibold uppercase text-slate-500">
                                {isHideMode ? "Danh sách đã xuất bản" : "Danh sách chờ duyệt"}
                            </h2>
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
                                                {course.instructor || "Chưa rõ giảng viên"} · {course.category || "Chưa phân loại"}
                                            </p>
                                            <span className={`mt-3 inline-flex w-fit rounded-lg border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[course.status] || STATUS_STYLES.PENDING}`}>
                                                {STATUS_LABELS[course.status] || course.status}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {filteredCourses.length === 0 && (
                            <div className="p-10 text-center text-slate-500">
                                {isHideMode
                                    ? "Không có khóa học đã xuất bản nào khớp với bộ lọc hiện tại."
                                    : "Không có khóa học chờ duyệt nào khớp với bộ lọc hiện tại."}
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
                                            {STATUS_LABELS[selectedCourse.status] || selectedCourse.status}
                                        </span>
                                        <h2 className="text-2xl font-bold leading-tight text-slate-950">
                                            {selectedCourse.title}
                                        </h2>
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                            {selectedCourse.description || "Chưa có mô tả khóa học."}
                                        </p>
                                    </div>
                                    {isHideMode ? (
                                        <button
                                            type="button"
                                            onClick={handleHideSelectedCourse}
                                            disabled={actionLoading || selectedCourse.status !== REVIEW_STATUS.PUBLISHED}
                                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-600 bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
                                            title="Ẩn khóa học khỏi danh mục"
                                        >
                                            <EyeOff className="h-4 w-4" />
                                            {actionLoading ? "Đang ẩn..." : "Ẩn"}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleApproveSelectedCourse}
                                            disabled={actionLoading || selectedCourse.status !== REVIEW_STATUS.PENDING}
                                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-200 disabled:text-slate-500"
                                            title="Duyệt khóa học để xuất bản"
                                        >
                                            <CheckCircle2 className="h-4 w-4" />
                                            {actionLoading ? "Đang duyệt..." : "Duyệt"}
                                        </button>
                                    )}
                                </div>

                                {isHideMode && (
                                    <div className="mb-6 rounded-lg border border-rose-100 bg-rose-50 p-5">
                                        <label className="block text-sm font-semibold text-rose-800">
                                            Lý do ẩn khóa học
                                        </label>
                                        <textarea
                                            value={hideReason}
                                            onChange={(event) => setHideReason(event.target.value)}
                                            rows={3}
                                            placeholder="Nhập lý do cần ẩn khóa học đã xuất bản..."
                                            className="mt-3 w-full rounded-lg border border-rose-200 bg-white p-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                                        />
                                        {hideError && (
                                            <p className="mt-2 text-sm font-semibold text-rose-700">{hideError}</p>
                                        )}
                                    </div>
                                )}

                                <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <GraduationCap className="mb-2 h-5 w-5 text-violet-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Giảng viên</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.instructor || "Chưa rõ"}</strong>
                                    </article>
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <BookOpen className="mb-2 h-5 w-5 text-sky-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Bài học</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.totalLessons || 0} bài học</strong>
                                    </article>
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <Clock3 className="mb-2 h-5 w-5 text-emerald-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Thời lượng</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.durationText || selectedCourse.duration || "Chưa có thời lượng"}</strong>
                                    </article>
                                    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <CalendarDays className="mb-2 h-5 w-5 text-amber-600" />
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Ngày gửi</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{formatDate(selectedCourse.createdAt)}</strong>
                                    </article>
                                </div>

                                <div className="mb-6 grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Danh mục</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.category || "Chưa phân loại"}</strong>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Giá gói thấp nhất</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{formatPrice(selectedCourse.price)}</strong>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 p-4">
                                        <span className="block text-xs font-semibold uppercase text-slate-500">Học viên</span>
                                        <strong className="mt-1 block text-sm text-slate-950">{selectedCourse.students || 0}</strong>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-slate-200">
                                    <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                                        <h3 className="text-sm font-semibold uppercase text-slate-500">Chương trình học cần kiểm tra</h3>
                                    </div>
                                    <div className="divide-y divide-slate-200">
                                        {(selectedCourse.chapters || []).map((chapter, index) => (
                                            <article key={chapter.id || `${chapter.title}-${index}`} className="p-5">
                                                <h4 className="font-semibold text-slate-950">
                                                    Chương {chapter.orderIndex ?? index + 1}: {chapter.title}
                                                </h4>
                                                <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                                                    {(chapter.lessons || []).map((lesson, lessonIndex) => (
                                                        <li key={lesson.id || `${lesson.title}-${lessonIndex}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                                                            <span>{lesson.orderIndex ?? lessonIndex + 1}. {lesson.title}</span>
                                                            <span className="text-xs font-semibold text-slate-500">{lesson.duration || "Chưa có thời lượng"}</span>
                                                        </li>
                                                    ))}
                                                    {(chapter.lessons || []).length === 0 && (
                                                        <li className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                                                            Chưa có bài học nào trong chương này.
                                                        </li>
                                                    )}
                                                </ul>
                                            </article>
                                        ))}
                                    </div>
                                    {(selectedCourse.chapters || []).length === 0 && (
                                        <div className="p-5 text-sm text-slate-500">
                                            Chưa có nội dung chương trình học cho khóa học này.
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 rounded-lg border border-violet-100 bg-violet-50 p-5">
                                    <div className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                                        <MessageSquareText className="mt-0.5 h-5 w-5 text-violet-600" />

                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-slate-500">
                                {isHideMode ? "Chọn một khóa học đã xuất bản để xem chi tiết." : "Chọn một khóa học chờ duyệt để xem nội dung."}
                            </div>
                        )}
                    </section>
                </div>
            )}

        </ModeratorLayout>
    );
}
