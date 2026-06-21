import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgePercent, CalendarDays, CreditCard, Layers, PlayCircle, UserRound } from "lucide-react";
import HeroFooter from "../../../shared/components/HeroFooter";
import HeroHeader from "../../../shared/components/HeroHeader";
import { COURSES } from "../../course/services/mockup";
import NotFoundPage from "../../error/pages/NotFoundPage";

export default function CourseDetailPage() {
    const { id } = useParams();
    const [voucher, setVoucher] = useState("");
    const [voucherStatus, setVoucherStatus] = useState(null);
    const course = COURSES.find((item) => item.id === Number(id));

    if (!course) return <NotFoundPage />;

    const fmt = (n) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(n);

    const isVoucherValid = voucherStatus === "valid";
    const discountAmount = isVoucherValid ? course.price * 0.1 : 0;
    const finalPrice = course.price - discountAmount;

    const handleVerifyVoucher = () => {
        const normalizedVoucher = voucher.trim().toUpperCase();

        if (!normalizedVoucher) {
            setVoucherStatus("empty");
            return;
        }

        setVoucherStatus(normalizedVoucher === "EDUJAR10" ? "valid" : "invalid");
    };

    const detailItems = [
        { label: "Course ID", value: `#${course.id}` },
        { label: "Teacher ID", value: `#${course.teacher_id}` },
        { label: "Category ID", value: `#${course.category_id}` },
        { label: "Status", value: course.status },
        { label: "Created At", value: course.created_at },
        { label: "Updated At", value: course.updated_at },
    ];

    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <HeroHeader />

            <main className="container mx-auto px-6 py-12">
                <Link
                    to="/courses"
                    className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-textSecondary no-underline transition hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to courses
                </Link>

                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <section className="overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg">
                        <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="aspect-video w-full object-cover"
                        />

                        <div className="p-6 md:p-8">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <span className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-3 py-1 text-xs font-semibold text-[#a78bfa]">
                                    {course.category}
                                </span>
                                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                                    {course.status}
                                </span>
                            </div>

                            <h1
                                className="text-3xl font-extrabold leading-tight text-white md:text-5xl"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                {course.title}
                            </h1>

                            <p className="mt-4 text-base leading-7 text-brand-textSecondary">
                                {course.description}
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-4">
                                    <UserRound className="mb-3 h-5 w-5 text-[#a78bfa]" />
                                    <p className="text-xs uppercase tracking-wider text-brand-textSecondary">Instructor</p>
                                    <p className="mt-1 font-semibold text-white">{course.instructor}</p>
                                </div>
                                <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-4">
                                    <Layers className="mb-3 h-5 w-5 text-[#a78bfa]" />
                                    <p className="text-xs uppercase tracking-wider text-brand-textSecondary">Level</p>
                                    <p className="mt-1 font-semibold text-white">{course.level}</p>
                                </div>
                                <div className="rounded-xl border border-brand-accent/10 bg-brand-light/70 p-4">
                                    <CalendarDays className="mb-3 h-5 w-5 text-[#a78bfa]" />
                                    <p className="text-xs uppercase tracking-wider text-brand-textSecondary">Duration</p>
                                    <p className="mt-1 font-semibold text-white">{course.duration}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <aside className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6">
                        <div className="mb-6 rounded-2xl border border-brand-accent/10 bg-brand-light/70 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                Course Price
                            </p>
                            <div className="mt-2 flex items-end justify-between gap-4">
                                <strong
                                    className="text-3xl font-extrabold text-white"
                                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                >
                                    {fmt(finalPrice)}
                                </strong>
                                {isVoucherValid && (
                                    <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                        -10%
                                    </span>
                                )}
                            </div>
                            {isVoucherValid && (
                                <p className="mt-2 text-sm text-brand-textSecondary">
                                    Original price: <span className="line-through">{fmt(course.price)}</span>
                                </p>
                            )}

                            <div className="mt-5">
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Voucher
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        value={voucher}
                                        onChange={(event) => {
                                            setVoucher(event.target.value);
                                            setVoucherStatus(null);
                                        }}
                                        placeholder="Enter voucher code"
                                        className="h-11 min-w-0 flex-1 rounded-xl border border-brand-accent/20 bg-brand-dark px-4 text-sm text-white outline-none transition focus:border-brand-accent/60"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyVoucher}
                                        className="inline-flex h-11 items-center gap-2 rounded-xl border border-brand-accent/30 px-4 text-sm font-semibold text-[#a78bfa] transition hover:border-brand-accent/60 hover:bg-brand-accent/10 hover:text-white"
                                    >
                                        <BadgePercent className="h-4 w-4" />
                                        Verify
                                    </button>
                                </div>
                                {voucherStatus === "valid" && (
                                    <p className="mt-2 text-sm font-medium text-emerald-400">
                                        Voucher EDUJAR10 applied successfully.
                                    </p>
                                )}
                                {voucherStatus === "invalid" && (
                                    <p className="mt-2 text-sm font-medium text-red-400">
                                        Voucher is not valid.
                                    </p>
                                )}
                                {voucherStatus === "empty" && (
                                    <p className="mt-2 text-sm font-medium text-amber-400">
                                        Please enter a voucher code.
                                    </p>
                                )}
                            </div>
                        </div>

                        <h2
                            className="mb-5 text-xl font-bold text-white"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            Database Attributes
                        </h2>

                        <div className="flex flex-col gap-3">
                            {detailItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-center justify-between gap-4 rounded-xl border border-brand-accent/10 bg-brand-light/70 p-4"
                                >
                                    <span className="text-sm text-brand-textSecondary">{item.label}</span>
                                    <strong className="text-right text-sm text-white">{item.value}</strong>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 rounded-xl border border-brand-accent/10 bg-brand-light/70 p-4">
                            <p className="text-xs uppercase tracking-wider text-brand-textSecondary">Thumbnail URL</p>
                            <p className="mt-2 break-all text-sm text-white">{course.thumbnail_url}</p>
                        </div>

                        <button
                            type="button"
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover"
                        >
                            <CreditCard className="h-4 w-4" />
                            Purchase
                        </button>
                        <Link
                            to={`/learning/courses/${course.id}`}
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/30 px-5 py-3 text-sm font-semibold text-[#a78bfa] no-underline transition hover:border-brand-accent/60 hover:bg-brand-accent/10 hover:text-white"
                        >
                            <PlayCircle className="h-4 w-4" />
                            Start Learning
                        </Link>
                    </aside>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
