import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../app/provider/useAuth";
import { hasAnyRole } from "../../../shared/utils/roles";
import { createPayment } from "../services/api/payment.service";
import { getPaymentErrorMessage } from "../utils/paymentError";

const MISSING_COURSE_ERROR_MESSAGE = "Không thể tạo thanh toán vì thiếu thông tin khóa học.";

const hasCourseId = (course) => {
    const courseId = course?.id;
    return courseId !== undefined && courseId !== null && courseId !== "";
};

export default function useCreateCoursePayment() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const isSubmittingRef = useRef(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const clearError = useCallback(() => {
        if (isMountedRef.current) {
            setError("");
        }
    }, []);

    const createCoursePayment = useCallback(
        async ({ course, couponCode, onUnauthorizedRole } = {}) => {
            if (isSubmittingRef.current) return null;

            if (!user) {
                const returnTo = `${location.pathname}${location.search}`;
                navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
                return null;
            }

            if (!hasAnyRole(user, ["STUDENT"])) {
                onUnauthorizedRole?.();
                return null;
            }

            if (!hasCourseId(course)) {
                setError(MISSING_COURSE_ERROR_MESSAGE);
                return null;
            }

            isSubmittingRef.current = true;
            setIsSubmitting(true);
            setError("");

            try {
                const payment = await createPayment({
                    courseId: course.id,
                    couponCode,
                });

                navigate("/payment/checkout", {
                    state: {
                        payment,
                        course,
                        couponCode,
                    },
                });

                return payment;
            } catch (err) {
                if (isMountedRef.current) {
                    setError(getPaymentErrorMessage(err));
                }
                return null;
            } finally {
                isSubmittingRef.current = false;
                if (isMountedRef.current) {
                    setIsSubmitting(false);
                }
            }
        },
        [location.pathname, location.search, navigate, user]
    );

    return {
        createCoursePayment,
        isSubmitting,
        error,
        clearError,
    };
}
