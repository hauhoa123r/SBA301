import { UserRound } from "lucide-react";
import LevelItem from "./LevelItem";
import AnimatedCard from "../../../../shared/components/animation/AnimatedCard";

export default function ProfileHero({ studentName }) {
    return (
        <div className="grid gap-5 xl:grid-cols-[1fr_520px]">
            <AnimatedCard className="rounded-2xl border border-brand-accent/15 bg-brand-light p-5">
                <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-accent text-brand-white">
                        <UserRound className="h-9 w-9" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-brand-accentSoft">Xin chào, {studentName}</p>
                        <h3 className="mt-1 text-xl font-black">Hãy tiếp tục học mỗi ngày</h3>
                        <p className="mt-2 text-sm text-brand-textSecondary">Nỗ lực của bạn sẽ được đền đáp qua từng chương.</p>
                    </div>
                </div>
            </AnimatedCard>

            <AnimatedCard className="rounded-2xl border border-brand-accent/15 bg-brand-menu p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-black">Trình độ HSK của bạn</h3>
                    <button type="button" className="rounded-xl border border-brand-accent/30 px-3 py-2 text-sm font-bold text-brand-accentSoft hover:text-brand-white">
                        Chỉnh sửa hồ sơ
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <LevelItem label="Đầu vào" value="0" />
                    <LevelItem label="Dự đoán" value="0" blue />
                    <LevelItem label="Mục tiêu" value="6" target />
                </div>
            </AnimatedCard>
        </div>
    );
}
