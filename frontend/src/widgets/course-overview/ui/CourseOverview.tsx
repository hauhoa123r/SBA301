import { useState } from "react";

import {
  calculateTotalLessons,
  CourseContent,
  CourseHeader,
  type CourseDetail,
} from "@/entities/course";
import { useAuth } from "@/features/auth";
import { CoursePurchaseCard, useCourseVoucher } from "@/features/enrollment";
import { PaymentMethodModal } from "@/features/payment";

export interface CourseOverviewProps {
  course: CourseDetail;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  const { user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const voucher = useCourseVoucher(course.price);
  const courseChapters = Array.isArray(course.chapters) ? course.chapters : [];
  const totalLessons = calculateTotalLessons(course);

  return (
    <div
      className="user-ui-scope relative overflow-hidden text-brand-textPrimary"
      style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12%] top-[-20%] h-[520px] w-[520px] rounded-full bg-brand-accent/15 blur-[120px]" />
        <div className="absolute bottom-[-18%] right-[-10%] h-[520px] w-[520px] rounded-full bg-brand-accentDeep/25 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <section
        aria-labelledby="course-detail-title"
        className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-10 xl:gap-14"
      >
        <section className="min-w-0">
          <CourseHeader course={course} />
          <CourseContent
            key={course.id}
            chapters={courseChapters}
            courseDuration={course.duration}
            totalLessons={totalLessons}
          />
        </section>

        <CoursePurchaseCard
          course={course}
          finalPrice={voucher.finalPrice}
          discountAmount={voucher.discountAmount}
          isVoucherValid={voucher.isValid}
          isVerifyingVoucher={voucher.isVerifying}
          voucher={voucher.voucher}
          voucherStatus={voucher.voucherStatus}
          totalLessons={totalLessons}
          onVoucherChange={voucher.changeVoucher}
          onVerifyVoucher={voucher.verifyVoucher}
          onPurchase={() => setIsPaymentModalOpen(true)}
        />
      </section>

      <PaymentMethodModal
        course={course}
        user={user}
        open={isPaymentModalOpen}
        couponCode={voucher.isValid ? voucher.verifiedCoupon?.code : ""}
        finalPrice={voucher.finalPrice}
        discountAmount={voucher.discountAmount}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}

