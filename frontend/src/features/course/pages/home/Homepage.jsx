import HeroSection from "../../../../shared/components/home/HeroSection";
import StatsBar from "../../components/home/StatsBar";
import FeaturesSection from "../../components/home/FeaturesSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import CTASection from "../../components/home/CTASection";

export default function Homepage() {
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
