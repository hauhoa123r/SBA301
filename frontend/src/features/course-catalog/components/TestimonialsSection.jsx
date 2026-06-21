import { Star } from "lucide-react";
import { TESTIMONIALS } from "../../course/services/mockup";

export default function TestimonialsSection() {
    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[#7c3aed] text-sm font-semibold uppercase tracking-widest mb-2">Testimonials</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white max-w-xl mx-auto" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Learners Who Made the Leap
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TESTIMONIALS.map(({ name, role, avatar, text, stars, course }) => (
                        <div key={name} className="bg-[#1c1236] border border-[#7c3aed]/10 rounded-2xl p-6 flex flex-col gap-5 hover:border-[#7c3aed]/30 transition-all">
                            <div className="flex gap-0.5">
                                {Array.from({ length: stars }).map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-[#cbd5e1] text-sm leading-relaxed flex-1" style={{ fontFamily: "'Inter', sans-serif" }}>"{text}"</p>
                            <div className="text-xs text-[#7c3aed] font-semibold">{course}</div>
                            <div className="flex items-center gap-3 pt-2 border-t border-[#7c3aed]/10">
                                <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover ring-2 ring-[#7c3aed]/20" />
                                <div>
                                    <div className="text-white text-sm font-semibold" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>{name}</div>
                                    <div className="text-[#94a3b8] text-xs">{role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}