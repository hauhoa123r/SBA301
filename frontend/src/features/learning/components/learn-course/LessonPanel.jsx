import { useState } from "react";
import { Check, CheckCircle2, ClipboardList, FileText, Play, BookOpen, Loader2, MessageCircle } from "lucide-react";
import FlashcardsPanel from "./FlashcardsPanel";
import SentencePatternsPanel from "./SentencePatternsPanel";

export default function LessonPanel({ lesson, isCompleted, isSaving = false, errorMessage = "", onComplete, onQuiz }) {
    const [activeTab, setActiveTab] = useState("video");
    const tabs = [
        { id: "video", label: "Video bài học", icon: Play },
        { id: "vocabulary", label: "Từ vựng (Flashcards)", icon: BookOpen },
        { id: "sentence", label: "Mẫu câu thực hành", icon: MessageCircle },
    ];

    return (
        <section className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
                {/* Tabs Selector Bar */}
                <div role="tablist" aria-label="Nội dung bài học" className="flex flex-wrap gap-2 border-b border-brand-border bg-brand-panel p-2">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            id={`lesson-tab-${id}`}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === id}
                            aria-controls={`lesson-panel-${id}`}
                            onClick={() => setActiveTab(id)}
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

                {/* Tab Content Display */}
                <div className="p-1">
                    {activeTab === "video" && (
                        <div id="lesson-panel-video" role="tabpanel" aria-labelledby="lesson-tab-video" className="overflow-hidden">
                            <video controls poster={lesson.chapter?.thumbnailUrl} src={lesson.videoUrl} className="aspect-video w-full bg-brand-black object-cover" aria-label={`Video bài học ${lesson.title}`} />
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

                {/* Lesson Info Footer */}
                <div className="p-6 border-t border-brand-border">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-quizPanel px-3 py-1 text-xs font-bold text-brand-accentSoft">
                        Chương {lesson.chapter?.orderIndex || 1}
                    </div>
                    <h2 className="text-2xl font-extrabold">{lesson.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-brand-courseMuted">{lesson.summary || "Hãy tham gia bài học video, học từ vựng và mẫu câu để tích lũy kiến thức."}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onComplete}
                            disabled={isCompleted || isSaving}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            {isSaving ? "Đang lưu..." : isCompleted ? "Đã hoàn thành bài học" : "Đánh dấu hoàn thành"}
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
                    {((lesson.documents && lesson.documents.length) ? lesson.documents : [{ id: "empty", title: "Chưa có tài liệu đính kèm", fileUrl: "#" }]).map((doc) => (
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
