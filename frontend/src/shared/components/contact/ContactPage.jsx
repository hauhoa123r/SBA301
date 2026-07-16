import { MessageCircle, Send } from "lucide-react";
import { CONTACT_METHODS, CONTACT_TOPICS } from "../../services/contact/contact.mockup";
import AnimatedCard from "../animation/AnimatedCard";
import UserReveal from "../animation/UserReveal";
import UserStagger from "../animation/UserStagger";

export default function ContactPage() {
    return (
        <section className="user-ui-scope container mx-auto px-4 py-12 text-brand-textPrimary sm:px-6 sm:py-14" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                <UserReveal as="div" className="mb-12 max-w-3xl" distance={22}>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-accent">
                        Liên hệ
                    </p>
                    <h1
                        className="text-4xl font-extrabold leading-tight text-brand-white md:text-5xl"
                        style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}
                    >
                        Trao đổi với đội ngũ học tiếng Trung Edujar
                    </h1>
                    <p className="mt-4 text-sm leading-6 text-brand-textSecondary md:text-base">
                        Bạn cần hỗ trợ về khóa HSK, luyện phát âm, kế hoạch học, gói đăng ký hoặc thanh toán? Gửi tin nhắn cho chúng tôi, đội ngũ Edujar sẽ phản hồi sớm.
                    </p>
                </UserReveal>

                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                    <UserStagger as="section" className="flex flex-col gap-4" itemClassName="h-full" step={70} distance={22}>
                        {CONTACT_METHODS.map(({ icon: Icon, title, value, description }) => (
                            <AnimatedCard as="article" key={title} className="h-full rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-xl shadow-brand-accent/5 hover:border-brand-accent/30">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                    <Icon className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <h2 className="text-lg font-bold text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                    {title}
                                </h2>
                                <p className="mt-1 font-semibold text-brand-accentSoft">{value}</p>
                                <p className="mt-2 text-sm leading-6 text-brand-textSecondary">{description}</p>
                            </AnimatedCard>
                        ))}
                    </UserStagger>

                    <UserReveal as="section" className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-5 shadow-xl shadow-brand-accent/5 sm:p-6 md:p-8" delay={90} distance={24}>
                        <div className="mb-7 flex items-center gap-3">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                    Gửi tin nhắn
                                </h2>
                                <p className="text-sm text-brand-textSecondary">Chúng tôi thường phản hồi trong vòng một ngày làm việc.</p>
                            </div>
                        </div>

                        <form className="grid gap-5">
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label htmlFor="contact-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        id="contact-name"
                                        name="fullName"
                                        autoComplete="name"
                                        placeholder="Nguyen Van A"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Địa chỉ email
                                    </label>
                                    <input
                                        type="email"
                                        id="contact-email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="contact-topic" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Chủ đề
                                </label>
                                <select id="contact-topic" name="topic" className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30">
                                    {CONTACT_TOPICS.map((topic) => (
                                        <option key={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="contact-message" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Nội dung
                                </label>
                                <textarea
                                    rows="6"
                                    id="contact-message"
                                    name="message"
                                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                                    className="w-full resize-none rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30"
                                />
                            </div>

                            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cardBg md:w-auto">
                                <Send className="h-4 w-4" aria-hidden="true" />
                                Gửi tin nhắn
                            </button>
                        </form>
                    </UserReveal>
                </div>
        </section>
    );
}
