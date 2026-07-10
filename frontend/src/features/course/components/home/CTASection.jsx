import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-accentDeep via-brand-accent to-brand-accentStrong" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(var(--color-brand-white) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-white) 1px, var(--color-brand-transparent) 1px)`, backgroundSize: "40px 40px" }} />
                    <div className="relative z-10 px-8 md:px-16 py-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-brand-white mb-4 leading-tight" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                            Sẵn sàng bắt đầu học?
                        </h2>
                        <p className="text-error-accentPale text-base md:text-lg mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                            Tham gia cùng hơn 120.000 học viên đang xây dựng tương lai với Edujar.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#" className="flex items-center gap-2 bg-brand-white text-brand-accent hover:bg-error-surface px-8 py-3.5 rounded-full font-semibold text-sm no-underline transition-all shadow-xl hover:scale-[1.02]">
                                Bắt đầu miễn phí <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href="#" className="flex items-center gap-2 text-brand-white border border-brand-white/30 hover:border-brand-white/60 px-8 py-3.5 rounded-full font-semibold text-sm no-underline transition-all hover:bg-brand-white/5">
                                Xem tất cả khóa học
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
