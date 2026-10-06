import { useEffect, useRef, useState } from "react";
import { Send, Mic, Square, CheckCircle2 } from "lucide-react";

function RecordingPractice() {
    const [recording, setRecording] = useState(false);
    const [url, setUrl] = useState("");
    const [error, setError] = useState("");
    const recorder = useRef(null);
    const stream = useRef(null);
    const blobUrl = useRef("");
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
            if (recorder.current?.state === "recording") recorder.current.stop();
            stream.current?.getTracks().forEach(track => track.stop());
            if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
        };
    }, []);
    const start = async () => {
        setError("");
        try {
            stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (!alive.current) { stream.current.getTracks().forEach(track => track.stop()); return; }
            const chunks = [];
            recorder.current = new MediaRecorder(stream.current);
            recorder.current.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
            recorder.current.onstop = () => {
                stream.current?.getTracks().forEach(track => track.stop());
                if (!alive.current) return;
                if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
                blobUrl.current = URL.createObjectURL(new Blob(chunks, { type: recorder.current.mimeType }));
                setUrl(blobUrl.current);
                setRecording(false);
            };
            recorder.current.start();
            setRecording(true);
        } catch {
            stream.current?.getTracks().forEach(track => track.stop());
            setError("Không thể sử dụng micro. Hãy kiểm tra quyền truy cập trên trình duyệt.");
        }
    };
    return <div className="mt-3 space-y-3">
        <button type="button" onClick={() => recording ? recorder.current?.stop() : start()}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border px-4 py-2">
            {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {recording ? "Dừng ghi âm" : "Ghi âm để tự luyện"}
        </button>
        {url && <audio controls src={url} aria-label="Nghe lại bản ghi luyện nói" className="max-w-full" />}
        {error && <p role="alert" className="text-status-danger">{error}</p>}
        <p className="text-xs text-brand-textSecondary">Bản ghi chỉ dùng để nghe lại trên thiết bị. Bài này kiểm tra nội dung câu trả lời, chưa chấm phát âm.</p>
    </div>;
}

const answered = (question, value) => {
    if (question.questionType === "MATCHING")
        return question.answers.every(answer => Boolean(value?.[answer.id]));
    if (Array.isArray(value)) return value.length > 0;
    return String(value ?? "").trim().length > 0;
};

export default function LessonQuizPanel({ quiz, answers, result, saving, previouslyPassed, onAnswer, onSubmit, onRetake, onBackLesson }) {
    const [review, setReview] = useState(false);
    const allAnswered = quiz.questions.length > 0 && quiz.questions.every(question => answered(question, answers[question.id]));
    const fieldClass = "mt-3 w-full rounded-xl border border-brand-border bg-brand-panel p-3 text-brand-white outline-none focus:border-brand-accent";
    const locked = Boolean(result) || saving;
    return <section className="space-y-6 rounded-2xl border border-brand-border bg-brand-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
                <p className="text-sm text-brand-accentSoft">{quiz.lesson?.title || quiz.chapter?.title}</p>
                <h2 className="mt-2 text-2xl font-extrabold">{quiz.title}</h2>
                <p className="mt-2 text-sm text-brand-textSecondary">Điểm đạt: {quiz.passScore ?? 50}% · {quiz.timeLimitMinutes ? `Thời lượng gợi ý: ${quiz.timeLimitMinutes} phút` : "Không giới hạn thời gian"}</p>
            </div>
            <button type="button" onClick={onBackLesson} className="rounded-xl border border-brand-border px-4 py-2">Quay lại bài học</button>
        </div>
        {!quiz.questions.length && <p>Bài kiểm tra chưa có câu hỏi.</p>}
        {quiz.questions.map((question, index) => {
            const value = answers[question.id];
            const details = result?.review?.find(item => item.questionId === question.id);
            const textQuestion = ["SPEAKING", "FILL_IN_BLANK"].includes(question.questionType);
            return <fieldset key={question.id} disabled={locked} className="rounded-xl border border-brand-border bg-brand-panel p-4">
                <legend className="px-2 font-bold">Câu {index + 1}</legend>
                <p className="whitespace-pre-wrap leading-7">{question.content}</p>
                {question.audioUrl && <audio controls src={question.audioUrl} aria-label={`Âm thanh câu ${index + 1}`} className="mt-3 max-w-full" />}
                {question.questionType === "SPEAKING" && <>
                    <p className="mt-3 text-brand-accentSoft">{question.metaData?.speaking_target} {question.metaData?.pinyin && `(${question.metaData.pinyin})`}</p>
                    {!result && <RecordingPractice />}
                </>}
                {textQuestion ? <label className="mt-3 block text-sm">
                    {question.questionType === "SPEAKING" ? "Nhập lại câu bạn vừa luyện nói" : "Câu trả lời"}
                    <input value={value ?? ""} maxLength={4000} onChange={event => onAnswer(question.id, event.target.value)} className={fieldClass} />
                </label> : question.questionType === "MATCHING" ? <div className="mt-3 space-y-3">
                    {question.answers.map(option => <label key={option.id} className="grid gap-2 sm:grid-cols-2">
                        <span>{option.content}</span>
                        <select value={value?.[option.id] || ""} onChange={event => onAnswer(question.id, { ...value, [option.id]: event.target.value })}
                            className="rounded-lg border border-brand-border bg-brand-panel p-2">
                            <option value="">Chọn cặp phù hợp</option>
                            {(question.metaData?.matchingOptions || []).map(pair => <option key={pair} value={pair}>{pair}</option>)}
                        </select>
                    </label>)}
                </div> : <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {question.answers.map(option => {
                        const selected = Array.isArray(value) ? value.includes(option.id) : Number(value) === option.id;
                        const correct = review && details?.correctAnswerIds.includes(option.id);
                        return <label key={option.id} className={`flex items-center gap-3 rounded-xl border p-3 ${correct ? "border-status-success text-status-successSoft" : selected ? "border-brand-accent" : "border-brand-border"}`}>
                            <input type={question.questionType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"} name={`question-${question.id}`}
                                checked={selected} onChange={() => {
                                    if (question.questionType === "MULTIPLE_CHOICE") {
                                        const current = Array.isArray(value) ? value : [];
                                        onAnswer(question.id, selected ? current.filter(id => id !== option.id) : [...current, option.id]);
                                    } else onAnswer(question.id, option.id);
                                }} />
                            <span>{option.content}</span>
                        </label>;
                    })}
                </div>}
                {review && details && <div className="mt-4 rounded-lg border border-brand-border p-3 text-sm">
                    <p className={details.correct ? "text-status-successSoft" : "text-status-warningSoft"}>{details.correct ? "Đúng" : "Chưa đúng"}</p>
                    {question.questionType === "FILL_IN_BLANK" && details.correctTexts?.length > 0 && <p className="mt-2">Đáp án: {details.correctTexts.join(" / ")}</p>}
                    {question.questionType === "MATCHING" && Object.entries(details.correctMatches || {}).map(([left, right]) => <p key={left}>{left} → {right}</p>)}
                    {details.explanation && <p className="mt-2 whitespace-pre-wrap">{details.explanation}</p>}
                </div>}
            </fieldset>;
        })}
        {!result ? <button type="button" disabled={!allAnswered || saving} onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-3 font-bold disabled:opacity-50">
            <Send className="h-4 w-4" />{saving ? "Đang nộp..." : "Nộp trắc nghiệm"}
        </button> : <div role="status" className="space-y-3 rounded-xl border border-brand-border p-4">
            <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" />Kết quả đã lưu: {result.score}%</p>
            <p className={result.isPassed ? "text-status-successSoft" : "text-status-warningSoft"}>{result.isPassed ? "Đã đạt yêu cầu" : "Chưa đạt yêu cầu. Hãy ôn tập và thử lại."}</p>
            {!result.isPassed && previouslyPassed && <p className="text-sm text-brand-textSecondary">Bạn đã đạt ở lần làm trước; trạng thái hoàn thành quiz vẫn được giữ.</p>}
            <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setReview(current => !current)} className="rounded-xl border border-brand-border px-4 py-2">{review ? "Ẩn giải thích" : "Xem giải thích"}</button>
                <button type="button" disabled={saving} onClick={() => { setReview(false); onRetake(); }} className="rounded-xl bg-brand-accent px-4 py-2">Làm lại bài kiểm tra</button>
            </div>
        </div>}
    </section>;
}
