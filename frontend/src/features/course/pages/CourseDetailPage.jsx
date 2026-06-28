import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { BookOpen, Users } from "lucide-react";
import { COURSES } from "../services/mockup";
import NotFoundPage from "../../../shared/pages/NotFoundPage";
import CourseContent from "../components/CourseContent";
import CoursePaymentPage from "../components/CoursePaymentPage";
import CoursePurchaseCard from "../components/CoursePurchaseCard";
import { courseChapters } from "../shared/courseDetailData";

export default function CourseDetailPage() {
    const { id } = useParams();
    const layoutContext = useOutletContext();
    const setShowChrome = layoutContext?.setShowChrome;
    const [voucher, setVoucher] = useState("");
    const [voucherStatus, setVoucherStatus] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState(() => new Set([1]));
    const [isPaymentPageOpen, setIsPaymentPageOpen] = useState(false);
    const [paymentCountdown, setPaymentCountdown] = useState(15 * 60);
    const course = COURSES.find((item) => item.id === Number(id));

    useEffect(() => {
        if (!isPaymentPageOpen) return undefined;

        const timerId = window.setInterval(() => {
            setPaymentCountdown((prev) => Math.max(0, prev - 1));
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [isPaymentPageOpen]);

    useEffect(() => {
        setShowChrome?.(!isPaymentPageOpen);

        return () => setShowChrome?.(true);
    }, [isPaymentPageOpen, setShowChrome]);

    if (!course) return <NotFoundPage />;

    const isVoucherValid = voucherStatus === "valid";
    const discountAmount = isVoucherValid ? course.price * 0.1 : 0;
    const finalPrice = Math.max(0, course.price - discountAmount);
    const totalLessons = courseChapters.reduce((total, chapter) => total + chapter.lessons.length, 0);

    const openPaymentPage = () => {
        setPaymentCountdown(15 * 60);
        setIsPaymentPageOpen(true);
    };

    const handleVerifyVoucher = () => {
        const normalizedVoucher = voucher.trim().toUpperCase();

        if (!normalizedVoucher) {
            setVoucherStatus("empty");
            return;
        }

        setVoucherStatus(normalizedVoucher === "EDUJAR10" ? "valid" : "invalid");
    };

    const toggleChapter = (chapterId) => {
        setExpandedChapters((prev) => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedChapters(new Set(courseChapters.map((chapter) => chapter.id)));
    };

    if (isPaymentPageOpen) {
        return (
            <CoursePaymentPage
                course={course}
                amount={finalPrice}
                countdownSeconds={paymentCountdown}
                onBack={() => setIsPaymentPageOpen(false)}
            />
        );
    }

    return (
        <div className="relative overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute left-[-12%] top-[-20%] h-[520px] w-[520px] rounded-full bg-brand-accent/15 blur-[120px]" />
                <div className="absolute bottom-[-18%] right-[-10%] h-[520px] w-[520px] rounded-full bg-brand-accentDeep/25 blur-[120px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <section className="relative z-10 mx-auto grid max-w-[1500px] gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_440px] xl:gap-14">
                <section className="min-w-0">
                    <div className="mb-7 flex items-center gap-2 text-sm font-bold text-brand-textSecondary">
                        <BookOpen className="h-4 w-4 text-brand-accentSoft" />
                        <span>{course.category}</span>
                    </div>

                    <h1 className="text-4xl font-black leading-tight text-brand-white md:text-6xl" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {course.title}
                    </h1>
                    <p className="mt-6 max-w-5xl text-base leading-8 text-brand-textSecondary md:text-lg">
                        {course.description}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-6 text-base font-bold text-brand-textSecondary">
                        <span className="inline-flex items-center gap-2">
                            <Users className="h-5 w-5 text-brand-accentSoft" />
                            {course.students.toLocaleString("vi-VN")} học viên
                        </span>
                        <span className="inline-flex items-center gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-accent text-sm font-black text-brand-white">{course.instructor.charAt(0)}</span>
                            {course.instructor}
                        </span>
                    </div>

                    <CourseContent
                        chapters={courseChapters}
                        courseDuration={course.duration}
                        totalLessons={totalLessons}
                        expandedChapters={expandedChapters}
                        onToggleChapter={toggleChapter}
                        onExpandAll={expandAll}
                    />
                </section>

                <CoursePurchaseCard
                    course={course}
                    finalPrice={finalPrice}
                    isVoucherValid={isVoucherValid}
                    voucher={voucher}
                    voucherStatus={voucherStatus}
                    totalLessons={totalLessons}
                    onVoucherChange={(value) => {
                        setVoucher(value);
                        setVoucherStatus(null);
                    }}
                    onVerifyVoucher={handleVerifyVoucher}
                    onPurchase={openPaymentPage}
                />
            </section>
        </div>
    );
}
