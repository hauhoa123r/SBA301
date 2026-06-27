import { ArrowRight, CalendarDays, Clock, Search } from "lucide-react";
import HeroFooter from "../components/HeroFooter";
import HeroHeader from "../components/HeroHeader";

const posts = [
    {
        id: 1,
        category: "Learning",
        title: "How to stay consistent when learning online",
        excerpt: "Build a weekly study rhythm with clear goals, small wins, reminders, and progress tracking.",
        date: "Jun 12, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=520&fit=crop&auto=format",
    },
    {
        id: 2,
        category: "Teachers",
        title: "Designing quizzes that actually measure skill",
        excerpt: "Good quizzes test understanding, give useful feedback, and help students know what to practice next.",
        date: "Jun 08, 2026",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=520&fit=crop&auto=format",
    },
    {
        id: 3,
        category: "Platform",
        title: "Why certificates matter in self-paced learning",
        excerpt: "Certificates help students prove completion, organize achievement, and share progress with others.",
        date: "May 28, 2026",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=520&fit=crop&auto=format",
    },
    {
        id: 4,
        category: "Community",
        title: "Making discussions useful inside every course",
        excerpt: "A strong discussion space turns questions into shared knowledge between learners and teachers.",
        date: "May 20, 2026",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=520&fit=crop&auto=format",
    },
    {
        id: 5,
        category: "Payments",
        title: "Choosing the right subscription plan",
        excerpt: "Compare access, duration, and learning goals before purchasing a paid plan.",
        date: "May 14, 2026",
        readTime: "3 min read",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=520&fit=crop&auto=format",
    },
    {
        id: 6,
        category: "Gamification",
        title: "Using streaks and badges without losing focus",
        excerpt: "Motivation tools work best when they support meaningful learning instead of replacing it.",
        date: "May 03, 2026",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=520&fit=crop&auto=format",
    },
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary" style={{ fontFamily: "'Inter', sans-serif" }}>
            <HeroHeader />

            <main className="container mx-auto px-6 py-14">
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                            Blog
                        </p>
                        <h1
                            className="text-4xl font-extrabold text-white md:text-5xl"
                            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                        >
                            Learning insights and platform updates
                        </h1>
                        <p className="mt-4 text-sm leading-6 text-brand-textSecondary md:text-base">
                            Articles for students, teachers, and platform teams building better online learning experiences.
                        </p>
                    </div>

                    <div className="relative w-full max-w-md">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                        <input
                            placeholder="Search articles..."
                            className="h-12 w-full rounded-xl border border-brand-accent/20 bg-brand-light py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            className="group overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5 transition hover:-translate-y-1 hover:border-brand-accent/40"
                        >
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="p-6">
                                <span className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-[#a78bfa]">
                                    {post.category}
                                </span>
                                <h2 className="mt-4 min-h-16 text-xl font-bold leading-8 text-white transition group-hover:text-[#a78bfa]" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                    {post.title}
                                </h2>
                                <p className="mt-3 min-h-18 text-sm leading-6 text-brand-textSecondary">{post.excerpt}</p>

                                <div className="mt-5 flex items-center gap-4 text-xs text-brand-textSecondary">
                                    <span className="inline-flex items-center gap-1">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {post.date}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {post.readTime}
                                    </span>
                                </div>

                                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#a78bfa] transition hover:text-white">
                                    Read article
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
