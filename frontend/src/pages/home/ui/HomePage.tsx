import CTASection from "./CTASection";
import FeaturesSection from "./FeaturesSection";
import HeroSection from "./HeroSection";
import StatsBar from "./StatsBar";
import TestimonialsSection from "./TestimonialsSection";

export function HomePage() {
    return (
        <div className="user-ui-scope overflow-x-clip">
            <HeroSection />
            <StatsBar />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
        </div>
    );
}
