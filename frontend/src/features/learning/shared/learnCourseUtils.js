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

export const getChapterStats = ({ course, completedLessons, passedQuizzes, submittedAssignments }) => {
    if (!course || !course.chapters) return {};
    return course.chapters.reduce((stats, chapter) => {
        const lessons = chapter.lessons || [];
        const assignmentBase = (chapter.assignment && submittedAssignments.has(chapter.assignment.id)) ? 1 : 0;
        
        const done = lessons.reduce((sum, lesson) => {
            const lessonDone = completedLessons.has(lesson.id) ? 1 : 0;
            const quizDone = (lesson.quiz && passedQuizzes.has(lesson.quiz.id)) ? 1 : 0;
            return sum + lessonDone + quizDone;
        }, assignmentBase);

        const totalQuizCount = lessons.filter(l => l.quiz).length;
        const totalAssignmentCount = chapter.assignment ? 1 : 0;

        stats[chapter.id] = { done, total: lessons.length + totalQuizCount + totalAssignmentCount };
        return stats;
    }, {});
};

export const getCompletedChapters = ({ course, completedLessons, passedQuizzes, submittedAssignments }) => {
    if (!course || !course.chapters) return [];
    return course.chapters.filter((chapter) => {
        const lessons = chapter.lessons || [];
        const lessonDone = lessons.every((lesson) => {
            const lessonCompleted = completedLessons.has(lesson.id);
            const quizCompleted = !lesson.quiz || passedQuizzes.has(lesson.quiz.id);
            return lessonCompleted && quizCompleted;
        });
        const assignmentCompleted = !chapter.assignment || submittedAssignments.has(chapter.assignment.id);
        return lessonDone && assignmentCompleted;
    });
};
