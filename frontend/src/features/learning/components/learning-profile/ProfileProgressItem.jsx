import { Link } from "react-router-dom";

export default function ProfileProgressItem({ item, firstLesson }) {
    return (
        <div className={`flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center ${item.active ? "border-brand-accent/70 bg-brand-light" : "border-brand-accent/15 bg-brand-panel"}`}>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-borderSoft text-lg font-black text-brand-accentSoft">
                {item.level}
            </div>
            <div className="min-w-0 flex-1">
                <h4 className="text-base font-black">{item.title}</h4>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-brand-textSecondary">
                    <span>Tổng số cúp đã đạt <span className="font-bold text-status-warningSoft">🏆 {item.cups}</span></span>
                    <span>Số học phần đạt 2 cúp trở lên <span className="font-bold text-brand-white">{item.units} học phần</span></span>
                </div>
            </div>
            {item.active && (
                <Link to={`/learning/courses/1/lessons/${firstLesson.id}`} className="rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-brand-white no-underline hover:bg-brand-accentHover">
                    Tiếp tục
                </Link>
            )}
        </div>
    );
}
