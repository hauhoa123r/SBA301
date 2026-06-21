import { Link } from "react-router-dom";
import { FaGoogle, FaLinkedinIn } from "react-icons/fa";
import { Lock, Mail, User, UserPlus, Zap } from "lucide-react";
import HeroHeader from "../../../shared/components/HeroHeader";
import HeroFooter from "../../../shared/components/HeroFooter";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-brand-dark text-brand-textPrimary flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-accent/15 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] h-[420px] w-[420px] rounded-full bg-[#4c1d95]/20 blur-[100px]" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>

            <HeroHeader />

            <main className="relative z-10 flex flex-1 items-center justify-center p-6">
                <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-brand-accent/15 shadow-2xl shadow-brand-accent/10 md:grid-cols-2">
                    <section className="bg-brand-cardBg p-8 md:p-10">
                        <div className="mb-8">
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-accent/20 bg-brand-accent/10 text-[#a78bfa]">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <h1
                                className="mb-2 text-3xl font-extrabold text-white"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                Create an account
                            </h1>
                            <p className="text-sm leading-6 text-brand-textSecondary">
                                Join Edujar to access courses, track progress, and build your learning journey.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm font-semibold text-white transition hover:border-brand-accent/50 hover:bg-brand-accent/10">
                                <FaGoogle className="h-4 w-4" />
                                Google
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 text-sm font-semibold text-white transition hover:border-brand-accent/50 hover:bg-brand-accent/10">
                                <FaLinkedinIn className="h-4 w-4" />
                                LinkedIn
                            </button>
                        </div>

                        <div className="my-7 flex items-center gap-3">
                            <div className="h-px flex-1 bg-brand-accent/10" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                or register with email
                            </span>
                            <div className="h-px flex-1 bg-brand-accent/10" />
                        </div>

                        <form className="space-y-5">
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                    <input
                                        type="text"
                                        placeholder="Nguyen Van A"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-textSecondary" />
                                    <input
                                        type="password"
                                        placeholder="At least 6 characters"
                                        className="w-full rounded-xl border border-brand-accent/20 bg-brand-light px-4 py-3 pl-11 text-sm text-white outline-none transition placeholder:text-brand-textSecondary/50 focus:border-brand-accent/60"
                                    />
                                </div>
                            </div>

                            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-accent/30 transition hover:bg-brand-accentHover hover:shadow-brand-accent/50">
                                <UserPlus className="h-4 w-4" />
                                Create Account
                            </button>
                        </form>

                        <p className="mt-6 text-center text-sm text-brand-textSecondary">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-[#a78bfa] no-underline transition hover:text-white">
                                Sign in
                            </Link>
                        </p>
                    </section>

                    <section className="relative hidden overflow-hidden bg-brand-dark p-10 text-white md:flex md:flex-col md:justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95]/60 via-brand-dark to-brand-dark" />
                        <div className="absolute right-[-70px] top-[-70px] h-[280px] w-[280px] rounded-full bg-brand-accent/20 blur-[80px]" />
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(#a78bfa 1px, transparent 1px), linear-gradient(90deg, #a78bfa 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-accent/25 bg-brand-accent/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
                                <Zap className="h-3 w-3" />
                                Student Portal
                            </div>
                            <h2
                                className="mb-3 text-4xl font-extrabold leading-tight"
                                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                            >
                                Start learning with expert courses
                            </h2>
                            <p className="max-w-sm text-sm leading-6 text-brand-textSecondary">
                                Create your account to save courses, follow your progress, and earn certificates as you learn.
                            </p>
                        </div>

                        <div className="relative z-10 my-10 flex justify-center">
                            <img
                                src="/images/undraw_morning-news_h9nz.svg"
                                alt="Student learning illustration"
                                className="max-h-72 w-auto drop-shadow-2xl"
                            />
                        </div>

                        <div className="relative z-10 grid grid-cols-3 gap-3">
                            {[
                                { value: "1,800+", label: "Courses" },
                                { value: "340+", label: "Teachers" },
                                { value: "98%", label: "Success" },
                            ].map(({ value, label }) => (
                                <div key={label} className="rounded-xl border border-brand-accent/20 bg-brand-accent/10 p-3 text-center">
                                    <div className="text-base font-bold text-white" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                        {value}
                                    </div>
                                    <div className="mt-0.5 text-xs text-brand-textSecondary">{label}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            <HeroFooter />
        </div>
    );
}
