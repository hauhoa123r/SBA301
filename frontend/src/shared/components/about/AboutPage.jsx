import { ABOUT_HIGHLIGHTS, ABOUT_VALUES } from "../../services/about/about.mockup";
import AnimatedCard from "../animation/AnimatedCard";
import UserReveal from "../animation/UserReveal";
import UserStagger from "../animation/UserStagger";

export default function AboutPage() {
    return (
        <div className="user-ui-scope text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                <section className="relative overflow-hidden px-6 py-24">
                    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                        <div className="absolute left-[-10%] top-[-25%] h-[520px] w-[520px] rounded-full bg-brand-accent/15 blur-[120px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] h-[460px] w-[460px] rounded-full bg-brand-accentDeep/25 blur-[110px]" />
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `linear-gradient(var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px), linear-gradient(90deg, var(--color-brand-accent) 1px, var(--color-brand-transparent) 1px)`,
                                backgroundSize: "60px 60px",
                            }}
                        />
                    </div>

                    <div className="container relative z-10 mx-auto">
                        <UserReveal as="div" className="mx-auto max-w-3xl text-center" distance={22} duration={600}>
                            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                                Về Edujar
                            </p>
                            <h1
                                className="text-4xl font-extrabold leading-tight text-brand-white md:text-6xl"
                                style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                            >
                                Học tiếng Trung theo lộ trình rõ ràng từ pinyin đến giao tiếp thực tế
                            </h1>
                            <p className="mt-5 text-base leading-7 text-brand-textSecondary md:text-lg">
                                Edujar giúp người Việt học tiếng Trung qua bài học bám sát HSK, từ vựng thực tế, luyện phát âm và ôn tập có hướng dẫn. Mỗi khóa học được thiết kế để tiếng Trung dễ hiểu, dễ nhớ và dùng được trong đời sống hằng ngày.
                            </p>
                        </UserReveal>

                        <UserStagger as="div" className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-14 md:grid-cols-4" itemClassName="h-full" step={65} distance={20}>
                            {ABOUT_HIGHLIGHTS.map(({ icon: Icon, value, label }) => (
                                <AnimatedCard as="article" key={label} className="h-full rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-5 text-center shadow-xl shadow-brand-accent/5 hover:border-brand-accent/30">
                                    <Icon className="mx-auto mb-3 h-5 w-5 text-brand-accentSoft" aria-hidden="true" />
                                    <div className="text-2xl font-extrabold text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                        {value}
                                    </div>
                                    <div className="mt-1 text-sm text-brand-textSecondary">{label}</div>
                                </AnimatedCard>
                            ))}
                        </UserStagger>
                    </div>
                </section>

                <section className="px-6 pb-24">
                    <UserStagger as="div" className="container mx-auto grid gap-6 md:grid-cols-3" itemClassName="h-full" step={75} distance={24}>
                        {ABOUT_VALUES.map(({ icon: Icon, title, description }) => (
                            <AnimatedCard as="article" key={title} className="h-full rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-xl shadow-brand-accent/5 hover:border-brand-accent/30">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h2 className="text-xl font-bold text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                    {title}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-brand-textSecondary">{description}</p>
                            </AnimatedCard>
                        ))}
                    </UserStagger>
                </section>
        </div>
    );
}
