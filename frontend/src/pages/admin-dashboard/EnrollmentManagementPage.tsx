import { useState } from "react";
import { DateControls, Metric, ValueChart } from "@/features/admin-dashboard/analytics";
import { defaultDates, type LearningReport } from "@/features/admin-dashboard/analyticsModel";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { ManagementShell, ResourceStatus } from "./ManagementShell";

export function EnrollmentManagementPage() {
  const [dates, setDates] = useState(() => ({ ...defaultDates(), includeLab: true }));
  const resource = useAdminResource<LearningReport>(`/api/admin/learning-analytics?${new URLSearchParams({ from: dates.from, to: dates.to, includeLab: "true" })}`);
  const data = resource.data;
  return <ManagementShell title="Ghi danh & chuyển đổi học tập">
    <DateControls value={dates} onChange={setDates} maxDays={93} />
    <ResourceStatus {...resource} retry={resource.refresh} />
    {data && <><div className="admin-cards"><Metric title="Tổng lượt ghi danh" value={data.summary.totalEnrollments} /><Metric title="Học viên đã ghi danh" value={data.summary.uniqueEnrolledStudents} /><Metric title="Đã bắt đầu học" value={data.summary.studentsStarted} /><Metric title="Hoàn thành ≥1 bài" value={data.summary.studentsCompletedLesson} /></div>
      <ValueChart title="Lượt ghi danh theo ngày" rows={data.enrollmentTrend.map(day => ({ label: day.date, value: day.enrollments }))} />
    </>}
  </ManagementShell>;
}
