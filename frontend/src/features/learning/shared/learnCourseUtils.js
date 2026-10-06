export const chapterAssignments = (chapter) => chapter.assignments ?? (chapter.assignment ? [chapter.assignment] : []);
export const lessonQuizzes = (lesson) => lesson.quizzes ?? (lesson.quiz ? [lesson.quiz] : []);

export const buildLearningActivities = (course) => {
    const chapters = course?.chapters || [];
    const allLessons = chapters.flatMap(chapter => (chapter.lessons || []).map(lesson => ({ ...lesson, chapter })));
    const allQuizzes = [
        ...allLessons.flatMap(lesson => lessonQuizzes(lesson).map(quiz => ({ ...quiz, lesson, chapter: lesson.chapter }))),
        ...chapters.flatMap(chapter => (chapter.quizzes || []).map(quiz => ({ ...quiz, chapter }))),
    ];
    const allAssignments = chapters.flatMap(chapter => chapterAssignments(chapter).map(assignment => ({ ...assignment, chapter })));
    return { allLessons, allQuizzes, allAssignments, totalActivities: allLessons.length + allQuizzes.length + allAssignments.length };
};

export const getInitialAnswers = () => ({});

export const getChapterStats = ({ course, completedLessons = new Set(), passedQuizzes = new Set(), submittedAssignments = new Set() }) => {
    const activities = buildLearningActivities(course);
    return (course?.chapters || []).reduce((stats, chapter) => {
        const lessons = activities.allLessons.filter(item => item.chapter.id === chapter.id);
        const quizzes = activities.allQuizzes.filter(item => item.chapter.id === chapter.id);
        const assignments = activities.allAssignments.filter(item => item.chapter.id === chapter.id);
        const doneLessons = lessons.filter(item => completedLessons.has(item.id)).length;
        stats[chapter.id] = {
            doneLessons,
            done: doneLessons + quizzes.filter(item => passedQuizzes.has(item.id)).length
                + assignments.filter(item => submittedAssignments.has(item.id)).length,
            total: lessons.length + quizzes.length + assignments.length,
        };
        return stats;
    }, {});
};

export const progressSets = (progress) => ({
    completedLessons: new Set((progress?.completedLessonIds || []).map(Number)),
    passedQuizzes: new Set((progress?.passedQuizIds || []).map(Number)),
    submittedAssignments: new Set((progress?.submittedAssignmentIds || []).map(Number)),
});

export const quizAnswerPayload = (quiz, answers) => ({
    answers: quiz.questions.map(question => {
        const value = answers[question.id];
        const type = question.questionType || question.question_type;
        if (type === "MATCHING") return { questionId: question.id, matches: value || {} };
        if (type === "FILL_IN_BLANK" || type === "SPEAKING") return { questionId: question.id, text: String(value || "") };
        return { questionId: question.id, answerIds: Array.isArray(value) ? value : value ? [Number(value)] : [] };
    }),
});

export const answersFromResults = (results) => Object.fromEntries((results || []).flatMap(result => (result.answers || [])
    .map(answer => [answer.questionId, answer.text ?? (Object.keys(answer.matches || {}).length ? answer.matches : answer.answerIds || [])])));

export const resumeLesson = (course, progress) => {
    const { allLessons } = buildLearningActivities(course);
    const done = new Set((progress?.completedLessonIds || []).map(Number));
    return allLessons.find(lesson => !done.has(lesson.id)) || allLessons[0] || null;
};
