import { useOutletContext } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock3, BookOpen } from "lucide-react";
import ChapterAssignmentPanel from "../../assignment/components/ChapterAssignmentPanel";
import LessonQuizPanel from "../../quiz/components/LessonQuizPanel";
import ChapterList from "../components/learn-course/ChapterList";
import CourseHero from "../components/learn-course/CourseHero";
import LessonPanel from "../components/learn-course/LessonPanel";

export default function LearnCoursePage() {
    const { answers, assignmentText, activeChapter, activeLesson, activeQuiz, activeAssignment, chapterStats,
        completedChapterIds, completedChapters, completedCount, completedLessons, course,
        handleAssignmentSubmit, handleLessonComplete, handleQuizSubmit, handleQuizRetake, mode, progress,
        progressError, quizResults, setAnswers, setAssignmentText, savingLessonId, savingActivity,
        assignmentSubmission, handlePlayback, lessonPlayback, submittedAssignments, passedQuizzes,
        totalActivities, goLesson, goQuiz, goAssignment, previousLesson, nextLesson, lessonNumber, lessonCount } = useOutletContext();
    const current = mode === "quiz" ? activeQuiz : mode === "assignment" ? activeAssignment : activeLesson;
    const complete = mode === "lesson" ? completedLessons.has(current.id) : mode === "quiz" ? passedQuizzes.has(current.id) : submittedAssignments.has(current.id);
    return <>
        <header className="workspace-lesson-heading">
            <div className="workspace-breadcrumb"><BookOpen size={14} /><span>Chương {activeChapter.orderIndex || activeChapter.order_index}</span><ChevronRight size={13} /><span>{activeChapter.title}</span></div>
            <div className="workspace-lesson-title"><div><span className="workspace-eyebrow">{mode === "lesson" ? `BÀI ${String(lessonNumber).padStart(2, "0")} / ${String(lessonCount).padStart(2, "0")}` : mode === "quiz" ? "KIỂM TRA KIẾN THỨC" : "THỰC HÀNH"}</span><h1>{current.title}</h1></div>
                <span className={`workspace-status ${complete ? "is-complete" : ""}`}>{complete ? <CheckCircle2 size={15} /> : <span className="workspace-current-dot" />}{complete ? (mode === "assignment" ? "Đã nộp bài" : "Đã hoàn thành") : "Đang học"}</span>
            </div>
            {mode === "lesson" && <p className="workspace-lesson-meta">{activeLesson.durationSeconds > 0 && <><Clock3 size={14} /><span>{Math.ceil(activeLesson.durationSeconds / 60)} phút</span><span aria-hidden="true">·</span></>}<span>{activeLesson.videoUrl ? "Xem bài giảng, sau đó ôn từ vựng và mẫu câu." : "Đọc nội dung, sau đó ôn từ vựng và mẫu câu."}</span></p>}
        </header>
        {progressError && <p role="alert" className="workspace-error">{progressError}</p>}
        {mode === "lesson" && <LessonPanel key={activeLesson.id} lesson={activeLesson} isCompleted={complete}
            isSaving={savingLessonId !== null || savingActivity} playback={lessonPlayback}
            onPlayback={payload => handlePlayback(activeLesson.id, payload)} onComplete={() => handleLessonComplete(activeLesson.id)} onQuiz={() => activeLesson.quiz && goQuiz(activeLesson.quiz.id)} />}
        {mode === "quiz" && <div key={activeQuiz.id} className="workspace-activity workspace-enter"><LessonQuizPanel quiz={activeQuiz} answers={answers} result={quizResults[activeQuiz.id]}
            saving={savingActivity} previouslyPassed={passedQuizzes.has(activeQuiz.id)} onAnswer={(questionId, answerId) => setAnswers(prev => ({ ...prev, [questionId]: answerId }))}
            onSubmit={handleQuizSubmit} onRetake={() => handleQuizRetake(activeQuiz.id)} onBackLesson={() => activeQuiz.lesson ? goLesson(activeQuiz.lesson.id) : activeQuiz.chapter.lessons[0] && goLesson(activeQuiz.chapter.lessons[0].id)} /></div>}
        {mode === "assignment" && <div key={activeAssignment.id} className="workspace-activity workspace-enter"><ChapterAssignmentPanel assignment={activeAssignment} value={assignmentText}
            submitted={submittedAssignments.has(activeAssignment.id)} submission={assignmentSubmission} saving={savingActivity} onChange={setAssignmentText} onSubmit={handleAssignmentSubmit} /></div>}
        {mode === "lesson" && <nav className="workspace-lesson-navigation" aria-label="Chuyển bài học">
            <button type="button" disabled={!previousLesson} onClick={() => goLesson(previousLesson.id)} title={previousLesson?.title}><ArrowLeft size={18} /><span><small>Bài trước</small><strong>{previousLesson?.title || "Bài đầu tiên"}</strong></span></button>
            <span className="workspace-navigation-count">{lessonNumber}<span> / {lessonCount}</span></span>
            <button type="button" className="workspace-next-lesson" disabled={!nextLesson} onClick={() => goLesson(nextLesson.id)} title={nextLesson?.title}><span><small>Bài tiếp theo</small><strong>{nextLesson?.title || "Bài cuối cùng"}</strong></span><ArrowRight size={18} /></button>
        </nav>}
        <CourseHero course={course} progress={progress} completedCount={completedCount} totalActivities={totalActivities} completedChapters={completedChapters.length} />
        <details className="workspace-overview workspace-chapter-overview"><summary>Khám phá các chương<ChevronRight size={17} className="workspace-chevron" /></summary>
            <ChapterList course={course} activeChapter={activeChapter} chapterStats={chapterStats} completedChapterIds={completedChapterIds} onLessonSelect={goLesson} onQuizSelect={goQuiz} onAssignmentSelect={goAssignment} />
        </details>
    </>;
}
