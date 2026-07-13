import { Check, CheckCircle2, ClipboardList, FileText, Play } from "lucide-react";

export default function LessonPanel({ lesson, isCompleted, onComplete, onQuiz }) {
    return (
        <section className="grid gap-5 xl:grid-cols-[1fr_330px]">
            <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-surface">
                <video controls poster={lesson.chapter.thumbnail_url} src={lesson.video_url} className="aspect-video w-full bg-brand-black object-cover" />
                <div className="p-6">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-quizPanel px-3 py-1 text-xs font-bold text-brand-accentSoft">
                        <Play className="h-3.5 w-3.5" />
                        Chương {lesson.chapter.order_index}
                    </div>
                    <h2 className="text-2xl font-extrabold">{lesson.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-brand-courseMuted">{lesson.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={onComplete}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold transition hover:bg-brand-accentHover"
                        >
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            {isCompleted ? "Đã hoàn thành bài học" : "Đánh dấu hoàn thành"}
                        </button>
                        <button
                            type="button"
                            onClick={onQuiz}
                            className="inline-flex items-center gap-2 rounded-xl border border-brand-scrollbar px-5 py-3 text-sm font-bold text-brand-textSoft transition hover:border-brand-accent hover:text-brand-white"
                        >
                            <ClipboardList className="h-4 w-4" />
                            Làm trắc nghiệm bài này
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
                <h3 className="mb-4 text-lg font-extrabold">Tài liệu bài học</h3>
                <div className="space-y-3">
                    {(lesson.documents.length ? lesson.documents : [{ id: "empty", title: "Chưa có tài liệu đính kèm", file_url: "#" }]).map((doc) => (
                        <a key={doc.id} href={doc.file_url} className="flex items-center gap-3 rounded-xl border border-brand-border bg-brand-panel p-4 text-sm font-semibold text-brand-textSoft no-underline">
                            <FileText className="h-5 w-5 text-brand-accentSoft" />
                            <span className="min-w-0 truncate">{doc.title}</span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
