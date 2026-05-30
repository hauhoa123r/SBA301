export default function PopularCourses({ courses }) {
    return (
        <section className="container mx-auto px-6 pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Popular Courses</h2>
                <div className="flex items-center bg-brand-light rounded-full p-1 overflow-x-auto max-w-full hide-scrollbar">
                    <button className="px-6 py-2 rounded-full bg-brand-accent text-white text-sm font-medium whitespace-nowrap transition-colors">Design</button>
                    <button className="px-6 py-2 rounded-full text-brand-textSecondary hover:text-white text-sm font-medium whitespace-nowrap transition-colors">Development</button>
                    <button className="px-6 py-2 rounded-full text-brand-textSecondary hover:text-white text-sm font-medium whitespace-nowrap transition-colors">Business</button>
                    <button className="px-6 py-2 rounded-full text-brand-textSecondary hover:text-white text-sm font-medium whitespace-nowrap transition-colors">Data Science</button>
                    <button className="px-6 py-2 rounded-full text-brand-textSecondary hover:text-white text-sm font-medium whitespace-nowrap transition-colors">Marketing</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course) => (
                    <article key={course.id} className="bg-brand-cardBg rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-300 border border-brand-light hover:border-brand-accent/30 shadow-lg">
                        <div className={`h-48 bg-gradient-to-br ${course.gradient} relative p-6 flex flex-col justify-end`}>
                            <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                                <div className="w-32 h-24 bg-white bg-opacity-10 rounded border border-white border-opacity-20 backdrop-blur-sm flex items-center justify-center text-xs text-white">
                                    Placeholder Image
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-brand-textSecondary flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" fillRule="evenodd"></path>
                                    </svg>
                                    10x Lesson
                                </span>
                                <span className="bg-brand-light text-brand-accent text-xs px-2.5 py-1 rounded-md font-medium">{course.category}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-4 line-clamp-2 group-hover:text-brand-accent transition-colors">
                                {course.title}
                            </h3>
                            <div className="flex items-center gap-3 mb-6 mt-auto">
                                <div className="w-8 h-8 rounded-full bg-purple-900 border border-brand-light flex items-center justify-center text-xs font-bold text-purple-300">
                                    {course.instructor.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{course.instructor}</p>
                                    <p className="text-xs text-brand-textSecondary">{course.role}</p>
                                </div>
                                <div className="ml-auto text-xs text-brand-textSecondary">
                                    {course.students}
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-brand-light">
                                <div className="flex text-amber-400 text-sm">★★★★★</div>
                                <a className="text-sm font-medium text-brand-accent hover:text-brand-accentHover transition-colors" href="#">Enroll Now</a>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}