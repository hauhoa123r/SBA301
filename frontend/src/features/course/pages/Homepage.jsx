import HeroSection from "../../../shared/components/HeroSection";
import StatsBar from "../../../features/course-catalog/components/StatsBar";
import FeaturesSection from "../../../features/course-catalog/components/FeaturesSection";
import TestimonialsSection from "../../../features/course-catalog/components/TestimonialsSection";
import CTASection from "../../../features/course-catalog/components/CTASection";

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
