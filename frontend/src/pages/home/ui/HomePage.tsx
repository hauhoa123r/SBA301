import CTASection from "./CTASection";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import StatsBar from "./StatsBar";
import TestimonialsSection from "./TestimonialsSection";
import { Link } from "react-router-dom";

export function HomePage() {
    return (
        <div className="user-ui-scope overflow-x-clip">
            <HeroSection />
            <StatsBar />
            <FeaturesSection />
            <section className="mx-auto max-w-5xl px-6 py-12 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-brand-accentSoft">Free Trial · Standard · Premium</p>
                <h2 className="mt-3 text-3xl font-black text-brand-white">Một gói đăng ký, toàn bộ khóa học</h2>
                <p className="mt-4 text-brand-textSecondary">Chọn thời điểm bắt đầu, khám phá thư viện và học theo nhịp của bạn.</p>
                <Link to="/subscriptions" className="mt-6 inline-flex rounded-full bg-brand-accent px-7 py-3 font-bold text-white">Xem gói học và học thử</Link>
            </section>
            <TestimonialsSection />
            <CTASection />
        </div>
    );
}
