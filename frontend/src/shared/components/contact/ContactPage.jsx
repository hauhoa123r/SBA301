import { MessageCircle, Send } from "lucide-react";
import { CONTACT_METHODS, CONTACT_TOPICS } from "../../services/contact/contact.mockup";

export default function ContactPage() {
    return (
        <section className="container mx-auto px-6 py-14 text-brand-textPrimary" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                <div className="mb-12 max-w-3xl">
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
                </div>

                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                    <section className="flex flex-col gap-4">
                        {CONTACT_METHODS.map(({ icon: Icon, title, value, description }) => (
                            <div key={title} className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-xl shadow-brand-accent/5">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-brand-white" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                    {title}
                                </h2>
                                <p className="mt-1 font-semibold text-brand-accentSoft">{value}</p>
                                <p className="mt-2 text-sm leading-6 text-brand-textSecondary">{description}</p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-2xl border border-brand-accent/10 bg-brand-cardBg p-6 shadow-xl shadow-brand-accent/5 md:p-8">
                        <div className="mb-7 flex items-center gap-3">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accentSoft">
                                <MessageCircle className="h-5 w-5" />
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
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nguyen Van A"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Địa chỉ email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Chủ đề
                                </label>
                                <select className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition focus:border-brand-accent/60">
                                    {CONTACT_TOPICS.map((topic) => (
                                        <option key={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Nội dung
                                </label>
                                <textarea
                                    rows="6"
                                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                                    className="w-full resize-none rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                />
                            </div>

                            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover md:w-auto">
                                <Send className="h-4 w-4" />
                                Gửi tin nhắn
                            </button>
                        </form>
                    </section>
                </div>
        </section>
    );
}
