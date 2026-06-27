import { STATS } from "../../course/services/mockup";

export default function StatsBar() {
    return (
        <section className="border-y border-brand-accent/10 bg-brand-light/40">
            <div className="container mx-auto px-6 py-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {STATS.map(({ value, label }) => (
                        <div key={label}>
                            <div className="text-3xl md:text-4xl font-extrabold text-brand-white mb-1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                                {value}
                            </div>
                            <div className="text-brand-textSecondary text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}