import { Send } from "lucide-react";

export default function LessonQuizPanel({ quiz, answers, result, onAnswer, onSubmit, onBackLesson }) {
    const allAnswered = quiz.questions.every((question) => answers[question.id]);

    return (
        <section className="rounded-2xl border border-[#2b1852] bg-[#160d2b] p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-bold text-[#a78bfa]">Quiz của lesson: {quiz.lesson.title}</p>
                    <h2 className="mt-2 text-2xl font-extrabold">{quiz.title}</h2>
                    <p className="mt-2 text-sm text-[#a7b0c7]">Thời gian {quiz.time_limit_minutes} phút · Điểm đạt {quiz.pass_score}%</p>
                </div>
                <button type="button" onClick={onBackLesson} className="rounded-xl border border-[#4f2f8f] px-4 py-2 text-sm font-bold text-[#d8ddf0] hover:text-white">
                    Quay lại lesson
                </button>
            </div>

            <div className="space-y-5">
                {quiz.questions.map((question, index) => (
                    <div key={question.id} className="rounded-2xl border border-[#2b1852] bg-[#120922] p-5">
                        <h3 className="font-bold">Câu {index + 1}: {question.content}</h3>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {question.answers.map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#2b1852] bg-[#1c1236] p-3 text-sm font-semibold hover:border-[#7c3aed]">
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={item.id}
                                        checked={Number(answers[question.id]) === item.id}
                                        onChange={() => onAnswer(question.id, item.id)}
                                        className="h-4 w-4 accent-[#7c3aed]"
                                    />
                                    {item.content}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {result && (
                <div className={`mt-5 rounded-2xl border p-4 text-sm font-bold ${result.isPassed ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
                    Điểm của bạn: {result.score}%. {result.isPassed ? "Đã đạt, quiz được tính hoàn thành." : "Chưa đạt, hãy thử lại."}
                </div>
            )}

            <button
                type="button"
                disabled={!allAnswered}
                onClick={onSubmit}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-bold transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:bg-[#39255d] disabled:text-[#9aa4bd]"
            >
                <Send className="h-4 w-4" />
                Nộp quiz
            </button>
        </section>
    );
}
