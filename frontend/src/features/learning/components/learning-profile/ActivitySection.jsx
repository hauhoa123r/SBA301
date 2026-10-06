import useActivityHeatmap from "../../hooks/useActivityHeatmap";
import ActivityHeatmap from "./ActivityHeatmap";

export default function ActivitySection() {
    const { data, loading, error } = useActivityHeatmap();
    return <section className="mt-5 space-y-4 rounded-2xl border border-brand-border bg-brand-menu p-5">
        <h3 className="text-lg font-black">Hoạt động học tập · 12 tuần gần nhất</h3>
        {loading ? <p role="status">Đang tải hoạt động...</p> : error ? <p role="alert" className="text-status-danger">{error}</p> : <ActivityHeatmap data={data} />}
        <p className="text-xs text-brand-textSecondary">Mỗi ô hiển thị số thao tác học đã lưu (đánh dấu bài, làm quiz, nộp bài tập). Màu đậm hơn tương ứng thời gian xem video: dưới 15 phút, 15–60 phút, trên 60 phút. Hoạt động được ghi nhận từ khi tính năng này được kích hoạt.</p>
    </section>;
}
