import { Target } from "lucide-react";

export default function LevelItem({ label, value, blue = false, target = false }) {
    return (
        <div>
            <div className="mb-3 flex items-center">
                <span className="h-3 w-3 rounded-full border-2 border-[#a78bfa] bg-[#0f0920]" />
                <span className="h-px flex-1 border-t border-dashed border-[#4b3672]" />
                {target && <Target className="h-5 w-5 text-[#a78bfa]" />}
            </div>
            <p className="text-sm font-semibold text-[#94a3b8]">{label}</p>
            <p className={`mt-2 text-xl font-black ${blue ? "text-[#a78bfa]" : "text-white"}`}>{value}</p>
        </div>
    );
}
