import { Link } from "react-router-dom";

export default function ProfileProgressItem({ item, firstLesson }) {
    return (
        <div className={`flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center ${item.active ? "border-[#7c3aed]/70 bg-[#160e2e]" : "border-[#7c3aed]/15 bg-[#120922]"}`}>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#2a1a4d] text-lg font-black text-[#a78bfa]">
                {item.level}
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="text-base font-black">{item.title}</h4>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#94a3b8]">
                    <span>Tổng số cúp đã đạt <span className="font-bold text-amber-300">🏆 {item.cups}</span></span>
                    <span>Số units đạt 2 cúp trở lên <span className="font-bold text-white">{item.units} Units</span></span>
                </div>
            </div>
            {item.active && (
                <Link to={`/learning/courses/1/lessons/${firstLesson.id}`} className="rounded-xl bg-[#7c3aed] px-4 py-2 text-sm font-bold text-white no-underline hover:bg-[#6d28d9]">
                    Tiếp tục
                </Link>
            )}
        </div>
    );
}
