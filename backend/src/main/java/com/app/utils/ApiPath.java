package com.app.utils;

public final class ApiPath {
    private static final String BASE = "/api";
    public static final String API_ANSWERS = BASE + "/answers";
    public static final String API_ASSIGNMENTS = BASE + "/assignments";
    public static final String API_ASSIGNMENT_SUBMISSIONS = BASE + "/assignment-submissions";
    public static final String API_AUTH = BASE + "/auth";
    public static final String API_AUDIT_LOGS = BASE + "/audit-logs";
    public static final String API_BADGES = BASE + "/badges";
    public static final String API_CATEGORIES = BASE + "/categories";
    public static final String API_CERTIFICATES = BASE + "/certificates";
    public static final String API_CHAPTERS = BASE + "/chapters";
    public static final String API_COUPON = BASE + "/coupon";
    public static final String API_COURSE_ENROLLMENTS = BASE + "/course-enrollments";
    public static final String API_COURSE_REVIEWS = BASE + "/course-reviews";
    public static final String API_COURSES = BASE + "/courses";
    public static final String API_INVOICES = BASE + "/invoices";
    public static final String API_LESSON_DOCUMENTS = BASE + "/lesson-documents";
    public static final String API_LESSON_PROGRESS = BASE + "/lesson-progress";
    public static final String API_LESSON_QA = BASE + "/lesson-qa";
    public static final String API_LESSONS = BASE + "/lessons";
    public static final String API_NOTIFICATIONS = BASE + "/notifications";
    public static final String API_PAYMENTS = BASE + "/payments";
    public static final String API_PERMISSIONS = BASE + "/permissions";
    public static final String API_PLANS = BASE + "/plans";
    public static final String API_QUESTIONS = BASE + "/questions";
    public static final String API_QUIZ_ATTEMPTS = BASE + "/quiz-attempts";
    public static final String API_QUIZZES = BASE + "/quizzes";
    public static final String API_REFERRALS = BASE + "/referrals";
    public static final String API_REFUNDS = BASE + "/refunds";
    public static final String API_REPORTS = BASE + "/reports";
    public static final String API_ROLE_PERMISSIONS = BASE + "/role-permissions";
    public static final String API_ROLES = BASE + "/roles";
    public static final String API_STUDENT_ANSWERS = BASE + "/student-answers";
    public static final String API_SUBSCRIPTIONS = BASE + "/subscriptions";
    public static final String API_TAGS = BASE + "/tags";
    public static final String API_USERS = BASE + "/users";
    public static final String API_VERIFICATION_TOKENS = BASE + "/verification-tokens";
    public static final String API_COURSE_CHAPTERS = API_COURSES + "/{courseId}/chapters";
    public static final String API_COURSE_ENROLLMENTS_BY_COURSE = API_COURSES + "/{courseId}/enrollments";
    public static final String API_COURSE_PLANS = API_COURSES + "/{courseId}/plans";
    public static final String API_COURSE_REVIEWS_BY_COURSE = API_COURSES + "/{courseId}/reviews";
    public static final String API_COURSE_TAGS = API_COURSES + "/{courseId}/tags";
    public static final String API_LESSON_ASSIGNMENTS = API_LESSONS + "/{lessonId}/assignments";
    public static final String API_LESSON_DOCUMENTS_BY_LESSON = API_LESSONS + "/{lessonId}/documents";
    public static final String API_LESSON_PROGRESS_BY_LESSON = API_LESSONS + "/{lessonId}/progress";
    public static final String API_LESSON_QA_BY_LESSON = API_LESSONS + "/{lessonId}/questions";
    public static final String API_QUIZ_ANSWERS = API_QUIZZES + "/{quizId}/answers";
    public static final String API_QUIZ_ATTEMPTS_BY_QUIZ = API_QUIZZES + "/{quizId}/attempts";
    public static final String API_QUIZ_QUESTIONS = API_QUIZZES + "/{quizId}/questions";
    public static final String API_ROLE_PERMISSIONS_BY_ROLE = API_ROLES + "/{roleId}/permissions";
    public static final String API_USER_BADGES = API_USERS + "/{userId}/badges";
    public static final String API_USER_CHAPTER_PROGRESS = API_USERS + "/{userId}/chapter-progress";
    public static final String API_USER_COURSE_ENROLLMENTS = API_USERS + "/{userId}/course-enrollments";
    public static final String API_USER_LESSON_PROGRESS = API_USERS + "/{userId}/lesson-progress";
    public static final String API_USER_NOTIFICATIONS = API_USERS + "/{userId}/notifications";
    public static final String API_USER_QUIZ_ATTEMPTS = API_USERS + "/{userId}/quiz-attempts";
    public static final String API_USER_REFERRALS = API_USERS + "/{userId}/referrals";
    public static final String API_USER_ROLES = API_USERS + "/{userId}/roles";
    public static final String API_USER_STREAK = API_USERS + "/{userId}/streak";
    public static final String API_USER_SUBSCRIPTIONS = API_USERS + "/{userId}/subscriptions";

    private ApiPath() {
    }
}
