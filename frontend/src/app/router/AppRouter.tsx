import { BrowserRouter, Route, Routes } from "react-router-dom";
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
const AdminDashboardPage = lazy(() => import("@/pages/admin-dashboard/AdminDashboardPage")
  .then((module) => ({ default: module.AdminDashboardPage })));
const AssignmentReviewPage = lazy(() => import("@/pages/admin-dashboard/AssignmentReviewPage")
  .then((module) => ({ default: module.AssignmentReviewPage })));
const StudentManagementPage = lazy(() => import("@/pages/admin-dashboard/StudentManagementPage")
  .then((module) => ({ default: module.StudentManagementPage })));
const StudentDetailPage = lazy(() => import("@/pages/admin-dashboard/StudentManagementPage")
  .then((module) => ({ default: module.StudentDetailPage })));
const SubscriptionPlanManagementPage = lazy(() => import("@/pages/admin-dashboard/SubscriptionPlanManagementPage")
  .then((module) => ({ default: module.SubscriptionPlanManagementPage })));
const AuthenticationSettingsPage = lazy(() => import("@/pages/admin-dashboard/AuthenticationSettingsPage")
  .then((module) => ({ default: module.AuthenticationSettingsPage })));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin/dashboard" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải Dashboard…</div>}><AdminDashboardPage /></Suspense></RoleRoute>} />
        <Route path="admin/assignments" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải bài nộp…</div>}><AssignmentReviewPage /></Suspense></RoleRoute>} />
        <Route path="admin/students" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải học viên…</div>}><StudentManagementPage /></Suspense></RoleRoute>} />
        <Route path="admin/students/:id" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải học viên…</div>}><StudentDetailPage /></Suspense></RoleRoute>} />
        <Route path="admin/subscription-plans" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải gói học…</div>}><SubscriptionPlanManagementPage /></Suspense></RoleRoute>} />
        <Route path="admin/auth-settings" element={<RoleRoute requiredRole="ADMIN"><Suspense fallback={<div role="status" className="p-8">Đang tải cài đặt…</div>}><AuthenticationSettingsPage /></Suspense></RoleRoute>} />
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
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
