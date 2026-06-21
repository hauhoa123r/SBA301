import { FEATURES } from "../../course/services/mockup";

export default function FeaturesSection() {
    return (
        <section className="py-24 px-6 bg-[#160e2e]/30">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <p className="text-[#7c3aed] text-sm font-semibold uppercase tracking-widest mb-2">Why Edujar</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white max-w-xl mx-auto" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Everything You Need to Succeed
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-[#1c1236] border border-[#7c3aed]/10 rounded-2xl p-6 hover:border-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/5 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 flex items-center justify-center text-[#a78bfa] mb-5 group-hover:bg-[#7c3aed]/25 transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-white font-semibold text-base mb-2" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}> {title}</h3>
                            <p className="text-[#94a3b8] text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}  >
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
