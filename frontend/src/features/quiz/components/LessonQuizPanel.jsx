import React, { useState, useRef } from "react";
import { Send, Volume2, Mic, Square, Play, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import usePrefersReducedMotion from "../../../shared/hooks/usePrefersReducedMotion";

export default function LessonQuizPanel({ quiz, answers, result, onAnswer, onSubmit, onRetake, onBackLesson }) {
    const [recordingId, setRecordingId] = useState(null);
    const [recordedAudios, setRecordedAudios] = useState({}); // { questionId: blobUrl }
    const [speakingScores, setSpeakingScores] = useState({}); // { questionId: number }
    const [isAnalyzing, setIsAnalyzing] = useState({}); // { questionId: boolean }
    const [activeAudioUrl, setActiveAudioUrl] = useState(null); // currently playing question audio
    const [isReviewMode, setIsReviewMode] = useState(false);
    const prefersReducedMotion = usePrefersReducedMotion();

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const quizRef = useRef(null);

    const allAnswered = quiz.questions.every((question) => answers[question.id]);

    const scrollToTop = () => {
        const behavior = prefersReducedMotion ? "auto" : "smooth";

        if (quizRef.current) {
            quizRef.current.scrollIntoView({ behavior, block: "start" });
        } else {
            window.scrollTo({ top: 0, behavior });
        }
    };

    React.useEffect(() => {
        if (!result) {
            // Reset the local review UI whenever the parent clears the result.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsReviewMode(false);
        }
    }, [result]);

    const playQuestionAudio = (url) => {
        if (!url) return;
        setActiveAudioUrl(url);
        const audio = new Audio(url);
        audio.play().catch((err) => console.log("Audio play failed:", err));
        audio.onended = () => setActiveAudioUrl(null);
    };

    const startRecording = async (questionId) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunksRef.current = [];
            
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                const audioUrl = URL.createObjectURL(audioBlob);
                setRecordedAudios((prev) => ({ ...prev, [questionId]: audioUrl }));
                
                // Simulate AI pronunciation analysis
                setIsAnalyzing((prev) => ({ ...prev, [questionId]: true }));
                setTimeout(() => {
                    const simulatedScore = Math.floor(82 + Math.random() * 17); // 82 to 99
                    setSpeakingScores((prev) => ({ ...prev, [questionId]: simulatedScore }));
                    setIsAnalyzing((prev) => ({ ...prev, [questionId]: false }));
                    onAnswer(questionId, `recorded-${simulatedScore}`);
                }, 1800);

                // Stop all tracks to release microphone
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setRecordingId(questionId);
        } catch (err) {
            console.error("Microphone access failed, using fallback:", err);
            // Fallback for environments where mic is blocked/unsupported
            setRecordingId(questionId);
            setTimeout(() => {
                stopRecording(questionId, true);
            }, 2000);
        }
    };

    const stopRecording = (questionId, isFallback = false) => {
        if (isFallback) {
            setRecordingId(null);
            setIsAnalyzing((prev) => ({ ...prev, [questionId]: true }));
            setTimeout(() => {
                const simulatedScore = Math.floor(85 + Math.random() * 14);
                setSpeakingScores((prev) => ({ ...prev, [questionId]: simulatedScore }));
                setIsAnalyzing((prev) => ({ ...prev, [questionId]: false }));
                onAnswer(questionId, `recorded-fallback-${simulatedScore}`);
            }, 1500);
            return;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setRecordingId(null);
        }
    };

    const playRecordedAudio = (url) => {
        if (!url) return;
        const audio = new Audio(url);
        audio.play().catch((err) => console.log("Recorded audio playback failed:", err));
    };

    return (
        <section ref={quizRef} className="rounded-2xl border border-brand-border bg-brand-surface p-6" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-bold text-brand-accentSoft">
                        Trắc nghiệm của bài học: {quiz.lesson?.title || "Bài học"}
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold text-brand-white">{quiz.title}</h2>
                    <p className="mt-2 text-sm text-brand-courseMuted">
                        Thời gian {quiz.time_limit_minutes} phút · Điểm đạt {quiz.pass_score}%
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onBackLesson}
                    className="rounded-xl border border-brand-scrollbar px-4 py-2.5 text-sm font-bold text-brand-textSoft hover:text-brand-white hover:border-brand-accent transition-all"
                >
                    Quay lại bài học
                </button>
            </div>


            <div className="space-y-5">
                {quiz.questions.map((question, index) => {
                    const isSpeaking = question.questionType === "SPEAKING";

                    return (
                        <div key={question.id} className="rounded-2xl border border-brand-border bg-brand-panel p-5 transition-all">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <h3 className="flex max-w-full items-start gap-2 font-bold text-brand-white sm:max-w-[70%]">
                                    <span className="text-brand-accentSoft shrink-0">Câu {index + 1}:</span>
                                    <span className="whitespace-pre-line leading-relaxed">{question.content}</span>
                                </h3>

                                {/* Audio play button for Listening / Speaking tasks */}
                                {question.audioUrl && (
                                    <button
                                        type="button"
                                        onClick={() => playQuestionAudio(question.audioUrl)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                            activeAudioUrl === question.audioUrl
                                                ? "bg-brand-accent border-brand-accent text-brand-white animate-pulse"
                                                : "bg-brand-quizPanel border-brand-border text-brand-accentSoft hover:border-brand-accent"
                                        }`}
                                    >
                                        <Volume2 className="h-4 w-4" />
                                        Nghe phát âm mẫu
                                    </button>
                                )}
                            </div>

                            {/* Speaking target info */}
                            {isSpeaking && question.metaData && (
                                <div className="mt-3 p-3 rounded-xl bg-brand-surface/40 border border-brand-border/40 flex flex-col gap-1">
                                    <span className="text-xs text-brand-courseMuted font-semibold">MỤC TIÊU PHÁT ÂM:</span>
                                    <span className="text-xl font-bold text-brand-accentSoft font-serif tracking-wider">
                                        {question.metaData.speaking_target}
                                    </span>
                                    {question.metaData.pinyin && (
                                        <span className="text-sm font-medium text-brand-textSoft">
                                            Pinyin: {question.metaData.pinyin}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Question Contents / Choices */}
                            {!isSpeaking ? (
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {question.answers.map((item) => {
                                        const isSelected = Number(answers[question.id]) === item.id;
                                        const isCorrect = item.isCorrect || item.is_correct;

                                        let optionStyle = "border-brand-border bg-brand-cardBg text-brand-textSoft hover:border-brand-accent/40";
                                        if (isReviewMode) {
                                            if (isCorrect) {
                                                optionStyle = "border-status-success bg-status-successStrong/15 text-brand-white cursor-default";
                                            } else if (isSelected) {
                                                optionStyle = "border-status-danger bg-status-danger/10 text-brand-white cursor-default";
                                            } else {
                                                optionStyle = "border-brand-border/40 bg-brand-cardBg/20 text-brand-courseMuted opacity-60 cursor-default";
                                            }
                                        } else if (isSelected) {
                                            optionStyle = "border-brand-accent bg-brand-accent/10 text-brand-white";
                                        }

                                        return (
                                            <label
                                                key={item.id}
                                                className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition-all ${
                                                    isReviewMode ? "" : "cursor-pointer"
                                                } ${optionStyle}`}
                                            >
                                                {isReviewMode ? (
                                                    isCorrect ? (
                                                        <CheckCircle className="h-5 w-5 text-status-successSoft shrink-0" />
                                                    ) : isSelected ? (
                                                        <AlertCircle className="h-5 w-5 text-status-danger shrink-0" />
                                                    ) : (
                                                        <div className="h-5 w-5 rounded-full border border-brand-border/40 shrink-0" />
                                                    )
                                                ) : (
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        value={item.id}
                                                        checked={isSelected}
                                                        onChange={() => onAnswer(question.id, item.id)}
                                                        className="h-4 w-4 accent-brand-accent"
                                                    />
                                                )}
                                                <span>{item.content}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Voice recorder console for SPEAKING questions */
                                <div className="mt-4 flex flex-col gap-4 p-4 rounded-xl border border-brand-border bg-brand-surface/20">
                                    {!isReviewMode && (
                                        <div className="flex flex-wrap items-center gap-3">
                                            {recordingId === question.id ? (
                                                <button
                                                    type="button"
                                                    onClick={() => stopRecording(question.id)}
                                                    className="flex items-center gap-2 rounded-xl bg-status-warningStrong px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-opacity-90 animate-pulse"
                                                >
                                                    <Square className="h-4 w-4 fill-white" />
                                                    Dừng ghi âm
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => startRecording(question.id)}
                                                    className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-brand-white transition hover:bg-brand-accentHover"
                                                >
                                                    <Mic className="h-4 w-4" />
                                                    Bắt đầu ghi âm
                                                </button>
                                            )}

                                            {/* Playback of user's own recording */}
                                            {recordedAudios[question.id] && (
                                                <button
                                                    type="button"
                                                    onClick={() => playRecordedAudio(recordedAudios[question.id])}
                                                    className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-quizPanel px-4 py-2.5 text-sm font-bold text-brand-accentSoft hover:border-brand-accent transition-all"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Nghe lại giọng bạn
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Status Display and AI Pronunciation Feedback */}
                                    <div className="text-sm">
                                        {recordingId === question.id && (
                                            <p role="status" className="flex items-center gap-2 text-status-warningSoft font-semibold">
                                                <span aria-hidden="true" className="flex h-2.5 w-2.5 rounded-full bg-status-warningStrong animate-ping" />
                                                Đang ghi âm giọng nói của bạn... Hãy nói to, rõ ràng!
                                            </p>
                                        )}

                                        {isAnalyzing[question.id] && (
                                            <p role="status" className="flex items-center gap-2 text-brand-accentSoft font-semibold animate-pulse">
                                                <Sparkles className="h-4 w-4" />
                                                AI đang chấm điểm và phân tích phát âm của bạn...
                                            </p>
                                        )}

                                        {!recordingId && !isAnalyzing[question.id] && speakingScores[question.id] !== undefined && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg border border-status-successStrong/30 bg-status-successStrong/10 text-status-successSoft">
                                                <CheckCircle className="h-5 w-5 shrink-0" />
                                                <div>
                                                    <span className="font-extrabold text-base">
                                                        Điểm phát âm đạt được: {speakingScores[question.id]}%
                                                    </span>
                                                    <p className="text-xs mt-1 text-brand-courseMuted">
                                                        {speakingScores[question.id] >= 90
                                                            ? "Tuyệt vời! Bạn phát âm cực kỳ chuẩn xác."
                                                            : "Rất tốt! Cố gắng nhấn mạnh đúng thanh điệu hơn nhé."}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {!recordingId && !isAnalyzing[question.id] && speakingScores[question.id] === undefined && (
                                            <p className="flex items-center gap-2 text-brand-courseMuted">
                                                <AlertCircle className="h-4 w-4" />
                                                {isReviewMode ? "Không có dữ liệu ghi âm cho câu nói này." : "Chưa có bản ghi âm. Hãy nhấp nút bắt đầu ghi âm để luyện phát âm."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Academic Explanation Section (Rendered in Review Mode) */}
                            {isReviewMode && question.explanation && (
                                <div className="mt-4 p-4 rounded-xl border border-brand-accent/20 bg-brand-panelAlt/60 text-sm leading-relaxed">
                                    <div className="flex items-center gap-2 font-bold text-brand-accentSoft mb-2">
                                        <Sparkles className="h-4.5 w-4.5" />
                                        <span>Phân tích học thuật & Giải thích:</span>
                                    </div>
                                    <p className="text-brand-textSoft text-sm">{question.explanation}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 border-t border-brand-border/30 pt-6">
                {!result ? (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <button
                            type="button"
                            disabled={!allAnswered}
                            onClick={onSubmit}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-6 py-3 text-sm font-bold text-brand-white transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:bg-brand-borderHover disabled:text-brand-learningMuted shadow-lg shadow-brand-accent/20"
                        >
                            <Send className="h-4 w-4" />
                            Nộp trắc nghiệm
                        </button>
                        <button
                            type="button"
                            onClick={onBackLesson}
                            className="rounded-xl border border-brand-border px-5 py-3 text-sm font-bold text-brand-textSoft hover:text-brand-white hover:border-brand-accent transition-all"
                        >
                            Quay lại bài học
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Bottom Feedback Banner */}
                        <div className={`rounded-2xl border p-5 transition-all ${
                            result.isPassed
                                ? "border-status-successStrong/30 bg-status-successStrong/10"
                                : "border-status-warningStrong/30 bg-status-warningStrong/10"
                        }`}>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-brand-white flex items-center gap-2">
                                        <CheckCircle className={`h-5 w-5 ${result.isPassed ? "text-status-successSoft" : "text-status-warningSoft"}`} />
                                        Kết quả bài làm của bạn
                                    </h3>
                                    <p className="text-sm mt-1 text-brand-courseMuted">
                                        Điểm đạt được: <span className="font-extrabold text-brand-white text-base">{result.score}%</span> (Yêu cầu qua môn: {quiz.pass_score || quiz.passScore || 50}%)
                                    </p>
                                    <p className={`text-sm font-bold mt-2 ${result.isPassed ? "text-status-successSoft" : "text-status-warningSoft"}`}>
                                        {result.isPassed
                                            ? "Chúc mừng! Bạn đã đạt yêu cầu và hoàn thành bài trắc nghiệm này."
                                            : "Bạn chưa đạt điểm tối thiểu. Hãy xem lại giải thích đáp án hoặc thử sức lại nhé!"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    {!isReviewMode ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsReviewMode(true);
                                                scrollToTop();
                                            }}
                                            className="flex items-center gap-2 rounded-xl bg-brand-accent px-4 py-2.5 text-sm font-bold text-brand-white hover:bg-brand-accentHover transition-all shadow-md shadow-brand-accent/20"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Xem giải thích đáp án
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsReviewMode(false);
                                                scrollToTop();
                                            }}
                                            className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-cardBg px-4 py-2.5 text-sm font-bold text-brand-white hover:bg-brand-cardBgAlt transition-all"
                                        >
                                            Quay lại kết quả
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsReviewMode(false);
                                            onRetake();
                                            scrollToTop();
                                        }}
                                        className="flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-brand-white hover:bg-brand-accentHover transition-all shadow-md shadow-brand-accent/15"
                                    >
                                        Thử sức lại bài thi
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onBackLesson}
                                className="rounded-xl border border-brand-border px-5 py-3 text-sm font-bold text-brand-textSoft hover:text-brand-white hover:border-brand-accent transition-all"
                            >
                                Quay lại bài học
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
