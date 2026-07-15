import { Star } from "lucide-react";
import { TESTIMONIALS } from "../../../../shared/services/home/home.mockup";
import AnimatedCard from "../../../../shared/components/animation/AnimatedCard";
import UserImage from "../../../../shared/components/animation/UserImage";
import UserReveal from "../../../../shared/components/animation/UserReveal";
import UserStagger from "../../../../shared/components/animation/UserStagger";

export default function TestimonialsSection() {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <UserReveal as="div" className="mb-12 text-center md:mb-16" distance={20}>
                    <p className="text-brand-accent text-sm font-semibold uppercase tracking-widest mb-2">Cảm nhận học viên</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-brand-white max-w-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                        Những học viên đã bứt phá
                    </h2>
                </UserReveal>
                <UserStagger as="div" className="grid grid-cols-1 gap-6 md:grid-cols-3" itemClassName="h-full" step={75} distance={24}>
                    {TESTIMONIALS.map(({ name, role, avatar, text, stars, course }) => (
                        <AnimatedCard as="article" key={name} className="flex h-full flex-col gap-5 rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6 hover:border-brand-accent/30">
                            <div className="flex gap-0.5">
                                {Array.from({ length: stars }).map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-status-warning text-status-warning" aria-hidden="true" />
                                ))}
                                <span className="sr-only">{stars} trên 5 sao</span>
                            </div>
                            <blockquote className="flex-1 text-sm leading-relaxed text-brand-textMutedLight" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>“{text}”</blockquote>
                            <div className="text-xs text-brand-accent font-semibold">{course}</div>
                            <div className="flex items-center gap-3 pt-2 border-t border-brand-accent/10">
                                <UserImage src={avatar} alt={`Ảnh đại diện của ${name}`} className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-accent/20" />
                                <div>
                                    <div className="text-brand-white text-sm font-semibold" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>{name}</div>
                                    <div className="text-brand-textSecondary text-xs">{role}</div>
                                </div>
                            </div>
                        </AnimatedCard>
                    ))}
                </UserStagger>
            </div>
        </section>
    );
}
