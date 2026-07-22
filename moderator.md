# Moderator US38-US43 Status

## Verification
- Backend compile: `mvn -q -DskipTests compile` passed.
- Frontend build: `npm run build` passed when run outside sandbox.
- Frontend `apiPath.js` now exports `API_REPORTS` and `API_REFUNDS`, so the previous missing-export white screen is resolved.

## US38 - Review Courses

### Flow
Moderator opens `/moderator/courses/review`, frontend calls `GET /api/courses/moderation/pending`, backend queries courses with `CourseStatus.PENDING`, and the UI shows the pending review queue plus course detail.

### Files / packages
- Frontend page: `frontend/src/features/course/pages/CourseModerationPage.jsx`
- Frontend API: `frontend/src/features/course/services/api/courseManagementService.js`
- Frontend route: `frontend/src/features/moderator/routes/moderatorRoutes.jsx`
- Backend controller: `backend/src/main/java/com/app/features/courses/controller/CourseController.java`
- Backend service: `backend/src/main/java/com/app/features/courses/service/ICourseService.java`
- Backend service impl: `backend/src/main/java/com/app/features/courses/service/impl/CourseService.java`
- Backend repository: `backend/src/main/java/com/app/features/courses/repository/ICourseRepository.java`
- Shared enum: `backend/src/main/java/com/app/features/model/enums/CourseStatus.java`

### Status
Core done. Data is loaded from DB, not mock.

### Missing / impact
- Backend role guard is still missing on moderation APIs, so any authenticated user may call them directly.
- Public course catalog/detail still risks exposing `PENDING` courses because public course APIs are not filtered to `PUBLISHED`.
- No quality/policy checklist or test coverage yet. This does not block the core queue, but weakens auditability.

## US39 - Approve Courses

### Flow
Moderator selects a pending course and clicks Approve. Frontend calls `POST /api/courses/moderation/{courseId}/approve`. Backend validates the course is `PENDING`, changes status to `PUBLISHED`, saves to DB, and frontend removes it from the pending queue.

### Files / packages
- Frontend page: `frontend/src/features/course/pages/CourseModerationPage.jsx`
- Frontend API: `frontend/src/features/course/services/api/courseManagementService.js`
- Backend controller: `backend/src/main/java/com/app/features/courses/controller/CourseController.java`
- Backend service: `backend/src/main/java/com/app/features/courses/service/ICourseService.java`
- Backend service impl: `backend/src/main/java/com/app/features/courses/service/impl/CourseService.java`
- Backend repository: `backend/src/main/java/com/app/features/courses/repository/ICourseRepository.java`
- Shared enum: `backend/src/main/java/com/app/features/model/enums/CourseStatus.java`

### Status
Core done. Status transition `PENDING -> PUBLISHED` is persisted to DB.

### Missing / impact
- Backend role guard, audit log, moderator note, and notification are still missing. Core approve works, but there is no trace/reason history beyond the course status update.

## US40 - Reject Courses

### Flow
Intended flow: Moderator rejects a `PENDING` course with a reason. Backend validates `PENDING`, changes status to `DRAFT`, and returns the updated detail.

### Files / packages
- Frontend page: `frontend/src/features/course/pages/CourseModerationPage.jsx`
- Frontend API: `frontend/src/features/course/services/api/courseManagementService.js`
- Backend DTO: `backend/src/main/java/com/app/features/courses/dto/request/CourseRejectionRequest.java`
- Backend controller: `backend/src/main/java/com/app/features/courses/controller/CourseController.java`
- Backend service: `backend/src/main/java/com/app/features/courses/service/ICourseService.java`
- Backend service impl: `backend/src/main/java/com/app/features/courses/service/impl/CourseService.java`
- Shared enum: `backend/src/main/java/com/app/features/model/enums/CourseStatus.java`

### Status
Backend core is done and frontend API/handler exist.

### Missing / impact
- The current `CourseModerationPage.jsx` has `rejectReason`, `rejectError`, and `handleRejectSelectedCourse`, but the JSX does not render a Reject button or rejection reason block in normal review mode.
- Impact: US40 cannot be completed through the UI. It can only work if the API is called directly or the missing UI block is added.
- Reason is logged only; it is not stored in DB, notification, or audit log. Instructor cannot see the rejection reason through the system.

## US41 - Hide Courses

### Flow
Moderator opens `/moderator/courses/hide`. Frontend calls `GET /api/courses/moderation/published`, backend loads `PUBLISHED` courses, moderator enters a hide reason and calls `POST /api/courses/moderation/{courseId}/hide`. Backend validates `PUBLISHED`, changes status to `HIDDEN`, and saves to DB.

### Files / packages
- Frontend page: `frontend/src/features/course/pages/CourseModerationPage.jsx`
- Frontend API: `frontend/src/features/course/services/api/courseManagementService.js`
- Backend DTO: `backend/src/main/java/com/app/features/courses/dto/request/CourseHideRequest.java`
- Backend controller: `backend/src/main/java/com/app/features/courses/controller/CourseController.java`
- Backend service: `backend/src/main/java/com/app/features/courses/service/ICourseService.java`
- Backend service impl: `backend/src/main/java/com/app/features/courses/service/impl/CourseService.java`
- Shared enum: `backend/src/main/java/com/app/features/model/enums/CourseStatus.java`

### Status
Core backend and frontend flow are implemented.

### Missing / impact
- Some UI labels still say pending/review while in hide mode, such as queue text and filter options. Impact is UX confusion, not a backend blocker.
- Hide reason is logged only; it is not stored in DB, notification, or audit log.
- Backend role guard is still missing.

## US42 - Manage Violation Reports

### Flow
Moderator opens `/moderator/reports/violations`. Frontend calls `GET /api/reports` or `GET /api/reports?status=...`. Moderator can mark `PENDING -> INVESTIGATING`, then close as `RESOLVED` or `DISMISSED`.

### Files / packages
- Frontend page: `frontend/src/features/report/pages/ViolationReportsPage.jsx`
- Frontend API: `frontend/src/features/report/services/reportService.js`
- Frontend route: `frontend/src/features/report/routes/reportRoutes.jsx`
- Frontend API constants: `frontend/src/api/apiPath.js`
- Backend controller: `backend/src/main/java/com/app/features/reports/controller/ReportController.java`
- Backend response DTO: `backend/src/main/java/com/app/features/reports/dto/response/ReportResponse.java`
- Backend repository: `backend/src/main/java/com/app/features/reports/repository/ReportRepository.java`
- Backend service: `backend/src/main/java/com/app/features/reports/service/IReportService.java`
- Backend service impl: `backend/src/main/java/com/app/features/reports/service/impl/ReportServiceImpl.java`
- Entity/enum: `backend/src/main/java/com/app/features/model/ReportEntity.java`, `backend/src/main/java/com/app/features/model/enums/ReportStatus.java`, `ReportTargetType.java`

### Status
Core done. Reports are loaded from DB and status transitions are persisted.

### Missing / impact
- Backend role guard is missing.
- No resolution note/reason field is captured. Impact: moderator can close reports, but cannot record decision details.
- Target display is generic like `COURSE #5`; it does not resolve target title/user/comment/review detail.

## US43 - Process Refund Requests

### Flow
Moderator opens `/moderator/transactions/refunds`. Frontend calls `GET /api/refunds` or `GET /api/refunds?status=...`. Moderator can approve `PENDING -> APPROVED`, reject `PENDING -> REJECTED`, and process `APPROVED -> PROCESSED`.

### Files / packages
- Frontend page: `frontend/src/features/transaction/pages/RefundRequestsPage.jsx`
- Frontend API: `frontend/src/features/transaction/services/refundService.js`
- Frontend route: `frontend/src/features/transaction/routes/transactionRoutes.jsx`
- Frontend API constants: `frontend/src/api/apiPath.js`
- Backend controller: `backend/src/main/java/com/app/features/refunds/controller/RefundController.java`
- Backend response DTO: `backend/src/main/java/com/app/features/refunds/dto/response/RefundResponse.java`
- Backend repository: `backend/src/main/java/com/app/features/refunds/repository/RefundRepository.java`
- Backend service: `backend/src/main/java/com/app/features/refunds/service/IRefundService.java`
- Backend service impl: `backend/src/main/java/com/app/features/refunds/service/impl/RefundServiceImpl.java`
- Entity/enum: `backend/src/main/java/com/app/features/model/RefundEntity.java`, `backend/src/main/java/com/app/features/model/enums/RefundStatus.java`
- Related payment data: `PaymentEntity`, `InvoiceEntity`, `CourseEntity`, `UserEntity`

### Status
Core done. Refunds are loaded from DB and status transitions are persisted.

### Missing / impact
- Backend role guard is missing.
- Reject has no reason input. Impact: refund can be rejected, but the platform cannot explain why.
- Processing does not call a real payment gateway refund API. Impact: status becomes `PROCESSED` internally, but no actual money movement is guaranteed.
