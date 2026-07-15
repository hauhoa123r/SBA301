import { useState } from "react";
import { Volume2, Sparkles, MessageCircle } from "lucide-react";

export default function SentencePatternsPanel({ sentencePatterns = [] }) {
    const [playingId, setPlayingId] = useState(null);

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
        if (pattern.audioUrl) {
            setPlayingId(pattern.id);
            const audio = new Audio(pattern.audioUrl);
            audio.play()
                .then(() => {
                    audio.onended = () => setPlayingId(null);
                })
                .catch((err) => {
                    console.log("Audio play failed:", err);
                    setPlayingId(null);
                });
        } else {
            // Speech fallback
            setPlayingId(pattern.id);
            const utterance = new SpeechSynthesisUtterance(pattern.chineseText);
            utterance.lang = "zh-CN";
            utterance.onend = () => setPlayingId(null);
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
                                title="Nghe phát âm"
                                aria-label={`Nghe phát âm mẫu câu ${index + 1}`}
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
