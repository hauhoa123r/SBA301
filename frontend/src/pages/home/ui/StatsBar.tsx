import { UserStagger } from "@/shared/ui";
import { STATS } from "../model/homeContent";

export default function StatsBar() {
    return (
        <section className="border-y border-brand-accent/10 bg-brand-light/40">
            <div className="container mx-auto px-6 py-10">
                <UserStagger as="div" className="grid grid-cols-2 gap-7 text-center md:grid-cols-4 md:gap-8" itemClassName="h-full" step={70} distance={18}>
                    {STATS.map(({ value, label }) => (
                        <div key={label} className="rounded-2xl px-2 py-2 transition-colors hover:bg-brand-accent/5">
                            <div className="text-3xl md:text-4xl font-extrabold text-brand-white mb-1" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                                {value}
                            </div>
                            <div className="text-brand-textSecondary text-sm" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>{label}</div>
                        </div>
                    ))}
                </UserStagger>
            </div>
        </section>
    );
}
