import { Search, SlidersHorizontal } from "lucide-react";
import ChapterCourseCard from "./ChapterCourseCard";

const courseFilters = ["Tất cả chương", "Đã mở", "Đang học", "Đã hoàn thành"];

export default function MyCoursesView({ course }) {
    return (
        <section id="my-courses" className="scroll-mt-24 rounded-2xl border border-[#7c3aed]/20 bg-[#120922] p-5 shadow-xl shadow-black/10">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-xl font-black">Khóa học của tôi</h2>
                    <p className="mt-1 max-w-3xl text-sm text-[#94a3b8]">
                        Các chapter trong {course.displayTitle} được chia theo từng mục tiêu học. Chọn chapter để bắt đầu lesson đầu tiên.
                    </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#7c3aed]/20 bg-[#0f0920] px-4 py-2 text-sm font-bold text-[#cbd5e1]">
                    <SlidersHorizontal className="h-4 w-4 text-[#a78bfa]" />
                    Khóa học hiện tại
                </div>
            </div>

            <div className="mb-5 flex flex-col gap-3 border-b border-[#7c3aed]/15 pb-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    {courseFilters.map((item, index) => (
                        <button
                            key={item}
                            type="button"
                            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                                index === 0
                                    ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                                    : "border-[#7c3aed]/20 bg-[#160e2e] text-[#94a3b8] hover:text-white"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <label className="flex w-full items-center gap-2 rounded-full border border-[#7c3aed]/20 bg-[#0f0920] px-4 py-2 text-sm text-[#94a3b8] lg:w-64">
                    <Search className="h-4 w-4" />
                    <span>Tìm kiếm chapter</span>
                </label>
            </div>

            <div className="mb-5 flex items-center gap-4">
                <h3 className="text-lg font-black">{course.displayTitle}</h3>
                <span className="text-sm text-[#94a3b8]">{course.chapters.length} chapters</span>
                <span className="text-sm text-amber-300">🏆 92/243</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {course.chapters.map((chapter) => (
                    <ChapterCourseCard key={chapter.id} course={course} chapter={chapter} />
                ))}
            </div>
        </section>
    );
}
