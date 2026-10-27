import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";

import LearnCourseLayout from "@/features/learning/layouts/LearnCourseLayout.jsx";
import LearningLayout from "@/features/learning/layouts/LearningLayout.jsx";
import LearnCoursePage from "@/features/learning/pages/LearnCoursePage.jsx";
import StartLearningPage from "@/features/learning/pages/StartLearningPage.jsx";
import ViewProfilePage from "@/features/user/pages/ViewProfilePage.jsx";
import { AboutPage } from "@/pages/about";
import { BlogPage } from "@/pages/blog";
import { ContactPage } from "@/pages/contact";
import { CourseDetailPage } from "@/pages/course-detail";
import { CourseListPage } from "@/pages/course-list";
import { ForgotPasswordPage } from "@/pages/forgot-password";
import { HomePage } from "@/pages/home";
import { SubscriptionsPage } from "@/pages/subscriptions/SubscriptionsPage";
import { LoginPage } from "@/pages/login";
import { NotFoundPage } from "@/pages/not-found";
import { OAuthCallbackPage } from "@/pages/oauth-callback";
import { PaymentCheckoutPage } from "@/pages/payment-checkout";
import { PaymentResultPage } from "@/pages/payment-result";
import { RegisterPage } from "@/pages/register";
import { ResetPasswordPage } from "@/pages/reset-password";
import { VerifyEmailPage } from "@/pages/verify-email";

import { MainLayout } from "./MainLayout";
import { RoleRoute } from "./RoleRoute";
const AdminRouteLayout = lazy(() => import("@/features/admin-dashboard/AdminRouteLayout").then(m => ({ default: m.AdminRouteLayout })));
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard/AdminDashboardPage")
  .then((module) => ({ default: module.AdminDashboardPage })));
const OverviewDashboardPage = lazy(() => import("@/pages/admin-dashboard/OverviewDashboardPage").then(m => ({ default: m.OverviewDashboardPage })));
const EnrollmentManagementPage = lazy(() => import("@/pages/admin-dashboard/EnrollmentManagementPage").then(m => ({ default: m.EnrollmentManagementPage })));
const PaymentAnalyticsPage = lazy(() => import("@/pages/admin-dashboard/PaymentAnalyticsPage").then(m => ({ default: m.PaymentAnalyticsPage })));
const StudentManagementPage = lazy(() => import("@/pages/admin-dashboard/StudentManagementPage")
  .then((module) => ({ default: module.StudentManagementPage })));
const StudentDetailPage = lazy(() => import("@/pages/admin-dashboard/StudentManagementPage")
  .then((module) => ({ default: module.StudentDetailPage })));
const SubscriptionPlanManagementPage = lazy(() => import("@/pages/admin-dashboard/SubscriptionPlanManagementPage")
  .then((module) => ({ default: module.SubscriptionPlanManagementPage })));
const AuthenticationSettingsPage = lazy(() => import("@/pages/admin-dashboard/AuthenticationSettingsPage")
  .then((module) => ({ default: module.AuthenticationSettingsPage })));
const FeedbackManagementPage = lazy(() => import("@/pages/admin-dashboard/FeedbackManagementPage")
  .then((module) => ({ default: module.FeedbackManagementPage })));
const FeedbackStatisticsPage = lazy(() => import("@/pages/admin-dashboard/FeedbackStatisticsPage")
  .then((module) => ({ default: module.FeedbackStatisticsPage })));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải không gian quản trị…</div>}><AdminRouteLayout /></Suspense></RoleRoute>}>
          <Route path="feedback" element={<FeedbackManagementPage />} />
          <Route path="feedback/statistics" element={<FeedbackStatisticsPage />} />
          <Route path="dashboard" element={<OverviewDashboardPage />} />
          <Route path="catalog-dashboard" element={<AdminDashboardPage />} />
          <Route path="enrollments" element={<EnrollmentManagementPage />} />
          <Route path="payments" element={<PaymentAnalyticsPage />} />
          <Route path="students" element={<StudentManagementPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="subscription-plans" element={<SubscriptionPlanManagementPage />} />
          <Route path="auth-settings" element={<AuthenticationSettingsPage />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="feedback" element={<Navigate to="/contact" replace />} />
          <Route path="courses" element={<CourseListPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="contact" element={<ContactPage />} />

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="oauth/callback" element={<OAuthCallbackPage />} />

          <Route
            path="payment/checkout"
            element={
              <RoleRoute requiredRole="STUDENT">
                <PaymentCheckoutPage />
              </RoleRoute>
            }
          />
          <Route
            path="payment/result"
            element={
              <RoleRoute requiredRole="STUDENT">
                <PaymentResultPage />
              </RoleRoute>
            }
          />
          <Route
            path="user/profile"
            element={
              <RoleRoute requiredRole="STUDENT">
                <ViewProfilePage />
              </RoleRoute>
            }
          />

          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="learning"
          element={
            <RoleRoute requiredRole="STUDENT">
              <LearningLayout />
            </RoleRoute>
          }
        >
          <Route index element={<StartLearningPage />} />
        </Route>
        <Route
          path="learning/courses/:courseId"
          element={
            <RoleRoute requiredRole="STUDENT">
              <LearnCourseLayout />
            </RoleRoute>
          }
        >
          <Route index element={<LearnCoursePage />} />
          <Route path="lessons/:lessonId" element={<LearnCoursePage />} />
          <Route path="quizzes/:quizId" element={<LearnCoursePage />} />
          <Route path="assignments/:assignmentId" element={<LearnCoursePage />} />
          <Route
            path="chapters/:chapterId/assignment"
            element={<LearnCoursePage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
