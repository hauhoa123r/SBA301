export default function HeroLogo() {

    return (
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center text-brand-white shadow-lg shadow-brand-accent/30">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 8.56l-1.222.524a1 1 0 000 1.838l7 3a1 1 0 00.788 0l7-3a1 1 0 000-1.838l-1.222-.524-5.383 2.307a1 1 0 01-.788 0L3.31 8.56z" />
                </svg>
            </div>
            <span
                className="text-xl font-bold text-brand-accent tracking-wide"
                style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
            >
                Edujar
            </span>
        </div>
    );
}