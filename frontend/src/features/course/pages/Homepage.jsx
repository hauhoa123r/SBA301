import CoursePartners from "../../../shared/components/CoursePartners";
import Header from "../../../shared/components/HeroHeader";
import HeroSection from "../../../shared/components/HeroSection";
import PopularCourses from "./PopularCourses";
export default function Homepage() {
    const courses = [
        {
            id: 1,
            title: "Python for Financial Analysis Next and Algorithmic Trading",
            category: "Design",
            instructor: "Adam Smith",
            role: "Python Developer",
            students: "50+ Student",
            gradient: "from-purple-600 to-indigo-700",
        },
        {
            id: 2,
            title: "Python for Financial Analysis Next and Algorithmic Trading",
            category: "Design",
            instructor: "Adam Smith",
            role: "Python Developer",
            students: "50+ Student",
            gradient: "from-fuchsia-600 to-pink-600",
        },
        {
            id: 3,
            title: "Python for Financial Analysis Next and Algorithmic Trading",
            category: "Design",
            instructor: "Adam Smith",
            role: "Python Developer",
            students: "50+ Student",
            gradient: "from-violet-600 to-purple-900",
        },
    ];

    return (
        <div className="bg-brand-dark text-brand-textPrimary font-sans antialiased min-h-screen">
            <Header />
            <HeroSection />
            <CoursePartners />
            <PopularCourses courses={courses} />
        </div>
    );
}