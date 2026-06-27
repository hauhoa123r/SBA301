import useActivityHeatmap from "../hooks/useActivityHeatmap";
import ActivityHeatmap from "./ActivityHeatmap";
import HeatLegend from "./HeatLegend";

export default function ActivitySection() {
    const { days, values } = useActivityHeatmap();

    return (
        <div className="mt-5 rounded-2xl border border-[#7c3aed]/15 bg-[#0f0920] p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-black">Tần suất học tập</h3>
                <div className="flex flex-wrap gap-3 text-xs text-[#94a3b8]">
                    <HeatLegend color="bg-[#2a1a4d]" label="Không có hoạt động" />
                    <HeatLegend color="bg-[#4c2b82]" label="<15 phút" />
                    <HeatLegend color="bg-[#7c3aed]" label="15-60 phút" />
                    <HeatLegend color="bg-[#a78bfa]" label=">60 phút" />
                </div>

                
            </div>
            <ActivityHeatmap days={days} values={values} />
            <p className="mt-5 text-sm text-[#94a3b8]">
                <span className="font-bold text-[#cbd5e1]">Lưu ý:</span> Dữ liệu tần suất đang là mock để mô phỏng dashboard trước khi nối API tiến độ.
            </p>
        </div>
    );
}
