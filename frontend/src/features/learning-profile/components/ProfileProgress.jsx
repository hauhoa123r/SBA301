import { BookOpenCheck, ClipboardList, Clock3, Trophy } from "lucide-react";
import ProfileProgressItem from "./ProfileProgressItem";
import ProfileStat from "./ProfileStat";

export default function ProfileProgress({ course, firstLesson, totalLessons }) {
    const progressItems = [
        { level: "4.0", title: course.displayTitle, cups: "76/195", units: "26/65", active: true },
        { level: "5.0", title: "HSK 3 Cơ bản", cups: "11/207", units: "4/69" },
        { level: "6.0", title: "HSK 3 Trung cấp", cups: "1/255", units: "0/85" },
    ];

    return (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className="rounded-2xl border border-[#7c3aed]/15 bg-[#0f0920] p-5">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-black">Tiến độ học tập</h3>
                    <div className="inline-flex w-fit rounded-full border border-[#7c3aed]/20 bg-[#160e2e] p-1">
                        {["Overview", "Learning", "Test Practice"].map((tab, index) => (
                            <button key={tab} type="button" className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-[#7c3aed] text-white" : "text-[#94a3b8]"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {progressItems.map((item) => (
                        <ProfileProgressItem key={item.level} item={item} firstLesson={firstLesson} />
                    ))}
                </div>
            </div>

            <div className="grid gap-4">
                <ProfileStat icon={Clock3} label="Tổng thời lượng" value="36 giờ" color="text-[#a78bfa]" />
                <ProfileStat icon={Trophy} label="Tổng số cúp đã đạt" value="132" color="text-amber-300" />
                <ProfileStat icon={ClipboardList} label="Tổng số bài test" value="10" color="text-rose-400" />
                <ProfileStat icon={BookOpenCheck} label="Tổng số bài học" value={totalLessons + 23} color="text-emerald-400" />
            </div>
        </div>
    );
}
