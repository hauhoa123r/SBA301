import api from "../../../api/axios";
import { API_LEARNING } from "../../../api/apiPath";

export async function getCourseLearningDetails(courseId) {
    const response = await api.get(`${API_LEARNING}/courses/${courseId}`);
    return normalizeLearningCourse(response.data);
}

export async function getCourseProgress(courseId) {
    const response = await api.get(`${API_LEARNING}/courses/${courseId}/progress`);
    return normalizeCourseProgress(response.data);
}

export async function updateLessonProgress(courseId, lessonId, completed = true) {
    const response = await api.put(
        `${API_LEARNING}/courses/${courseId}/lessons/${lessonId}/progress`,
        { completed }
    );
    return normalizeCourseProgress(response.data);
}

const normalizeCourseProgress = (progress) => ({
    courseId: progress?.courseId ?? null,
    completedLessonIds: Array.isArray(progress?.completedLessonIds) ? progress.completedLessonIds : [],
    completedChapterIds: Array.isArray(progress?.completedChapterIds) ? progress.completedChapterIds : [],
    courseCompleted: Boolean(progress?.courseCompleted),
});

const normalizeLearningCourse = (course) => {
    if (!course) return null;

    return {
        ...course,
        displayTitle: course.displayTitle || course.title,
        thumbnail_url: course.thumbnail_url || course.thumbnailUrl,
        chapters: (course.chapters || []).map((chapter) => ({
            ...chapter,
            course_id: chapter.course_id || chapter.courseId,
            order_index: chapter.order_index ?? chapter.orderIndex,
            description: chapter.description || "",
            lessons: (chapter.lessons || []).map((lesson) => ({
                ...lesson,
                chapter_id: lesson.chapter_id || lesson.chapterId,
                video_url: lesson.video_url || lesson.videoUrl,
                duration_seconds: lesson.duration_seconds ?? lesson.durationSeconds,
                order_index: lesson.order_index ?? lesson.orderIndex,
                quiz: normalizeQuiz(lesson.quiz),
            })),
        })),
    };
};

const normalizeQuiz = (quiz) => {
    if (!quiz) return null;
    return {
        ...quiz,
        type: quiz.type || "SINGLE_CHOICE",
        time_limit_minutes: quiz.time_limit_minutes ?? quiz.timeLimitMinutes,
        pass_score: quiz.pass_score ?? quiz.passScore,
        questions: (quiz.questions || []).map((question) => ({
            ...question,
            order_index: question.order_index ?? question.orderIndex,
            question_type: question.question_type || question.questionType,
            answers: (question.answers || []).map((answer) => ({
                ...answer,
                is_correct: answer.is_correct ?? answer.isCorrect,
            })),
        })),
    };
};
