package com.app.features.learning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgressResponse {
    private Long courseId;
    private List<Long> completedLessonIds;
    private List<Long> completedChapterIds;
    private boolean courseCompleted;
    private List<Long> passedQuizIds;
    private List<Long> submittedAssignmentIds;
    private List<LessonPlaybackResponse> lessonPlayback;
    private List<QuizResultResponse> quizResults;
    private List<AssignmentSubmissionResponse> assignmentSubmissions;
    private int completedActivities;
    private int totalActivities;
    private int progressPercent;
}
