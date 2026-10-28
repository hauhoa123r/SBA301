import { useEffect, useRef, useState } from "react";
import { Award, Check, ChevronDown, CirclePlay, ClipboardList, FileText, X, BookOpen } from "lucide-react";
import { chapterAssignments, lessonQuizzes } from "../../shared/learnCourseUtils";

const duration = seconds => seconds > 0 ? `${Math.ceil(seconds / 60)} phút` : "Bài học";

export default function LearnCourseSidebar({ course, activeChapter, activeLesson, activeQuiz, activeAssignment,
    chapterStats, completedChapterIds, completedLessons, passedQuizzes, submittedAssignments,
    lessonPlayback = [], mode, onLessonSelect, onQuizSelect, onAssignmentSelect, open, onClose, wide, visible }) {
    // Opening a chapter changes only presentation, never the active lesson.
    const [expansion, setExpansion] = useState({});
    const dialog = useRef(null), navigation = useRef(null);
    const activityKey = `${mode}:${mode === "quiz" ? activeQuiz?.id : mode === "assignment" ? activeAssignment?.id : activeLesson?.id}`;
    useEffect(() => {
        if (wide) return;
        const element = dialog.current;
        if (open && !element.open) element.showModal();
        else if (!open && element.open) element.close();
    }, [open, wide]);
    useEffect(() => {
        if (!(wide ? visible : open)) return;
        const frame = requestAnimationFrame(() => {
            const current = navigation.current?.querySelector('[aria-current="page"]');
            const scroller = navigation.current;
            if (!current || !scroller) return;
            const item = current.getBoundingClientRect(), bounds = scroller.getBoundingClientRect();
            if (item.top < bounds.top || item.bottom > bounds.bottom) scroller.scrollTop += item.top - bounds.top - 80;
        });
        return () => cancelAnimationFrame(frame);
    }, [activityKey, open, visible, wide]);
    const select = (callback, id) => { callback(id); onClose(); };
    const keepDrawerFocus = event => {
        if (event.key !== "Tab") return;
        const buttons = [...event.currentTarget.querySelectorAll("button:not(:disabled)")]
            .filter(button => !button.closest("[inert]") && button.getClientRects().length);
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const nav = <>
        <div className="workspace-nav-heading"><div><span className="workspace-eyebrow">LỘ TRÌNH CỦA BẠN</span><h2>Nội dung khóa học</h2><p>{course.chapters.length} chương học</p></div>
            {!wide && <button type="button" className="workspace-icon-button" onClick={onClose} aria-label="Đóng nội dung khóa học" autoFocus><X size={20} /></button>}
        </div>
        <nav ref={navigation} className="workspace-nav-scroll" aria-label="Chương và hoạt động học">
            {course.chapters.map(chapter => {
                const stats = chapterStats[chapter.id], isActive = chapter.id === activeChapter?.id;
                const empty = !chapter.lessons.length && !chapter.quizzes?.length && !chapterAssignments(chapter).length;
                const preference = expansion[chapter.id];
                const expanded = !empty && (preference?.activityKey === activityKey ? preference.open : isActive || preference?.open === true);
                return <section className={`workspace-chapter ${isActive ? "is-current" : ""}`} key={chapter.id}>
                    <button type="button" className="workspace-chapter-toggle" disabled={empty} aria-expanded={expanded}
                        aria-controls={`chapter-content-${chapter.id}`} onClick={() => setExpansion(previous => ({ ...previous, [chapter.id]: { open: !expanded, activityKey } }))}>
                        <span className={`workspace-chapter-number ${completedChapterIds.has(chapter.id) ? "is-done" : ""}`}>{completedChapterIds.has(chapter.id) ? <Check size={16} /> : String(chapter.orderIndex || chapter.order_index).padStart(2, "0")}</span>
                        <span className="workspace-chapter-label"><strong title={chapter.title}>{chapter.title}</strong><small>{empty ? "Chưa có nội dung" : `${stats.done}/${stats.total} hoạt động hoàn thành`}</small></span>
                        {!empty && <ChevronDown size={15} className="workspace-chevron" />}
                    </button>
                    <div id={`chapter-content-${chapter.id}`} className="workspace-chapter-body" data-open={expanded} inert={!expanded} aria-hidden={!expanded}>
                        <div><div className="workspace-chapter-items">
                            {chapter.lessons.map(lesson => {
                                const playback = lessonPlayback.find(item => item.lessonId === lesson.id);
                                return <div key={lesson.id}>
                                    <SidebarItem active={mode === "lesson" && activeLesson?.id === lesson.id} done={completedLessons.has(lesson.id)}
                                        inProgress={playback?.watchSeconds > 0 || playback?.positionSeconds > 0} icon={lesson.videoUrl ? CirclePlay : FileText}
                                        label={lesson.title} sub={duration(lesson.durationSeconds || lesson.duration_seconds)}
                                        onClick={() => select(onLessonSelect, lesson.id)} />
                                    {lessonQuizzes(lesson).map(quiz => <SidebarItem key={quiz.id} active={mode === "quiz" && activeQuiz?.id === quiz.id} done={passedQuizzes.has(quiz.id)}
                                        icon={ClipboardList} label={quiz.title} sub={quiz.timeLimitMinutes ? `Trắc nghiệm · ${quiz.timeLimitMinutes} phút` : "Trắc nghiệm"}
                                        onClick={() => select(onQuizSelect, quiz.id)} />)}
                                </div>;
                            })}
                            {(chapter.quizzes || []).map(quiz => <SidebarItem key={quiz.id} active={mode === "quiz" && activeQuiz?.id === quiz.id} done={passedQuizzes.has(quiz.id)}
                                icon={ClipboardList} label={quiz.title} sub="Kiểm tra chương" onClick={() => select(onQuizSelect, quiz.id)} />)}
                            {chapterAssignments(chapter).map(assignment => <SidebarItem key={assignment.id} active={mode === "assignment" && activeAssignment?.id === assignment.id}
                                done={submittedAssignments.has(assignment.id)} icon={Award} label={assignment.title} sub="Bài tập thực hành" onClick={() => select(onAssignmentSelect, assignment.id)} />)}
                        </div></div>
                    </div>
                </section>;
            })}
        </nav>
        <div className="workspace-nav-footer"><BookOpen size={16} /><span>Từng bài học, thêm một bước tiến.</span></div>
    </>;
    return wide ? <aside id="learn-course-navigation" className="workspace-sidebar" aria-label="Nội dung khóa học" inert={!visible} aria-hidden={!visible}>{nav}</aside>
        : <dialog id="learn-course-navigation" ref={dialog} className="workspace-drawer" aria-label="Nội dung khóa học" onCancel={onClose} onClose={onClose} onKeyDown={keepDrawerFocus}
            onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="workspace-drawer-inner">{nav}</div></dialog>;
}

function SidebarItem({ active, done, inProgress, icon: Icon, label, sub, onClick }) {
    return <button type="button" onClick={onClick} className={`workspace-lesson ${active ? "is-active" : ""} ${done ? "is-done" : ""}`}
        aria-current={active ? "page" : undefined} title={`${label} — ${sub}${done ? " — Đã hoàn thành" : inProgress ? " — Đang học" : ""}`}>
        <span className="workspace-lesson-icon">{done ? <Check size={16} /> : <Icon size={17} />}</span>
        <span><strong>{label}</strong><small>{sub}{done ? " · Hoàn thành" : inProgress ? " · Đang học" : ""}</small></span>
        {active && <span className="workspace-current-dot" aria-hidden="true" />}
    </button>;
}
