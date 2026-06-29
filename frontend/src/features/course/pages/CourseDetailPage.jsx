import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { BookOpen, CircleDollarSign, Users } from "lucide-react";
import NotFoundPage from "../../../shared/pages/NotFoundPage";
import CourseContent from "../components/CourseContent";
import CoursePurchaseCard from "../components/CoursePurchaseCard";
import PaymentMethodModal from "../components/PaymentMethodModal";
import { getCourseById } from "../service/course.service";

export default function CourseDetailPage() {
    const { id } = useParams();
    const layoutContext = useOutletContext();
    const setShowChrome = layoutContext?.setShowChrome;
    const [voucher, setVoucher] = useState("");
    const [voucherStatus, setVoucherStatus] = useState(null);
    const [expandedChapters, setExpandedChapters] = useState(() => new Set([1]));
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [course, setCourse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchCourse = async () => {
            try {
                setIsLoading(true);
                const data = await getCourseById(id);
                if (isMounted) {
                    setCourse(data);
                    setIsNotFound(false);
                }
            } catch {
                if (isMounted) {
                    setIsNotFound(true);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCourse();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        setShowChrome?.(true);

        return () => setShowChrome?.(true);
    }, [setShowChrome]);

    if (isLoading) {
        return (
            <section className="container mx-auto px-6 py-16 text-center text-brand-textSecondary">
                Loading course...
            </section>
        );
    }

    if (isNotFound || !course) return <NotFoundPage />;

    const isVoucherValid = voucherStatus === "valid";
    const discountAmount = isVoucherValid ? course.price * 0.1 : 0;
    const finalPrice = Math.max(0, course.price - discountAmount);
    const courseChapters = course.chapters ?? [];
    const totalLessons = course.totalLessons ?? courseChapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
    const formatPrice = (value) => {
        if (!value) return "Miễn phí";

        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const openPaymentPage = () => {
        setIsPaymentModalOpen(true);
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

                    <h1 className="max-w-5xl break-words text-4xl font-black leading-tight text-brand-white md:text-5xl lg:text-6xl">
                        {course.title}
                    </h1>
                    <p className="mt-6 max-w-5xl text-base leading-8 text-brand-textSecondary md:text-lg">
                        {course.description}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-6 text-base font-bold text-brand-textSecondary">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-accent/10 px-4 py-2 text-brand-accentSoft">
                            <CircleDollarSign className="h-5 w-5" />
                            {formatPrice(course.price)}
                        </span>
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

            <PaymentMethodModal
                course={course}
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </div>
    );
}
