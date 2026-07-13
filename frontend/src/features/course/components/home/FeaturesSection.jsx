import { FEATURES } from "../../../../shared/services/home/home.mockup";

export default function FeaturesSection() {
    return (
        <section className="py-24 px-6 bg-brand-light/30">
            <div className="container mx-auto">
                <div className="text-center mb-16">
                    <p className="text-brand-accent text-sm font-semibold uppercase tracking-widest mb-2">Vì sao chọn Edujar</p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-brand-white max-w-xl mx-auto" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}>
                        Mọi thứ bạn cần để tiến bộ
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="bg-brand-cardBg border border-brand-accent/10 rounded-2xl p-6 hover:border-brand-accent/30 hover:shadow-lg hover:shadow-brand-accent/5 transition-all group">
                            <div className="w-10 h-10 rounded-xl bg-brand-accent/15 flex items-center justify-center text-brand-accentSoft mb-5 group-hover:bg-brand-accent/25 transition-colors">
                                <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-brand-white font-semibold text-base mb-2" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}> {title}</h3>
                            <p className="text-brand-textSecondary text-sm leading-relaxed" style={{ fontFamily: "'Be Vietnam Pro', 'Noto Sans SC', sans-serif" }}  >
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
