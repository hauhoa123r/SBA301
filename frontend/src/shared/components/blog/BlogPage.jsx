import { ArrowRight, CalendarDays, Clock, Search } from "lucide-react";
import { BLOG_POSTS } from "../../services/blog/blog.mockup";

export default function BlogPage() {
    return (
        <section className="container mx-auto px-6 py-14 text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                            Bài viết
                        </p>
                        <h1
                            className="text-4xl font-extrabold text-brand-white md:text-5xl"
                            style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                        >
                            Mẹo học tiếng Trung và hướng dẫn ôn HSK
                        </h1>
                        <p className="mt-4 text-sm leading-6 text-brand-textSecondary md:text-base">
                            Các bài viết giúp học viên củng cố từ vựng, phát âm, ngữ pháp tiếng Trung và tự tin hơn khi luyện thi.
                        </p>
                    </div>

                    <div className="relative w-full max-w-md">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                        <input
                            placeholder="Tìm kiếm bài viết..."
                            className="h-12 w-full rounded-xl border border-brand-accent/20 bg-brand-light py-3 pl-11 pr-4 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {BLOG_POSTS.map((post) => (
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
                                <span className="rounded-lg border border-brand-accent/20 bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-brand-accentSoft">
                                    {post.category}
                                </span>
                                <h2 className="mt-4 min-h-16 text-xl font-bold leading-8 text-brand-white transition group-hover:text-brand-accentSoft" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
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

                                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-accentSoft transition hover:text-brand-white">
                                    Đọc bài viết
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
        </section>
    );
}
