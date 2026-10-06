import { API_LEARNING, axiosClient as api } from "@/shared/api";

export async function getCourseLearningDetails(courseId) {
    const { data } = await api.get(`${API_LEARNING}/courses/${courseId}`);
    return normalizeLearningCourse(data);
}
export async function getCourseProgress(courseId) {
    const { data } = await api.get(`${API_LEARNING}/courses/${courseId}/progress`);
    return normalizeCourseProgress(data);
}
export async function updateLessonProgress(courseId, lessonId, completed = true) {
    const { data } = await api.put(`${API_LEARNING}/courses/${courseId}/lessons/${lessonId}/progress`, { completed });
    return normalizeCourseProgress(data);
}
export async function saveLessonPlayback(courseId, lessonId, payload) {
    const { data } = await api.put(`${API_LEARNING}/courses/${courseId}/lessons/${lessonId}/playback`, payload);
    return data;
}
export async function submitQuiz(courseId, quizId, payload) {
    const { data } = await api.post(`${API_LEARNING}/courses/${courseId}/quizzes/${quizId}/submissions`, payload);
    return normalizeCourseProgress(data);
}
export async function submitAssignment(courseId, assignmentId, text) {
    const { data } = await api.put(`${API_LEARNING}/courses/${courseId}/assignments/${assignmentId}/submission`, { text });
    return normalizeCourseProgress(data);
}
export async function getLearningActivity() {
    const { data } = await api.get(`${API_LEARNING}/activity`);
    return Array.isArray(data) ? data : [];
}

const normalizeCourseProgress = (progress) => ({
    ...progress,
    completedLessonIds: progress?.completedLessonIds || [],
    completedChapterIds: progress?.completedChapterIds || [],
    passedQuizIds: progress?.passedQuizIds || [],
    submittedAssignmentIds: progress?.submittedAssignmentIds || [],
    lessonPlayback: progress?.lessonPlayback || [],
    quizResults: progress?.quizResults || [],
    assignmentSubmissions: progress?.assignmentSubmissions || [],
});
const normalizeAssignment = (assignment) => ({
    ...assignment, deadline_days: assignment.deadlineDays, attachment_url: assignment.attachmentUrl,
});
const normalizeQuiz = (quiz) => quiz ? ({
    ...quiz, time_limit_minutes: quiz.timeLimitMinutes, pass_score: quiz.passScore,
    questions: (quiz.questions || []).map(question => ({ ...question, answers: question.answers || [] })),
}) : null;
const normalizeLearningCourse = (course) => course ? ({
    ...course, displayTitle: course.title, thumbnail_url: course.thumbnailUrl,
    chapters: (course.chapters || []).map(chapter => ({
        ...chapter, course_id: chapter.courseId, order_index: chapter.orderIndex, description: chapter.description || "",
        assignments: (chapter.assignments ?? (chapter.assignment ? [chapter.assignment] : [])).map(normalizeAssignment),
        quizzes: (chapter.quizzes || []).map(normalizeQuiz),
        lessons: (chapter.lessons || []).map(lesson => ({
            ...lesson, chapter_id: lesson.chapterId, video_url: lesson.videoUrl,
            duration_seconds: lesson.durationSeconds, order_index: lesson.orderIndex,
            quiz: normalizeQuiz(lesson.quiz),
            quizzes: (lesson.quizzes ?? (lesson.quiz ? [lesson.quiz] : [])).map(normalizeQuiz),
        })),
    })),
}) : null;
