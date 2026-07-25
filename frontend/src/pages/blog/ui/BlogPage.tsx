import { ArrowRight, CalendarDays, Clock, Search } from "lucide-react";
import { AnimatedCard, UserImage, UserReveal, UserStagger } from "@/shared/ui";
import { BLOG_POSTS } from "../model/blogContent";

export function BlogPage() {
    return (
        <section className="user-ui-scope container mx-auto px-4 py-12 text-brand-textPrimary sm:px-6 sm:py-14" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                <UserReveal as="div" className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" distance={22}>
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
                        <label htmlFor="blog-search" className="sr-only">Tìm kiếm bài viết</label>
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" aria-hidden="true" />
                        <input
                            id="blog-search"
                            type="search"
                            placeholder="Tìm kiếm bài viết..."
                            className="h-12 w-full rounded-xl border border-brand-accent/20 bg-brand-light py-3 pl-11 pr-4 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30"
                        />
                    </div>
                </UserReveal>

                <UserStagger as="div" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-full" step={70} distance={24}>
                    {BLOG_POSTS.map((post) => (
                        <AnimatedCard
                            as="article"
                            key={post.id}
                            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-accent/10 bg-brand-cardBg shadow-xl shadow-brand-accent/5 hover:border-brand-accent/40"
                        >
                            <div className="aspect-video overflow-hidden">
                                <UserImage
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                />
                            </div>

                            <div className="flex flex-1 flex-col p-6">
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

                                <button type="button" className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-accentSoft transition hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-4 focus-visible:ring-offset-brand-cardBg">
                                    Đọc bài viết
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        </AnimatedCard>
                    ))}
                </UserStagger>
        </section>
    );
}
