import { UserRound } from "lucide-react";
import LevelItem from "./LevelItem";

export default function ProfileHero({ studentName }) {
    return (
        <div className="grid gap-5 xl:grid-cols-[1fr_520px]">
            <div className="rounded-2xl border border-[#7c3aed]/15 bg-[#160e2e] p-5">
                <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#7c3aed] text-white">
                        <UserRound className="h-9 w-9" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#a78bfa]">Hi, {studentName}</p>
                        <h3 className="mt-1 text-xl font-black">Hãy tiếp tục học mỗi ngày</h3>
                        <p className="mt-2 text-sm text-[#94a3b8]">Nỗ lực của bạn sẽ được đền đáp qua từng chapter.</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-[#7c3aed]/15 bg-[#0f0920] p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-black">Trình độ HSK của bạn</h3>
                    <button type="button" className="rounded-xl border border-[#7c3aed]/30 px-3 py-2 text-sm font-bold text-[#a78bfa] hover:text-white">
                        Chỉnh sửa hồ sơ
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <LevelItem label="Đầu vào" value="0" />
                    <LevelItem label="Dự đoán" value="0" blue />
                    <LevelItem label="Mục tiêu" value="6" target />
                </div>
            </div>
        </div>
    );
}
