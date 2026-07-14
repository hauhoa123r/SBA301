import { useOutletContext } from "react-router-dom";
import ChapterAssignmentPanel from "../../assignment/components/ChapterAssignmentPanel";
import LessonQuizPanel from "../../quiz/components/LessonQuizPanel";
import ChapterList from "../components/learn-course/ChapterList";
import CourseHero from "../components/learn-course/CourseHero";
import LessonPanel from "../components/learn-course/LessonPanel";

export default function LearnCoursePage() {
    const {
        answers,
        assignmentText,
        activeChapter,
        activeLesson,
        activeQuiz,
        activeAssignment,
        chapterStats,
        completedChapters,
        completedCount,
        completedLessons,
        course,
        handleAssignmentSubmit,
        handleQuizSubmit,
        handleQuizRetake,
        mode,
        progress,
        quizResults,
        setAnswers,
        setAssignmentText,
        setCompletedLessons,
        submittedAssignments,
        totalActivities,
        goLesson,
        goQuiz,
    } = useOutletContext();

    return (
        <>
            <CourseHero
                course={course}
                progress={progress}
                completedCount={completedCount}
                totalActivities={totalActivities}
                completedChapters={completedChapters.length}
            />

            {mode === "lesson" && (
                <LessonPanel
                    lesson={activeLesson}
                    isCompleted={completedLessons.has(activeLesson.id)}
                    onComplete={() => setCompletedLessons((prev) => new Set(prev).add(activeLesson.id))}
                    onQuiz={() => activeLesson.quiz && goQuiz(activeLesson.quiz.id)}
                />
            )}

            {mode === "quiz" && (
                <LessonQuizPanel
                    quiz={activeQuiz}
                    answers={answers}
                    result={quizResults[activeQuiz.id]}
                    onAnswer={(questionId, answerId) => setAnswers((prev) => ({ ...prev, [questionId]: answerId }))}
                    onSubmit={handleQuizSubmit}
                    onRetake={() => handleQuizRetake(activeQuiz.id)}
                    onBackLesson={() => goLesson(activeQuiz.lesson.id)}
                />
            )}

            {mode === "assignment" && (
                <ChapterAssignmentPanel
                    assignment={activeAssignment}
                    value={assignmentText}
                    submitted={submittedAssignments.has(activeAssignment.id)}
                    onChange={setAssignmentText}
                    onSubmit={handleAssignmentSubmit}
                />
            )}

            <ChapterList
                course={course}
                activeChapter={activeChapter}
                chapterStats={chapterStats}
                onLessonSelect={goLesson}
            />
        </>
    );
}
