import { ChevronRight } from "lucide-react";
import CourseCard from "./CourseCard";
import { useState } from "react";
import { CATEGORIES, COURSES } from "../../course/services/mockup";

export default function CoursesSection() {
    const [activeCategory, setActiveCategory] = useState("All");
    const categories = ["All", ...CATEGORIES];
    const filtered = activeCategory === "All" ? COURSES : COURSES.filter((c) => c.category === activeCategory);

    return (
        <section className="py-24 px-6">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-[#7c3aed] text-sm font-semibold uppercase tracking-widest mb-2">Browse Courses</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            Learn From the Best
                        </h2>
                    </div>
                    <a href="#" className="flex items-center gap-1.5 text-[#a78bfa] hover:text-white text-sm font-semibold no-underline transition-colors shrink-0">
                        View all courses <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${activeCategory === cat
                                    ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/25"
                                    : "border-[#7c3aed]/20 text-[#94a3b8] hover:border-[#7c3aed]/50 hover:text-white"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((course) => <CourseCard key={course.id} course={course} />)}
                </div>
            </div>
        </section>
    );
}