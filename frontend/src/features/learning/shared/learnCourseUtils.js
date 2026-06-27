export const getInitialAnswers = (course) =>
    course.chapters.reduce((answers, chapter) => {
        chapter.lessons.forEach((lesson) => {
            lesson.quiz.questions.forEach((question) => {
                answers[question.id] = "";
            });
        });
        return answers;
    }, {});

export const buildLearningActivities = (course) => {
    const allLessons = course.chapters.flatMap((chapter) => chapter.lessons.map((lesson) => ({ ...lesson, chapter })));
    const allQuizzes = allLessons.map((lesson) => ({ ...lesson.quiz, lesson, chapter: lesson.chapter }));
    const allAssignments = course.chapters.map((chapter) => ({ ...chapter.assignment, chapter }));

    return {
        allLessons,
        allQuizzes,
        allAssignments,
        totalActivities: allLessons.length + allQuizzes.length + allAssignments.length,
    };
};

export const getChapterStats = ({ course, completedLessons, passedQuizzes, submittedAssignments }) =>
    course.chapters.reduce((stats, chapter) => {
        const done = chapter.lessons.reduce((sum, lesson) => {
            const lessonDone = completedLessons.has(lesson.id) ? 1 : 0;
            const quizDone = passedQuizzes.has(lesson.quiz.id) ? 1 : 0;
            return sum + lessonDone + quizDone;
        }, submittedAssignments.has(chapter.assignment.id) ? 1 : 0);

        stats[chapter.id] = { done, total: chapter.lessons.length * 2 + 1 };
        return stats;
    }, {});

export const getCompletedChapters = ({ course, completedLessons, passedQuizzes, submittedAssignments }) =>
    course.chapters.filter((chapter) => {
        const lessonDone = chapter.lessons.every((lesson) => completedLessons.has(lesson.id) && passedQuizzes.has(lesson.quiz.id));
        return lessonDone && submittedAssignments.has(chapter.assignment.id);
    });
