import { MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/model/useAuth";
import { useRef, useState, type FormEvent } from "react";
import { axiosClient, getApiErrorMessage, getApiErrorStatus } from "@/shared/api";
import { AnimatedCard, UserReveal, UserStagger } from "@/shared/ui";
import { CONTACT_METHODS, CONTACT_TOPICS } from "../model/contactContent";

export function ContactPage() {
    const { user } = useAuth();
    const sending = useRef(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (sending.current) return;
        const form = event.currentTarget;
        const values = new FormData(form);
        const body = Object.fromEntries(["fullName", "email", "topic", "message"].map(key => {
            const value = values.get(key); return [key, typeof value === "string" ? value.trim() : ""];
        }));
        if (Object.values(body).some(value => !value)) { setError("Vui lòng điền đầy đủ các trường."); return; }
        sending.current = true; setBusy(true); setError(""); setSuccess(false);
        try {
            await axiosClient.post("/api/contact", body, { timeout: 15000 });
            form.reset(); setSuccess(true);
        } catch (e) {
            setError(getApiErrorStatus(e) === 429 ? "Bạn đã gửi nhiều tin nhắn. Vui lòng thử lại sau 10 phút." : getApiErrorMessage(e));
        } finally { sending.current = false; setBusy(false); }
    }
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
                        Bạn cần hỗ trợ về khóa học, gói đăng ký, thanh toán hoặc muốn góp ý về website? Gửi tin nhắn cho đội ngũ Edujar.
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
                                <p className="text-sm text-brand-textSecondary">Góp ý của bạn sẽ được gửi đến đội ngũ Edujar.</p>
                            </div>
                        </div>

                        <form className="grid gap-5" onSubmit={event => { void submit(event); }} aria-busy={busy}>
                            <p className="text-sm leading-6 text-brand-textSecondary">{user ? "Khi Edujar trả lời, bạn sẽ nhận được thông báo trong khu vực học tập." : <>Bạn có thể gửi góp ý không cần tài khoản. <Link className="text-brand-accentSoft underline" to="/login" state={{ from: { pathname: "/contact" } }}>Đăng nhập</Link> trước khi gửi để nhận trả lời qua thông báo.</>}</p>
                            {success && <p role="status" className="text-brand-accentSoft">Đã gửi phản hồi thành công. Cảm ơn bạn đã góp ý!</p>}
                            {error && <p role="alert" className="text-red-300">{error}</p>}
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label htmlFor="contact-name" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        id="contact-name"
                                        name="fullName"
                                        required maxLength={100} disabled={busy}
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
                                        required maxLength={254} disabled={busy}
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
                                <select id="contact-topic" name="topic" required disabled={busy} className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30">
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
                                    rows={6}
                                    id="contact-message"
                                    name="message"
                                    required maxLength={5000} disabled={busy}
                                    placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ gì..."
                                    className="w-full resize-none rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm text-brand-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60 focus-visible:ring-2 focus-visible:ring-brand-accent/30"
                                />
                            </div>

                            <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-white shadow-lg shadow-brand-accent/25 transition hover:bg-brand-accentHover disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accentSoft focus-visible:ring-offset-2 focus-visible:ring-offset-brand-cardBg md:w-auto">
                                <Send className="h-4 w-4" aria-hidden="true" />
                                {busy ? "Đang gửi…" : "Gửi tin nhắn"}
                            </button>
                        </form>
                    </UserReveal>
                </div>
        </section>
    );
}
