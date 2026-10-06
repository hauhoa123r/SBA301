import { useOutletContext } from "react-router-dom";
import ChapterAssignmentPanel from "../../assignment/components/ChapterAssignmentPanel";
import LessonQuizPanel from "../../quiz/components/LessonQuizPanel";
import ChapterList from "../components/learn-course/ChapterList";
import CourseHero from "../components/learn-course/CourseHero";
import LessonPanel from "../components/learn-course/LessonPanel";
import { UserReveal } from "@/shared/ui";

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
        savingActivity,
        assignmentSubmission,
        handlePlayback,
        lessonPlayback,
        submittedAssignments,
        passedQuizzes,
        totalActivities,
        goLesson,
        goQuiz,
        previousLesson,
        nextLesson,
    } = useOutletContext();

    return (
        <>
            {progressError && <p role="alert" className="mb-4 rounded-xl border border-status-danger/30 p-4 text-status-danger">{progressError}</p>}
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
                        isSaving={savingLessonId !== null || savingActivity}
                        playback={lessonPlayback}
                        onPlayback={(payload) => handlePlayback(activeLesson.id, payload)}
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
                        saving={savingActivity}
                        previouslyPassed={passedQuizzes.has(activeQuiz.id)}
                        onAnswer={(questionId, answerId) => setAnswers((prev) => ({ ...prev, [questionId]: answerId }))}
                        onSubmit={handleQuizSubmit}
                        onRetake={() => handleQuizRetake(activeQuiz.id)}
                        onBackLesson={() => activeQuiz.lesson ? goLesson(activeQuiz.lesson.id) : activeQuiz.chapter.lessons[0] && goLesson(activeQuiz.chapter.lessons[0].id)}
                    />
                </UserReveal>
            )}

            {mode === "assignment" && (
                <UserReveal key={activeAssignment.id} distance={22}>
                    <ChapterAssignmentPanel
                        assignment={activeAssignment}
                        value={assignmentText}
                        submitted={submittedAssignments.has(activeAssignment.id)}
                        submission={assignmentSubmission}
                        saving={savingActivity}
                        onChange={setAssignmentText}
                        onSubmit={handleAssignmentSubmit}
                    />
                </UserReveal>
            )}

            <UserReveal delay={70} distance={22}>
                {mode === "lesson" && <div className="mt-5 flex flex-wrap justify-between gap-3">
                    <button type="button" disabled={!previousLesson} onClick={() => goLesson(previousLesson.id)} className="rounded-xl border border-brand-border px-4 py-2 disabled:opacity-40">Bài trước</button>
                    <button type="button" disabled={!nextLesson} onClick={() => goLesson(nextLesson.id)} className="rounded-xl bg-brand-accent px-4 py-2 disabled:opacity-40">Bài tiếp theo</button>
                </div>}
                <ChapterList
                    course={course}
                    activeChapter={activeChapter}
                    chapterStats={chapterStats}
                    completedChapterIds={completedChapterIds}
                    onLessonSelect={goLesson}
                    onQuizSelect={goQuiz}
                />
            </UserReveal>
        </>
    );
}
