export const getInitialAnswers = (course) => {
    if (!course || !course.chapters) return {};
    return course.chapters.reduce((answers, chapter) => {
        if (chapter.lessons) {
            chapter.lessons.forEach((lesson) => {
                if (lesson.quiz && lesson.quiz.questions) {
                    lesson.quiz.questions.forEach((question) => {
                        answers[question.id] = "";
                    });
                }
            });
        }
        return answers;
    }, {});
};

export const buildLearningActivities = (course) => {
    if (!course || !course.chapters) {
        return { allLessons: [], allQuizzes: [], allAssignments: [], totalActivities: 0 };
    }
    const allLessons = course.chapters.flatMap((chapter) => 
        chapter.lessons ? chapter.lessons.map((lesson) => ({ ...lesson, chapter })) : []
    );
    const allQuizzes = allLessons
        .filter((lesson) => lesson.quiz)
        .map((lesson) => ({ ...lesson.quiz, lesson, chapter: lesson.chapter }));
    const allAssignments = course.chapters
        .filter((chapter) => chapter.assignment)
        .map((chapter) => ({ ...chapter.assignment, chapter }));

    return {
        allLessons,
        allQuizzes,
        allAssignments,
        totalActivities: allLessons.length + allQuizzes.length + allAssignments.length,
    };
};

export const getChapterStats = ({ course, completedLessons }) => {
    if (!course || !course.chapters) return {};
    return course.chapters.reduce((stats, chapter) => {
        const lessons = chapter.lessons || [];
        const done = lessons.filter((lesson) => completedLessons.has(lesson.id)).length;

        stats[chapter.id] = { done, total: lessons.length };
        return stats;
    }, {});
};
