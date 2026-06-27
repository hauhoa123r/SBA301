import { Award, BookOpen, GraduationCap, ShieldCheck, Users, Zap } from "lucide-react";
import HeroFooter from "../components/HeroFooter";
import HeroHeader from "../components/HeroHeader";

const highlights = [
    { icon: Users, value: "120K+", label: "Active learners" },
    { icon: BookOpen, value: "1,800+", label: "Expert courses" },
    { icon: GraduationCap, value: "340+", label: "Instructors" },
    { icon: Award, value: "98%", label: "Satisfaction rate" },
];

const values = [
    {
        icon: Zap,
        title: "Practical learning",
        description: "Courses focus on usable skills, guided practice, quizzes, assignments, and measurable progress.",
    },
    {
        icon: ShieldCheck,
        title: "Quality-first content",
        description: "Teacher courses are reviewed before publication so students can learn with confidence.",
    },
    {
        icon: Users,
        title: "Connected community",
        description: "Students can discuss lessons, ask questions, review courses, and grow together.",
    },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <HeroHeader />

            <main>
                <section className="relative overflow-hidden px-6 py-24">
                    <div className="absolute inset-0 pointer-events-none">
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
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                                About Edujar
                            </p>
                            <h1
                                className="text-4xl font-extrabold leading-tight text-brand-white md:text-6xl"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                A smarter place to build real learning momentum
                            </h1>
                            <p className="mt-5 text-base leading-7 text-brand-textSecondary md:text-lg">
                                Edujar is an online learning platform for students, teachers, and education teams. The system supports courses, learning progress, quizzes, assignments, certificates, subscriptions, reviews, and community discussions.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-4 md:grid-cols-4">
                            {highlights.map(({ icon: Icon, value, label }) => (
                                <div key={label} className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-5 text-center shadow-xl shadow-brand-accent/5">
                                    <Icon className="mx-auto mb-3 h-5 w-5 text-brand-accentSoft" />
                                    <div className="text-2xl font-extrabold text-brand-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                        {value}
                                    </div>
                                    <div className="mt-1 text-sm text-brand-textSecondary">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="px-6 pb-24">
                    <div className="container mx-auto grid gap-6 md:grid-cols-3">
                        {values.map(({ icon: Icon, title, description }) => (
                            <article key={title} className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-xl shadow-brand-accent/5">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h2 className="text-xl font-bold text-brand-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                    {title}
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-brand-textSecondary">{description}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </main>

            <HeroFooter />
        </div>
    );
}
