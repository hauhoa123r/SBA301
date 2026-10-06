package com.app.features.admin.service;

import com.app.exception.*;
import com.app.features.learning.repository.IAssignmentSubmissionLearningRepository;
import com.app.features.learning.service.impl.LearningProgressServiceImpl;
import com.app.features.model.AssignmentSubmissionEntity;
import com.app.features.model.enums.AssignmentSubmissionStatus;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service @RequiredArgsConstructor
public class AssignmentReviewService {
    private final IAssignmentSubmissionLearningRepository submissions;
    private final LearningProgressServiceImpl progress;
    private final com.app.features.learning.repository.ICourseEnrollmentRepository enrollments;
    private final jakarta.persistence.EntityManager entityManager;

    @Transactional(readOnly = true)
    public SubmissionPage list(String status, int page) {
        if (page < 0) throw new BadRequestException("Trang không hợp lệ.");
        var pageable = PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id"));
        var result = status.isBlank() ? submissions.findAll(pageable) : submissions.findByStatus(parseStatus(status), pageable);
        return new SubmissionPage(result.getContent().stream().map(this::response).toList(), result.getTotalElements(), result.getTotalPages(), page);
    }

    @Transactional
    public ReviewResponse grade(Long id, GradeRequest request) {
        AssignmentSubmissionStatus status = parseStatus(request.status());
        if (status == AssignmentSubmissionStatus.SUBMITTED || (status == AssignmentSubmissionStatus.GRADED && request.score() == null)
                || (status == AssignmentSubmissionStatus.NEEDS_REVISION && (request.feedback() == null || request.feedback().isBlank())))
            throw new BadRequestException("Nhập điểm khi chấm bài hoặc nhận xét khi yêu cầu sửa bài.");
        var submission = submissions.findById(id).orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài nộp."));
        // Serialize grading with student updates through the same enrollment row.
        var chapter = submission.getAssignment().getLesson().getChapter();
        enrollments.lockForProgress(submission.getUser().getId(), chapter.getCourseEntity().getId());
        entityManager.refresh(submission);
        submission.setStatus(status);
        submission.setScore(status == AssignmentSubmissionStatus.GRADED ? request.score() : null);
        submission.setTeacherFeedback(request.feedback() == null ? null : request.feedback().trim());
        submission.setGradedAt(Instant.now());
        submissions.saveAndFlush(submission);
        progress.recalculateRecordedActivities(submission.getUser().getId(), chapter.getCourseEntity().getId(), chapter);
        return response(submission);
    }

    private AssignmentSubmissionStatus parseStatus(String status) {
        try { return AssignmentSubmissionStatus.valueOf(status); }
        catch (IllegalArgumentException e) { throw new BadRequestException("Trạng thái bài nộp không hợp lệ."); }
    }
    private ReviewResponse response(AssignmentSubmissionEntity submission) {
        return new ReviewResponse(submission.getId(), submission.getUser().getFullName(), submission.getAssignment().getTitle(),
            submission.getAssignment().getLesson().getChapter().getCourseEntity().getTitle(), submission.getSubmissionText(),
            submission.getStatus().name(), submission.getScore(), submission.getTeacherFeedback(), submission.getSubmittedAt());
    }
    public record GradeRequest(@NotBlank String status, @Min(0) @Max(100) Integer score, @Size(max = 4000) String feedback) { }
    public record ReviewResponse(Long id, String studentName, String assignmentTitle, String courseTitle, String text,
                                 String status, Integer score, String feedback, Instant submittedAt) { }
    public record SubmissionPage(List<ReviewResponse> content, long totalElements, int totalPages, int page) { }
}
