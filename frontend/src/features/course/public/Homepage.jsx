import HeroSection from "../../../shared/components/HeroSection";
import StatsBar from "../components/StatsBar";
import FeaturesSection from "../components/FeaturesSection";
import TestimonialsSection from "../components/TestimonialsSection";
import CTASection from "../components/CTASection";

export default function Homepage() {
    return (
        <>
            <HeroSection />
            <StatsBar />
            <FeaturesSection />
            <TestimonialsSection />
            <CTASection />
        </>
    );
}
