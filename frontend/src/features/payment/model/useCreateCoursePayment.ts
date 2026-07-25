import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { CourseDetail } from "@/entities/course";
import type { Payment } from "@/entities/payment";
import { hasAnyRole, type User } from "@/entities/user";

import { createPayment } from "../api/paymentApi";
import { getPaymentErrorMessage } from "../lib/paymentError";

const MISSING_COURSE_ERROR_MESSAGE =
  "Không thể tạo thanh toán vì thiếu thông tin khóa học.";

function hasCourseId(
  course: CourseDetail | null | undefined,
): course is CourseDetail & { id: number } {
  const courseId = course?.id;
  return courseId !== undefined && courseId !== null;
}

export interface CreateCoursePaymentOptions {
  course?: CourseDetail | null;
  couponCode?: string;
  onUnauthorizedRole?: () => void;
}

export interface CreateCoursePaymentModel {
  createCoursePayment: (
    options?: CreateCoursePaymentOptions,
  ) => Promise<Payment | null>;
  isSubmitting: boolean;
  error: string;
  clearError: () => void;
}

export function useCreateCoursePayment(user: User | null): CreateCoursePaymentModel {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isSubmittingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearError = useCallback((): void => {
    if (isMountedRef.current) {
      setError("");
    }
  }, []);

  const createCoursePayment = useCallback(
    async ({
      course,
      couponCode,
      onUnauthorizedRole,
    }: CreateCoursePaymentOptions = {}): Promise<Payment | null> => {
      if (isSubmittingRef.current) return null;

      if (!user) {
        const returnTo = `${location.pathname}${location.search}`;
        void navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
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

        void navigate("/payment/checkout", {
          state: {
            payment,
            course,
            couponCode,
          },
        });

        return payment;
      } catch (requestError: unknown) {
        if (isMountedRef.current) {
          setError(getPaymentErrorMessage(requestError));
        }
        return null;
      } finally {
        isSubmittingRef.current = false;
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [location.pathname, location.search, navigate, user],
  );

  return {
    createCoursePayment,
    isSubmitting,
    error,
    clearError,
  };
}
