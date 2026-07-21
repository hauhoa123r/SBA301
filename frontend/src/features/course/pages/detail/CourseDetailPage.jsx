import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import NotFoundPage from "../../../../shared/pages/NotFoundPage";
import CourseDetailError from "../../components/detail/CourseDetailError";
import CourseDetailLoading from "../../components/detail/CourseDetailLoading";
import CourseHeader from "../../components/detail/CourseHeader";
import CourseContent from "../../components/detail/CourseContent";
import CoursePurchaseCard from "../../components/detail/CoursePurchaseCard";
import PaymentMethodModal from "../../components/payment/PaymentMethodModal";
import useCourseDetail from "../../hooks/useCourseDetail";
import useCourseVoucher from "../../hooks/useCourseVoucher";
import { calculateTotalLessons } from "../../utils/courseCalculations";

export default function CourseDetailPage() {
    const { id } = useParams();
    const layoutContext = useOutletContext();
    const setShowChrome = layoutContext?.setShowChrome;
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const { course, isLoading, isNotFound, isError, errorMessage } = useCourseDetail(id);
    const {voucher,voucherStatus,
        verifiedCoupon,isVerifying,
        isValid: isVoucherValid,
        discountAmount,
        finalPrice,
        changeVoucher,
        verifyVoucher,
    } = useCourseVoucher(course?.price);

    useEffect(() => {
        setShowChrome?.(true);
    }, [setShowChrome]);

    if (isLoading) {
        return <CourseDetailLoading />;
    }

    if (isNotFound) return <NotFoundPage />;

    if (isError || !course) {
        return <CourseDetailError message={errorMessage} />;
    }

    const courseChapters = Array.isArray(course.chapters) ? course.chapters : [];
    const totalLessons = calculateTotalLessons(course);

    const openPaymentModal = () => {
        setIsPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
    };

    return (
        <div className="user-ui-scope relative overflow-hidden text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute left-[-12%] top-[-20%] h-[520px] w-[520px] rounded-full bg-brand-accent/15 blur-[120px]" />
                <div className="absolute bottom-[-18%] right-[-10%] h-[520px] w-[520px] rounded-full bg-brand-accentDeep/25 blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`, backgroundSize: "60px 60px" }} />
            </div>

            <section aria-labelledby="course-detail-title" className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10 xl:gap-14">
                <section className="min-w-0">
                    <CourseHeader course={course} />
                    <CourseContent key={course.id} chapters={courseChapters} courseDuration={course.duration} totalLessons={totalLessons} />
                </section>

                <CoursePurchaseCard course={course} finalPrice={finalPrice} discountAmount={discountAmount} isVoucherValid={isVoucherValid} isVerifyingVoucher={isVerifying} voucher={voucher} voucherStatus={voucherStatus} totalLessons={totalLessons} onVoucherChange={changeVoucher} onVerifyVoucher={verifyVoucher} onPurchase={openPaymentModal} />
            </section>

            <PaymentMethodModal course={course} open={isPaymentModalOpen} couponCode={isVoucherValid ? verifiedCoupon?.code : ""} finalPrice={finalPrice} discountAmount={discountAmount} onClose={closePaymentModal} />
        </div>
    );
}
