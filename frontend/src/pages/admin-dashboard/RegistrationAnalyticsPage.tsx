import { useState } from "react";
import { DateControls, Metric, ValueChart } from "@/features/admin-dashboard/analytics";
import { defaultDates, downloadRegistrationCsv, type RegistrationReport } from "@/features/admin-dashboard/analyticsModel";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

export function RegistrationAnalyticsPage() {
  const [dates, setDates] = useState(defaultDates);
  const query = new URLSearchParams({ from: dates.from, to: dates.to, mode: dates.mode, includeLab: String(dates.includeLab) });
  const resource = useAdminResource<RegistrationReport>(`/api/admin/registration-analytics?${query}`);
  const data = resource.data;
  return <ManagementShell title="Thống kê đăng ký tài khoản">
    <DateControls value={dates} onChange={setDates} lab hourly />
    <ResourceStatus {...resource} retry={resource.refresh} />
    {data && <><div className="admin-cards">
      <Metric title="Đăng ký trong khoảng" value={data.total} />
      <Metric title="Kỳ trước" value={data.previousTotal} />
      <Metric title="Thay đổi (%)" value={data.changePercent} detail={data.changePercent === null ? "Kỳ trước bằng 0, không tính phần trăm." : "So với khoảng liền trước có cùng số ngày."} />
      <Metric title="Học viên ACTIVE hiện tại" value={data.activeStudents} />
    </div>
      <ValueChart title="Xu hướng đăng ký" rows={data.buckets.map(b => ({ label: b.label, value: b.count }))} />
      <button className="admin-button" onClick={() => downloadRegistrationCsv(data.buckets)}>Tải CSV</button>
      <section className="admin-panel"><h2>Giờ cần xem xét</h2><p className="admin-note">Tín hiệu số lượng đăng ký tăng cao; cần kiểm tra thêm nguồn và hành vi trước khi kết luận.</p>
        {data.hourlySignals.length ? <ul>{data.hourlySignals.map(s => <li key={s.hour}>{s.hour}: {s.count} đăng ký</li>)}</ul> : <p>Không có giờ vượt ngưỡng trong khoảng chọn.</p>}</section>
      {data.notes.map(note => <p className="admin-note" key={note}>{note}</p>)}
    </>}
  </ManagementShell>;
}
