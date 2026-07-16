import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, Sparkles, MessageCircle } from "lucide-react";

export default function SentencePatternsPanel({ sentencePatterns = [] }) {
    const [playingId, setPlayingId] = useState(null);
    const activePatternIdRef = useRef(null);
    const audioRef = useRef(null);
    const utteranceRef = useRef(null);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (utteranceRef.current) {
            utteranceRef.current.onend = null;
            utteranceRef.current.onerror = null;
            window.speechSynthesis.cancel();
            utteranceRef.current = null;
        }

        activePatternIdRef.current = null;
        setPlayingId(null);
    }, []);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.onended = null;
                audioRef.current.onerror = null;
                audioRef.current.pause();
            }

            if (utteranceRef.current) {
                utteranceRef.current.onend = null;
                utteranceRef.current.onerror = null;
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    if (!sentencePatterns || sentencePatterns.length === 0) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-brand-border bg-brand-surface p-8 text-center">
                <MessageCircle className="mb-4 h-12 w-12 text-brand-accentSoft/40 animate-pulse" />
                <h3 className="text-xl font-bold">Chưa có mẫu câu</h3>
                <p className="mt-2 text-sm text-brand-courseMuted">Bài học này hiện chưa được thiết lập dữ liệu cấu trúc mẫu câu.</p>
            </div>
        );
    }

    const playAudio = (pattern) => {
        const isCurrentPatternPlaying = activePatternIdRef.current === pattern.id;
        stopAudio();

        if (isCurrentPatternPlaying) return;

        activePatternIdRef.current = pattern.id;
        setPlayingId(pattern.id);

        if (pattern.audioUrl) {
            const audio = new Audio(pattern.audioUrl);
            audioRef.current = audio;
            audio.onended = () => {
                if (audioRef.current === audio) stopAudio();
            };
            audio.onerror = () => {
                if (audioRef.current === audio) stopAudio();
            };
            audio.play()
                .catch((err) => {
                    console.log("Audio play failed:", err);
                    if (audioRef.current === audio) stopAudio();
                });
        } else {
            // Speech fallback
            const utterance = new SpeechSynthesisUtterance(pattern.chineseText);
            utterance.lang = "zh-CN";
            utteranceRef.current = utterance;
            utterance.onend = () => {
                if (utteranceRef.current === utterance) stopAudio();
            };
            utterance.onerror = () => {
                if (utteranceRef.current === utterance) stopAudio();
            };
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="p-6 bg-brand-surface border border-brand-border rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-brand-accentSoft" />
                <h3 className="text-lg font-extrabold text-brand-white">CẤU TRÚC & MẪU CÂU THỰC HÀNH</h3>
            </div>

            <div className="space-y-4">
                {sentencePatterns.map((pattern, index) => {
                    const isPlaying = playingId === pattern.id;
                    return (
                        <div
                            key={pattern.id}
                            className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                                isPlaying
                                    ? "bg-brand-accent/10 border-brand-accent shadow-md"
                                    : "bg-brand-panel border-brand-border hover:border-brand-accent/40"
                            }`}
                        >
                            {/* Order Number Badge */}
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-quizPanel border border-brand-border text-sm font-black text-brand-accentSoft">
                                {index + 1}
                            </div>

                            {/* Text and Meanings */}
                            <div className="flex-grow min-w-0">
                                <h4 className="text-xl font-bold font-serif tracking-wide text-brand-white leading-relaxed">
                                    {pattern.chineseText}
                                </h4>
                                <p className="text-sm font-medium text-brand-accentSoft mt-1.5 font-sans">
                                    {pattern.pinyinText}
                                </p>
                                <p className="text-sm text-brand-courseMuted mt-2 leading-relaxed">
                                    {pattern.vietnameseMeaning}
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                type="button"
                                onClick={() => playAudio(pattern)}
                                className={`p-3 rounded-xl border transition-all shrink-0 ${
                                    isPlaying
                                        ? "bg-brand-accent text-brand-white border-brand-accent"
                                        : "bg-brand-quizPanel border-brand-border hover:bg-brand-accent/20 hover:border-brand-accent text-brand-accentSoft"
                                }`}
                                title={isPlaying ? "Dừng phát âm" : "Nghe phát âm"}
                                aria-label={`${isPlaying ? "Dừng" : "Nghe"} phát âm mẫu câu ${index + 1}`}
                            >
                                {isPlaying ? (
                                    <div className="flex items-center gap-1">
                                        <div className="h-3 w-0.5 bg-brand-white animate-[bounce_0.8s_infinite_100ms]" />
                                        <div className="h-3 w-0.5 bg-brand-white animate-[bounce_0.8s_infinite_200ms]" />
                                        <div className="h-3 w-0.5 bg-brand-white animate-[bounce_0.8s_infinite_300ms]" />
                                    </div>
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
