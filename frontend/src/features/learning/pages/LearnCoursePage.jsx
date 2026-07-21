import { useOutletContext } from "react-router-dom";
import ChapterAssignmentPanel from "../../assignment/components/ChapterAssignmentPanel";
import LessonQuizPanel from "../../quiz/components/LessonQuizPanel";
import ChapterList from "../components/learn-course/ChapterList";
import CourseHero from "../components/learn-course/CourseHero";
import LessonPanel from "../components/learn-course/LessonPanel";
import UserReveal from "../../../shared/components/animation/UserReveal";

export default function LearnCoursePage() {
    const {
        answers,
        assignmentText,
        activeChapter,
        activeLesson,
        activeQuiz,
        activeAssignment,
        chapterStats,
        completedChapterIds,
        completedChapters,
        completedCount,
        completedLessons,
        course,
        handleAssignmentSubmit,
        handleLessonComplete,
        handleQuizSubmit,
        handleQuizRetake,
        mode,
        progress,
        progressError,
        quizResults,
        setAnswers,
        setAssignmentText,
        savingLessonId,
        submittedAssignments,
        totalActivities,
        goLesson,
        goQuiz,
    } = useOutletContext();

    return (
        <>
            <UserReveal distance={20}>
                <CourseHero
                    course={course}
                    progress={progress}
                    completedCount={completedCount}
                    totalActivities={totalActivities}
                    completedChapters={completedChapters.length}
                />
            </UserReveal>

            {mode === "lesson" && (
                <UserReveal key={activeLesson.id} distance={22}>
                    <LessonPanel
                        lesson={activeLesson}
                        isCompleted={completedLessons.has(activeLesson.id)}
                        isSaving={savingLessonId === activeLesson.id}
                        errorMessage={progressError}
                        onComplete={() => handleLessonComplete(activeLesson.id)}
                        onQuiz={() => activeLesson.quiz && goQuiz(activeLesson.quiz.id)}
                    />
                </UserReveal>
            )}

            {mode === "quiz" && (
                <UserReveal key={activeQuiz.id} distance={22}>
                    <LessonQuizPanel
                        quiz={activeQuiz}
                        answers={answers}
                        result={quizResults[activeQuiz.id]}
                        onAnswer={(questionId, answerId) => setAnswers((prev) => ({ ...prev, [questionId]: answerId }))}
                        onSubmit={handleQuizSubmit}
                        onRetake={() => handleQuizRetake(activeQuiz.id)}
                        onBackLesson={() => goLesson(activeQuiz.lesson.id)}
                    />
                </UserReveal>
            )}

            {mode === "assignment" && (
                <UserReveal key={activeAssignment.id} distance={22}>
                    <ChapterAssignmentPanel
                        assignment={activeAssignment}
                        value={assignmentText}
                        submitted={submittedAssignments.has(activeAssignment.id)}
                        onChange={setAssignmentText}
                        onSubmit={handleAssignmentSubmit}
                    />
                </UserReveal>
            )}

            <UserReveal delay={70} distance={22}>
                <ChapterList
                    course={course}
                    activeChapter={activeChapter}
                    chapterStats={chapterStats}
                    completedChapterIds={completedChapterIds}
                    onLessonSelect={goLesson}
                />
            </UserReveal>
        </>
    );
}
