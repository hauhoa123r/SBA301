import { Star } from "lucide-react";
import { TESTIMONIALS } from "../../../../shared/services/home/home.mockup";

export default function TestimonialsSection() {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <p className="text-brand-accent text-sm font-semibold uppercase tracking-widest mb-2">Cảm nhận học viên</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-brand-white max-w-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                        Những học viên đã bứt phá
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map(({ name, role, avatar, text, stars, course }) => (
                        <div key={name} className="bg-brand-cardBg border border-brand-accent/10 rounded-2xl p-6 flex flex-col gap-5 hover:border-brand-accent/30 transition-all">
                            <div className="flex gap-0.5">
                                {Array.from({ length: stars }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-status-warning fill-status-warning" />
                                ))}
                            </div>
                            <p className="text-brand-textMutedLight text-sm leading-relaxed flex-1" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>"{text}"</p>
                            <div className="text-xs text-brand-accent font-semibold">{course}</div>
                            <div className="flex items-center gap-3 pt-2 border-t border-brand-accent/10">
                                <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-accent/20" />
                                <div>
                                    <div className="text-brand-white text-sm font-semibold" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>{name}</div>
                                    <div className="text-brand-textSecondary text-xs">{role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
