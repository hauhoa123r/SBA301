import { Send } from "lucide-react";

export default function LessonQuizPanel({ quiz, answers, result, onAnswer, onSubmit, onBackLesson }) {
    const allAnswered = quiz.questions.every((question) => answers[question.id]);

    return (
        <section className="rounded-2xl border border-brand-border bg-brand-surface p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-bold text-brand-accentSoft">Trắc nghiệm của bài học: {quiz.lesson.title}</p>
                    <h2 className="mt-2 text-2xl font-extrabold">{quiz.title}</h2>
                    <p className="mt-2 text-sm text-brand-courseMuted">Thời gian {quiz.time_limit_minutes} phút · Điểm đạt {quiz.pass_score}%</p>
                </div>
                <button type="button" onClick={onBackLesson} className="rounded-xl border border-brand-scrollbar px-4 py-2 text-sm font-bold text-brand-textSoft hover:text-brand-white">
                    Quay lại bài học
                </button>
            </div>

            <div className="space-y-5">
                {quiz.questions.map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-brand-border bg-brand-panel p-5">
                        <h3 className="font-bold">Câu {index + 1}: {question.content}</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {question.answers.map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-brand-border bg-brand-cardBg p-3 text-sm font-semibold hover:border-brand-accent">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={item.id}
                                        checked={Number(answers[question.id]) === item.id}
                                        onChange={() => onAnswer(question.id, item.id)}
                                        className="h-4 w-4 accent-brand-accent"
                                    />
                                    {item.content}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {result && (
                <div className={`mt-5 rounded-2xl border p-4 text-sm font-bold ${result.isPassed ? "border-status-successStrong/30 bg-status-successStrong/10 text-status-successSoft" : "border-status-warningStrong/30 bg-status-warningStrong/10 text-status-warningSoft"}`}>
                    Điểm của bạn: {result.score}%. {result.isPassed ? "Đã đạt, bài trắc nghiệm được tính hoàn thành." : "Chưa đạt, hãy thử lại."}
                </div>
            )}

            <button
                type="button"
                disabled={!allAnswered}
                onClick={onSubmit}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-bold transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:bg-brand-borderHover disabled:text-brand-learningMuted"
            >
                <Send className="h-4 w-4" />
                Nộp trắc nghiệm
            </button>
        </section>
    );
}
