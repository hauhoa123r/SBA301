import { BookOpenCheck, ClipboardList, Clock3, Trophy } from "lucide-react";
import ProfileProgressItem from "./ProfileProgressItem";
import ProfileStat from "./ProfileStat";
import { UserStagger } from "@/shared/ui";

export default function ProfileProgress({ course, firstLesson, totalLessons }) {
    const progressItems = [
        { level: "4.0", title: course.displayTitle, cups: "76/195", units: "26/65", active: true },
        { level: "5.0", title: "HSK 3 Cơ bản", cups: "11/207", units: "4/69" },
        { level: "6.0", title: "HSK 3 Trung cấp", cups: "1/255", units: "0/85" },
    ];

    return (
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
            <div className="rounded-2xl border border-brand-accent/15 bg-brand-menu p-5">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-black">Tiến độ học tập</h3>
                    <div className="inline-flex w-fit rounded-full border border-brand-accent/20 bg-brand-light p-1">
                        {["Tổng quan", "Bài học", "Luyện kiểm tra"].map((tab, index) => (
                            <button key={tab} type="button" className={`rounded-full px-4 py-2 text-sm font-bold ${index === 0 ? "bg-brand-accent text-brand-white" : "text-brand-textSecondary"}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <UserStagger className="space-y-4" distance={18} step={60}>
                    {progressItems.map((item) => (
                        <ProfileProgressItem key={item.level} item={item} firstLesson={firstLesson} />
                    ))}
                </UserStagger>
            </div>

            <UserStagger className="grid gap-4" itemClassName="h-full" distance={18} step={55}>
                <ProfileStat icon={Clock3} label="Tổng thời lượng" value="36 giờ" color="text-brand-accentSoft" />
                <ProfileStat icon={Trophy} label="Tổng số cúp đã đạt" value="132" color="text-status-warningSoft" />
                <ProfileStat icon={ClipboardList} label="Tổng số bài test" value="10" color="text-status-danger" />
                <ProfileStat icon={BookOpenCheck} label="Tổng số bài học" value={totalLessons + 23} color="text-status-success" />
            </UserStagger>
        </div>
    );
}
