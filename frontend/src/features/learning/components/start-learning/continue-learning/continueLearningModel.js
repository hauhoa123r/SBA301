const readField = (source, ...keys) => {
    if (!source || typeof source !== "object") return undefined;
    return keys.map((key) => source[key]).find((value) => value !== undefined && value !== null);
};

const firstPresent = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeCount = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : null;
};

const normalizeId = (value) => {
    if (value === undefined || value === null || value === "") return null;
    return value;
};

const getLessonDuration = (lesson) => {
    const seconds = normalizeCount(readField(lesson, "durationSeconds", "duration_seconds"));
    if (!seconds) return null;
    return `${Math.max(1, Math.ceil(seconds / 60))} phút`;
};

const getFirstCourseContent = (course) => {
    const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
    const withLesson = chapters.find((item) => Array.isArray(item?.lessons) && item.lessons.length > 0);
    const chapter = withLesson || chapters[0] || null;
    const lessons = Array.isArray(chapter?.lessons) ? chapter.lessons : [];
    const completed = new Set((course?.progress?.completedLessonIds || []).map(Number));
    for (const item of chapters) {
        const next = (item.lessons || []).find(lesson => !completed.has(Number(lesson.id)));
        if (next) return { chapter: item, lesson: next };
    }
    return { chapter, lesson: lessons[0] || null };
};

const courseRoot = (courseId) =>
    courseId === null ? "/learning" : `/learning/courses/${encodeURIComponent(String(courseId))}`;

export function buildContinueLearningModel({
    course,
    stats = {},
    statsCourseId,
    statsCourseTitle,
    completedActivities,
    totalActivities,
    openLessons,
    earnedCups,
    totalCups,
} = {}) {
    const resolvedStatsId = normalizeId(firstPresent(statsCourseId, readField(stats, "courseId", "course_id")));
    const sourceCourseId = normalizeId(readField(course, "id", "courseId", "course_id"));
    const courseId = resolvedStatsId ?? sourceCourseId;
    const isCourseMismatch = resolvedStatsId !== null
        && sourceCourseId !== null
        && String(resolvedStatsId) !== String(sourceCourseId);

    const statsTitle = firstPresent(statsCourseTitle, readField(stats, "courseTitle", "course_title"));
    const sourceTitle = firstPresent(
        readField(course, "displayTitle", "display_title"),
        readField(course, "title"),
    );
    const courseTitle = statsTitle || (!isCourseMismatch ? sourceTitle : null) || "Khóa học của bạn";
    const { chapter, lesson } = isCourseMismatch
        ? { chapter: null, lesson: null }
        : getFirstCourseContent(course);
    const lessonId = normalizeId(readField(lesson, "id", "lessonId", "lesson_id"));
    const rootDestination = courseRoot(courseId);

    const completed = normalizeCount(firstPresent(
        completedActivities,
        readField(stats, "completedActivities", "completed_activities"),
    )) ?? 0;
    const total = normalizeCount(firstPresent(
        totalActivities,
        readField(stats, "totalActivities", "total_activities"),
    )) ?? 0;
    const boundedCompleted = total > 0 ? Math.min(completed, total) : completed;
    const availableLessons = normalizeCount(firstPresent(
        openLessons,
        readField(stats, "openLessons", "open_lessons"),
    ));
    const cupsEarned = normalizeCount(firstPresent(
        earnedCups,
        readField(stats, "earnedCups", "earned_cups"),
    ));
    const cupsTotal = normalizeCount(firstPresent(
        totalCups,
        readField(stats, "totalCups", "total_cups"),
    ));
    const chapterOrder = readField(chapter, "orderIndex", "order_index");

    return {
        chapterLabel: chapterOrder !== undefined ? `Chương ${chapterOrder}` : null,
        chapterTitle: firstPresent(readField(chapter, "title")) || null,
        courseTitle,
        cupsText: cupsEarned === null && cupsTotal === null
            ? null
            : `${cupsEarned ?? "—"}${cupsTotal !== null ? `/${cupsTotal}` : ""}`,
        destination: lessonId === null
            ? rootDestination
            : `${rootDestination}/lessons/${encodeURIComponent(String(lessonId))}`,
        isCourseMismatch,
        lessonDuration: getLessonDuration(lesson),
        lessonTitle: firstPresent(readField(lesson, "title")) || null,
        openLessonsText: availableLessons === null ? null : String(availableLessons),
        progress: {
            available: total > 0,
            completed: boundedCompleted,
            total,
            value: total > 0 ? Math.min(100, Math.floor((boundedCompleted / total) * 100)) : 0,
        },
        thumbnailUrl: isCourseMismatch
            ? null
            : firstPresent(readField(course, "thumbnailUrl", "thumbnail_url")) || null,
    };
}

export default buildContinueLearningModel;
