import { useState } from "react";
import { Check, CheckCircle2, ClipboardList, FileText, Play, BookOpen, Loader2, MessageCircle } from "lucide-react";
import FlashcardsPanel from "./FlashcardsPanel";
import SentencePatternsPanel from "./SentencePatternsPanel";
import TrackedVideo from "./TrackedVideo";

export default function LessonPanel({ lesson, isCompleted, isSaving = false, errorMessage = "", onComplete, onQuiz, playback, onPlayback }) {
    const [selectedTab, setSelectedTab] = useState(null);
    const tabs = [
        ...(lesson.videoUrl ? [{ id: "video", label: "Video bài học", icon: Play }] : []),
        ...(lesson.content ? [{ id: "reading", label: "Bài đọc và hội thoại", icon: FileText }] : []),
        { id: "vocabulary", label: "Từ vựng (Flashcards)", icon: BookOpen },
        { id: "sentence", label: "Mẫu câu thực hành", icon: MessageCircle },
    ];
    const activeTab = tabs.some(tab => tab.id === selectedTab) ? selectedTab : tabs[0].id;

    return (
        <section className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
                <div role="tablist" aria-label="Nội dung bài học" className="flex flex-wrap gap-2 border-b border-brand-border bg-brand-panel p-2">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            id={`lesson-tab-${id}`}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === id}
                            aria-controls={`lesson-panel-${id}`}
                            onClick={() => setSelectedTab(id)}
                            className={`inline-flex min-w-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition sm:px-4 ${
                                activeTab === id
                                    ? "bg-brand-accent text-brand-white shadow"
                                    : "text-brand-textSoft hover:bg-brand-quizPanel hover:text-brand-white"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-1">
                    {activeTab === "reading" && (
                        <div id="lesson-panel-reading" role="tabpanel" aria-labelledby="lesson-tab-reading" className="whitespace-pre-wrap p-5 text-base leading-8 text-brand-textSoft sm:p-8">
                            {lesson.content}
                        </div>
                    )}
                    {activeTab === "video" && (
                        <div id="lesson-panel-video" role="tabpanel" aria-labelledby="lesson-tab-video" className="overflow-hidden">
                            <TrackedVideo key={lesson.id} lesson={lesson} playback={playback} onSave={onPlayback} onComplete={() => { if (!isCompleted && !isSaving) onComplete(); }} />
                        </div>
                    )}
                    {activeTab === "vocabulary" && (
                        <div id="lesson-panel-vocabulary" role="tabpanel" aria-labelledby="lesson-tab-vocabulary" className="p-3 sm:p-4">
                            <FlashcardsPanel vocabularies={lesson.vocabularies} />
                        </div>
                    )}
                    {activeTab === "sentence" && (
                        <div id="lesson-panel-sentence" role="tabpanel" aria-labelledby="lesson-tab-sentence" className="p-3 sm:p-4">
                            <SentencePatternsPanel sentencePatterns={lesson.sentencePatterns} />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-brand-border">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-quizPanel px-3 py-1 text-xs font-bold text-brand-accentSoft">
                        Chương {lesson.chapter?.orderIndex || 1}
                    </div>
                    <h2 className="text-2xl font-extrabold">{lesson.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-brand-courseMuted">{lesson.summary || "Học nội dung bài, ôn từ vựng và mẫu câu, sau đó làm trắc nghiệm để kiểm tra kiến thức."}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onComplete}
                            disabled={isSaving}
                            aria-pressed={isCompleted}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            {isSaving ? "Đang lưu..." : isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu hoàn thành"}
                        </button>
                        {lesson.quiz && (
                            <button
                                type="button"
                                onClick={onQuiz}
                                className="inline-flex items-center gap-2 rounded-xl border border-brand-scrollbar px-5 py-3 text-sm font-bold text-brand-textSoft transition hover:border-brand-accent hover:text-brand-white"
                            >
                                <ClipboardList className="h-4 w-4" />
                                Làm trắc nghiệm bài này
                            </button>
                        )}
                    </div>
                    {errorMessage && <p role="alert" className="mt-3 text-sm font-semibold text-status-danger">{errorMessage}</p>}
                </div>
            </div>

            {/* Sidebar Documents */}
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
                <h3 className="mb-4 text-lg font-extrabold">Tài liệu bài học</h3>
                <div className="space-y-3">
                    {!lesson.documents?.length && <p className="text-sm leading-6 text-brand-textSoft">{lesson.content ? "Nội dung học nằm trong mục Bài đọc và hội thoại." : "Chưa có tài liệu đính kèm."}</p>}
                    {(lesson.documents || []).map((doc) => (
                        <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-panel p-4 text-sm font-semibold text-brand-textSoft no-underline hover:border-brand-accent/40">
                            <FileText className="h-5 w-5 text-brand-accentSoft" />
                            <span className="min-w-0 truncate">{doc.title}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
