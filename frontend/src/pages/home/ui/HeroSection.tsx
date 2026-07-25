import { ArrowRight, BookOpen, Play, Star, Zap } from "lucide-react";
import { UserImage, UserReveal } from "@/shared/ui";
import { HOME_HERO } from "../model/homeContent";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-accent/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-brand-accentDeep/30 blur-[100px]" />
                <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-brand-accent/10 blur-[80px]" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <UserReveal distance={18} duration={520}>
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-accentSoft sm:mb-8">
                            <Zap className="h-3 w-3" aria-hidden="true" />
                            {HOME_HERO.badge}
                        </div>
                    </UserReveal>
                    <UserReveal delay={60} distance={22} duration={560}>
                        <h1
                            className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-brand-white sm:text-5xl md:text-7xl"
                            style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                        >
                            {HOME_HERO.titlePrefix}{" "}
                            <span className="relative inline-block">
                                <span className="bg-gradient-to-r from-brand-accent via-brand-accentSoft to-brand-accent bg-clip-text text-brand-transparent">
                                    {HOME_HERO.titleHighlight}
                                </span>
                            </span>
                            <br />{HOME_HERO.titleSuffix}
                        </h1>
                    </UserReveal>
                    <UserReveal delay={110} distance={20} duration={580}>
                        <p className="mx-auto mb-9 max-w-2xl text-base leading-relaxed text-brand-textSecondary sm:text-lg md:mb-10 md:text-xl" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                            {HOME_HERO.description}
                        </p>
                    </UserReveal>
                    <UserReveal delay={160} distance={18} duration={580}>
                        <div className="mb-12 flex flex-col items-stretch justify-center gap-4 sm:mb-14 sm:flex-row sm:items-center">
                            <a href="/courses" className="flex items-center justify-center gap-2 rounded-full bg-brand-accent px-8 py-3.5 text-sm font-semibold text-brand-white no-underline shadow-lg shadow-brand-accent/30 transition-all hover:scale-[1.02] hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark">
                                {HOME_HERO.primaryCta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </a>
                            <a href="#" className="flex items-center justify-center gap-2 rounded-full border border-brand-accent/30 px-8 py-3.5 text-sm font-semibold text-brand-textPrimary no-underline transition-all hover:border-brand-accent/60 hover:bg-brand-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent/20">
                                    <Play className="h-3 w-3 fill-brand-accentSoft text-brand-accentSoft" aria-hidden="true" />
                                </span>
                                {HOME_HERO.secondaryCta}
                            </a>
                        </div>
                    </UserReveal>
                    <UserReveal delay={210} distance={26} duration={680} className="relative mx-auto max-w-3xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/40 via-brand-accentSoft/20 to-brand-accent/40 rounded-2xl blur-sm" />
                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-brand-accent/20 bg-brand-cardBg">
                            <UserImage
                                src={HOME_HERO.image}
                                alt={HOME_HERO.imageAlt}
                                priority
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-brand-transparent" />
                        </div>
                        <div className="absolute -left-6 top-8 bg-brand-cardBg border border-brand-accent/20 rounded-xl px-4 py-3 shadow-xl hidden sm:flex items-center gap-3">
                            <div className="w-9 h-9 bg-brand-accent/15 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-brand-accentSoft" aria-hidden="true" />
                            </div>
                            <div>
                                <div className="text-brand-white text-sm font-semibold">{HOME_HERO.leftStat.value}</div>
                                <div className="text-brand-textSecondary text-xs">{HOME_HERO.leftStat.label}</div>
                            </div>
                        </div>
                        <div className="absolute -right-6 bottom-10 bg-brand-cardBg border border-brand-accent/20 rounded-xl px-4 py-3 shadow-xl hidden sm:flex items-center gap-3">
                            <div className="w-9 h-9 bg-success/10 rounded-lg flex items-center justify-center">
                                <Star className="h-4 w-4 fill-success-soft text-success-soft" aria-hidden="true" />
                            </div>
                            <div>
                                <div className="text-brand-white text-sm font-semibold">{HOME_HERO.rightStat.value}</div>
                                <div className="text-brand-textSecondary text-xs">{HOME_HERO.rightStat.label}</div>
                            </div>
                        </div>
                    </UserReveal>
                </div>
            </div>
        </section>
    );
}
