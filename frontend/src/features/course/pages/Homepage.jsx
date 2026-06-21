import HeroSection from "../../../shared/components/HeroSection";
import StatsBar from "../../../features/course-catalog/components/StatsBar";
import CoursesSection from "../../../features/course-catalog/components/CoursesSection";
import FeaturesSection from "../../../features/course-catalog/components/FeaturesSection";
import TestimonialsSection from "../../../features/course-catalog/components/TestimonialsSection";
import CTASection from "../../../features/course-catalog/components/CTASection";
import HeroFooter from "../../../shared/components/HeroFooter";
import HeroHeader from "../../../shared/components/HeroHeader";
export default function Homepage() {
    return (
        <div className="min-h-screen bg-[#090514] text-[#f8fafc]">
            <HeroHeader />
            <main>
                <HeroSection />
                <StatsBar />
                <CoursesSection />
                <FeaturesSection />
                <TestimonialsSection />
                <CTASection />
            </main>
            <HeroFooter />
        </div>
    );
}