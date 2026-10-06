import { describe, it, expect } from "vitest";
import { buildLearningActivities, getChapterStats, progressSets, quizAnswerPayload, answersFromResults, resumeLesson } from "./learnCourseUtils";
const course = { chapters: [
    { id: 1, lessons: [{ id: 11, quizzes: [{ id: 21 }, { id: 22 }] }, { id: 12, quizzes: [] }], quizzes: [{ id: 23 }], assignments: [{ id: 31 }, { id: 32 }] },
    { id: 2, lessons: [], quizzes: [], assignments: [] },
] };
describe("learning progress", () => {
    it("includes every lesson quiz, chapter quiz and assignment", () => {
        const result = buildLearningActivities(course);
        expect(result.totalActivities).toBe(7);
        expect(result.allQuizzes.map(item => item.id)).toEqual([21, 22, 23]);
        expect(result.allAssignments.map(item => item.id)).toEqual([31, 32]);
    });
    it("counts every activity and handles empty chapters", () => {
        const result = getChapterStats({ course, ...progressSets({ completedLessonIds: [11, 12], passedQuizIds: [21], submittedAssignmentIds: [31] }) });
        expect(result[1]).toEqual({ doneLessons: 2, done: 4, total: 7 });
        expect(result[2]).toEqual({ doneLessons: 0, done: 0, total: 0 });
    });
    it("resumes the first unfinished lesson", () => {
        expect(resumeLesson(course, { completedLessonIds: [11] }).id).toBe(12);
        expect(resumeLesson({ chapters: [] }, {})).toBeNull();
    });
    it("sends answers instead of client scores", () => {
        const quiz = { questions: [{ id: 1, questionType: "MULTIPLE_CHOICE" }, { id: 2, questionType: "SPEAKING" }, { id: 3, questionType: "MATCHING" }] };
        expect(quizAnswerPayload(quiz, { 1: [10, 11], 2: "你好", 3: { 31: "Hello" } })).toEqual({ answers: [
            { questionId: 1, answerIds: [10, 11] }, { questionId: 2, text: "你好" }, { questionId: 3, matches: { 31: "Hello" } },
        ] });
    });
    it("restores choice, text and matching answers", () => {
        expect(answersFromResults([{ answers: [
            { questionId: 1, answerIds: [10] }, { questionId: 2, text: "你好" }, { questionId: 3, matches: { 31: "A" } },
        ] }])).toEqual({ 1: [10], 2: "你好", 3: { 31: "A" } });
    });
});

