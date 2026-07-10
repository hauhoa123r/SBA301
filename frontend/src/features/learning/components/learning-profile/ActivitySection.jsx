import useActivityHeatmap from "../../hooks/useActivityHeatmap";
import ActivityHeatmap from "./ActivityHeatmap";
import HeatLegend from "./HeatLegend";

export default function ActivitySection() {
    const { days, values } = useActivityHeatmap();

    return (
        <div className="mt-5 rounded-2xl border border-brand-accent/15 bg-brand-menu p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-black">Tần suất học tập</h3>
                <div className="flex flex-wrap gap-3 text-xs text-brand-textSecondary">
                    <HeatLegend color="bg-brand-borderSoft" label="Không có hoạt động" />
                    <HeatLegend color="bg-brand-accentMuted" label="<15 phút" />
                    <HeatLegend color="bg-brand-accent" label="15-60 phút" />
                    <HeatLegend color="bg-brand-accentSoft" label=">60 phút" />
                </div>

                
            </div>
            <ActivityHeatmap days={days} values={values} />
            <p className="mt-5 text-sm text-brand-textSecondary">
                <span className="font-bold text-brand-textMutedLight">Lưu ý:</span> Dữ liệu tần suất hiện là dữ liệu mẫu để mô phỏng bảng điều khiển trước khi kết nối API tiến độ.
            </p>
        </div>
    );
}
