import { ArrowRight, BookOpen, Play, Star, Zap } from "lucide-react";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-24 pb-32">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7c3aed]/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#4c1d95]/30 blur-[100px]" />
                <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#7c3aed]/10 blur-[80px]" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }}
                />
            </div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-[#7c3aed]/10 border border-[#7c3aed]/25 text-[#a78bfa] text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wider uppercase">
                        <Zap className="w-3 h-3" />
                        #1 Online Learning Platform in Vietnam
                    </div>
                    <h1
                        className="text-5xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                        Unlock Your{" "}
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#7c3aed]">
                                Full Potential
                            </span>
                        </span>
                        <br />with Expert Courses
                    </h1>
                    <p className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Join 120,000+ learners mastering in-demand skills through hands-on courses taught by Vietnam's top industry practitioners.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
                        <a href="#" className="flex items-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3.5 rounded-full font-semibold text-sm no-underline transition-all shadow-lg shadow-[#7c3aed]/30 hover:scale-[1.02]">
                            Explore Courses <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#" className="flex items-center gap-2 text-[#f8fafc] border border-[#7c3aed]/30 hover:border-[#7c3aed]/60 px-8 py-3.5 rounded-full font-semibold text-sm no-underline transition-all hover:bg-[#7c3aed]/5">
                            <div className="w-7 h-7 rounded-full bg-[#7c3aed]/20 flex items-center justify-center">
                                <Play className="w-3 h-3 text-[#a78bfa] fill-[#a78bfa]" />
                            </div>
                            Watch Demo
                        </a>
                    </div>
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7c3aed]/40 via-[#a78bfa]/20 to-[#7c3aed]/40 rounded-2xl blur-sm" />
                        <div className="relative rounded-2xl overflow-hidden border border-[#7c3aed]/20">
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=480&fit=crop&auto=format"
                                alt="Students learning together on Edujar"
                                className="w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#090514]/60 to-transparent" />
                        </div>
                        <div className="absolute -left-6 top-8 bg-[#1c1236] border border-[#7c3aed]/20 rounded-xl px-4 py-3 shadow-xl hidden sm:flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#7c3aed]/15 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-[#a78bfa]" />
                            </div>
                            <div>
                                <div className="text-white text-sm font-semibold">1,800+ Courses</div>
                                <div className="text-[#94a3b8] text-xs">Updated weekly</div>
                            </div>
                        </div>
                        <div className="absolute -right-6 bottom-10 bg-[#1c1236] border border-[#7c3aed]/20 rounded-xl px-4 py-3 shadow-xl hidden sm:flex items-center gap-3">
                            <div className="w-9 h-9 bg-green-500/10 rounded-lg flex items-center justify-center">
                                <Star className="w-4 h-4 text-green-400 fill-green-400" />
                            </div>
                            <div>
                                <div className="text-white text-sm font-semibold">4.9 / 5 Stars</div>
                                <div className="text-[#94a3b8] text-xs">From 48,000 reviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}