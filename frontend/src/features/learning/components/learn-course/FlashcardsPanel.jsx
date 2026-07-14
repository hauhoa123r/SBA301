import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Volume2, RotateCw, Sparkles } from "lucide-react";

export default function FlashcardsPanel({ vocabularies = [] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    if (!vocabularies || vocabularies.length === 0) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-brand-border bg-brand-surface p-8 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-brand-accentSoft/40 animate-pulse" />
                <h3 className="text-xl font-bold">Chưa có từ vựng</h3>
                <p className="mt-2 text-sm text-brand-courseMuted">Bài học này hiện chưa được thiết lập dữ liệu từ vựng flashcard.</p>
            </div>
        );
    }

    const currentVocab = vocabularies[currentIndex];

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : vocabularies.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < vocabularies.length - 1 ? prev + 1 : 0));
    };

    const playAudio = (e) => {
        e.stopPropagation();
        if (currentVocab.audioUrl) {
            const audio = new Audio(currentVocab.audioUrl);
            audio.play().catch((err) => console.log("Audio play failed:", err));
        } else {
            // Text-to-speech fallback or web speech API
            const utterance = new SpeechSynthesisUtterance(currentVocab.hanzi);
            utterance.lang = "zh-CN";
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-brand-surface border border-brand-border rounded-2xl">
            {/* Top Info Bar */}
            <div className="w-full flex items-center justify-between mb-6 text-sm">
                <span className="font-bold text-brand-accentSoft">
                    BỘ THẺ TỪ VỰNG ({currentIndex + 1}/{vocabularies.length})
                </span>
                <span className="text-brand-courseMuted">Nhấp vào thẻ để lật xem nghĩa</span>
            </div>

            {/* 3D Flip Card Container */}
            <div
                className="relative w-full max-w-md h-80 cursor-pointer [perspective:1000px] group mb-8"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div
                    className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                >
                    {/* FRONT SIDE (Hanzi, Pinyin) */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl border border-brand-border bg-gradient-to-br from-brand-panel via-brand-surface to-brand-panel p-8 flex flex-col items-center justify-between [backface-visibility:hidden] shadow-lg">
                        <div className="w-full flex justify-end">
                            <button
                                onClick={playAudio}
                                className="p-3 rounded-full bg-brand-quizPanel border border-brand-border hover:bg-brand-accent/20 hover:border-brand-accent text-brand-accentSoft transition-all"
                                title="Nghe phát âm"
                            >
                                <Volume2 className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center flex-grow">
                            <span className="text-6xl font-extrabold font-serif tracking-wide text-brand-white">
                                {currentVocab.hanzi}
                            </span>
                            <span className="text-2xl font-medium text-brand-accentSoft mt-4">
                                {currentVocab.pinyin}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-brand-courseMuted font-semibold">
                            <RotateCw className="h-3.5 w-3.5" />
                            Xem nghĩa tiếng Việt
                        </div>
                    </div>

                    {/* BACK SIDE (Meaning, Image) */}
                    <div className="absolute inset-0 w-full h-full rounded-2xl border border-brand-border bg-gradient-to-br from-brand-panel via-brand-surface to-brand-panel p-6 flex flex-col items-center justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg">
                        <div className="w-full flex items-center justify-between text-xs text-brand-courseMuted">
                            <span className="font-semibold">{currentVocab.hanzi} - {currentVocab.pinyin}</span>
                            <button
                                onClick={playAudio}
                                className="p-2 rounded-full bg-brand-quizPanel border border-brand-border hover:bg-brand-accent/20 text-brand-accentSoft transition-all"
                            >
                                <Volume2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center justify-center flex-grow gap-4 w-full">
                            {currentVocab.imageUrl ? (
                                <img
                                    src={currentVocab.imageUrl}
                                    alt={currentVocab.hanzi}
                                    className="h-28 w-28 object-cover rounded-xl border border-brand-border shadow-sm bg-brand-panel"
                                />
                            ) : (
                                <div className="h-24 w-24 flex items-center justify-center rounded-xl bg-brand-quizPanel border border-brand-border text-brand-courseMuted">
                                    <Sparkles className="h-8 w-8 animate-pulse text-brand-accentSoft/30" />
                                </div>
                            )}
                            <span className="text-2xl font-extrabold text-brand-white text-center px-4 leading-tight">
                                {currentVocab.vietnameseMeaning}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-brand-courseMuted font-semibold">
                            <RotateCw className="h-3.5 w-3.5" />
                            Xem chữ Hán
                        </div>
                    </div>
                </div>
            </div>

            {/* Deck Navigation Controls */}
            <div className="flex items-center gap-6">
                <button
                    onClick={handlePrev}
                    className="p-3 rounded-xl border border-brand-border bg-brand-panel hover:bg-brand-accent/20 text-brand-textSoft hover:text-brand-white hover:border-brand-accent transition-all"
                    title="Từ trước"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="px-6 py-2.5 rounded-xl border border-brand-border bg-brand-panel text-sm font-bold text-brand-textSoft">
                    {currentIndex + 1} / {vocabularies.length}
                </div>
                <button
                    onClick={handleNext}
                    className="p-3 rounded-xl border border-brand-border bg-brand-panel hover:bg-brand-accent/20 text-brand-textSoft hover:text-brand-white hover:border-brand-accent transition-all"
                    title="Từ tiếp theo"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
