import { ArrowRight } from "lucide-react";

export default function CTASection() {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95] via-[#7c3aed] to-[#5b21b6]" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
                    <div className="relative z-10 px-8 md:px-16 py-16 text-center">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            Ready to Start Learning?
                        </h2>
                        <p className="text-purple-200 text-base md:text-lg mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Join over 120,000 learners already building their future with Edujar.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#" className="flex items-center gap-2 bg-white text-[#7c3aed] hover:bg-purple-50 px-8 py-3.5 rounded-full font-semibold text-sm no-underline transition-all shadow-xl hover:scale-[1.02]">
                                Get Started Free <ArrowRight className="w-4 h-4" />
                            </a>
                            <a href="#" className="flex items-center gap-2 text-white border border-white/30 hover:border-white/60 px-8 py-3.5 rounded-full font-semibold text-sm no-underline transition-all hover:bg-white/5">
                                View All Courses
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}