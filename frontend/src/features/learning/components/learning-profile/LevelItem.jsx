import { Target } from "lucide-react";

export default function LevelItem({ label, value, blue = false, target = false }) {
    return (
        <div>
            <div className="mb-3 flex items-center">
                <span className="h-3 w-3 rounded-full border-2 border-brand-accentSoft bg-brand-menu" />
                <span className="h-px flex-1 border-t border-dashed border-brand-levelLocked" />
                {target && <Target className="h-5 w-5 text-brand-accentSoft" />}
            </div>
            <p className="text-sm font-semibold text-brand-textSecondary">{label}</p>
            <p className={`mt-2 text-xl font-black ${blue ? "text-brand-accentSoft" : "text-brand-white"}`}>{value}</p>
        </div>
    );
}
