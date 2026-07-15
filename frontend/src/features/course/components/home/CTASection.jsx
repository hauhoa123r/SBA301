import { ArrowRight } from "lucide-react";
import UserReveal from "../../../../shared/components/animation/UserReveal";

export default function CTASection() {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <UserReveal as="div" className="relative overflow-hidden rounded-3xl" distance={26} duration={650}>
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
                            <a href="#" className="flex items-center justify-center gap-2 rounded-full bg-brand-white px-8 py-3.5 text-sm font-semibold text-brand-accent no-underline shadow-xl transition-all hover:scale-[1.02] hover:bg-error-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-accent">
                                Bắt đầu miễn phí <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </a>
                            <a href="#" className="flex items-center justify-center gap-2 rounded-full border border-brand-white/30 px-8 py-3.5 text-sm font-semibold text-brand-white no-underline transition-all hover:border-brand-white/60 hover:bg-brand-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-accent">
                                Xem tất cả khóa học
                            </a>
                        </div>
                    </div>
                </UserReveal>
            </div>
        </section>
    );
}
