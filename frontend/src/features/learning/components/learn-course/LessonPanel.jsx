import { useState } from "react";
import { Check, CheckCircle2, ChevronDown, ClipboardList, FileText, Play, BookOpen, Loader2, MessageCircle, ArrowUpRight, Paperclip, VideoOff } from "lucide-react";
import FlashcardsPanel from "./FlashcardsPanel";
import SentencePatternsPanel from "./SentencePatternsPanel";
import TrackedVideo from "./TrackedVideo";

export default function LessonPanel({ lesson, isCompleted, isSaving = false, errorMessage = "", onComplete, onQuiz, playback, onPlayback }) {
    const [selectedTab, setSelectedTab] = useState(null);
    const tabs = [
        ...(lesson.videoUrl || !lesson.content ? [{ id: "video", label: "Video bài học", short: "Video", icon: Play }] : []),
        ...(lesson.content ? [{ id: "reading", label: "Bài đọc & hội thoại", short: "Bài đọc", icon: FileText }] : []),
        { id: "vocabulary", label: "Từ vựng", short: "Từ vựng", icon: BookOpen, count: lesson.vocabularies?.length || 0 },
        { id: "sentence", label: "Mẫu câu thực hành", short: "Mẫu câu", icon: MessageCircle, count: lesson.sentencePatterns?.length || 0 },
    ];
    const activeTab = tabs.some(tab => tab.id === selectedTab) ? selectedTab : tabs[0].id;
    const handleTabKey = (event, index) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault(); setSelectedTab(tabs[next].id);
        document.getElementById(`lesson-tab-${tabs[next].id}`)?.focus();
    };
    return <section className="workspace-lesson-panel workspace-enter" aria-label="Hoạt động bài học">
        <div className="workspace-player-card">
            <div role="tablist" aria-label="Nội dung bài học" className="workspace-tabs">
                {tabs.map(({ id, label, short, count, icon: Icon }, index) => <button key={id} id={`lesson-tab-${id}`} type="button" role="tab"
                    aria-selected={activeTab === id} aria-controls={`lesson-panel-${id}`} tabIndex={activeTab === id ? 0 : -1}
                    onClick={() => setSelectedTab(id)} onKeyDown={event => handleTabKey(event, index)}>
                    <Icon size={17} /><span className="workspace-tab-label">{label}</span><span className="workspace-tab-short" aria-hidden="true">{short}</span>{count !== undefined && <span className="workspace-tab-count" aria-hidden="true">{count}</span>}
                </button>)}
            </div>
            {/* Keep panels mounted so switching tabs preserves video time and flashcard position. */}
            {tabs.map(({ id }) => <div key={id} id={`lesson-panel-${id}`} role="tabpanel" aria-labelledby={`lesson-tab-${id}`} tabIndex={0} hidden={activeTab !== id} className="workspace-tab-panel">
                {id === "video" && (lesson.videoUrl ? <TrackedVideo key={lesson.id} lesson={lesson} playback={playback} active={activeTab === "video"} onSave={onPlayback} onComplete={() => { if (!isCompleted && !isSaving) onComplete(); }} />
                    : <div className="workspace-empty"><VideoOff size={32} /><h2>Video chưa có sẵn</h2><p>Bạn có thể ôn từ vựng và mẫu câu trong các mục bên cạnh.</p></div>)}
                {id === "reading" && <article className="workspace-reading"><span className="workspace-eyebrow">ĐỌC & THỰC HÀNH</span><div>{lesson.content}</div></article>}
                {id === "vocabulary" && <FlashcardsPanel vocabularies={lesson.vocabularies} active={activeTab === "vocabulary"} />}
                {id === "sentence" && <SentencePatternsPanel sentencePatterns={lesson.sentencePatterns} active={activeTab === "sentence"} />}
            </div>)}
            <div className="workspace-lesson-actions">
                <div>{lesson.summary && <p>{lesson.summary}</p>}<span className="workspace-action-hint">{isCompleted ? "Bạn đã hoàn thành bài học này." : "Sẵn sàng? Đánh dấu khi bạn đã học xong."}</span></div>
                <div className="workspace-action-buttons">
                    {lesson.quiz && <button type="button" onClick={onQuiz} className="workspace-secondary-button"><ClipboardList size={16} />Làm trắc nghiệm</button>}
                    <button type="button" onClick={onComplete} disabled={isSaving} aria-pressed={isCompleted} className={`workspace-primary-button ${isCompleted ? "is-complete" : ""}`}>
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : isCompleted ? <CheckCircle2 size={16} /> : <Check size={16} />}
                        {isSaving ? "Đang lưu…" : isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                    </button>
                </div>
                {errorMessage && <p role="alert" className="workspace-error">{errorMessage}</p>}
            </div>
        </div>
        {!!lesson.documents?.length && <details className="workspace-resources"><summary><span><Paperclip size={17} />Tài liệu bài học <small>{lesson.documents.length}</small></span><ChevronDown size={17} className="workspace-chevron" /></summary>
            <div className="workspace-resource-list">{lesson.documents.map(doc => <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" title={doc.title}>
                <span className="workspace-resource-icon"><FileText size={20} /></span><span>{doc.title}</span><ArrowUpRight size={17} /><span className="sr-only"> (mở tab mới)</span>
            </a>)}</div>
        </details>}
    </section>;
}
