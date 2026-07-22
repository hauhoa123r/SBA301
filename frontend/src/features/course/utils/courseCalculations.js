const toSafeNumber = (value) => {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
};

export const calculateTotalLessons = (course) => {
    const totalLessons = toSafeNumber(course?.totalLessons);
    if (totalLessons !== null) return Math.max(0, totalLessons);

    const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
    return chapters.reduce((total, chapter) => total + (chapter?.lessons?.length ?? 0), 0);
};
