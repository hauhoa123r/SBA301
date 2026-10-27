import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCheck, Clock3, Inbox, RefreshCw } from "lucide-react";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { contactApi, contactCategories, feedbackNumber, type ContactStatistics } from "@/features/feedback/contactModel";
import { ManagementShell, ResourceStatus } from "./ManagementShell";
import "./feedbackAdmin.css";

export function FeedbackStatisticsPage() {
  const resource = useAdminResource<ContactStatistics>(`${contactApi}/statistics`);
  const data = resource.data;
  return <ManagementShell title="Thống kê Feedback"><div className="feedback-workspace">
    <section className="feedback-hero"><div><span className="feedback-eyebrow">TỔNG QUAN PHẢN HỒI</span><h2>Tiếng nói từ người dùng</h2><p>Theo dõi feedback đã nhận và tình trạng xử lý.</p></div>
      <Link className="feedback-link-button" to="/admin/feedback">Mở hộp thư <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </section>
    <ResourceStatus {...resource} retry={resource.refresh} />
    <section className="feedback-metrics" aria-label="Chỉ số feedback">
      <article className="feedback-metric is-primary"><span className="feedback-metric-icon"><Inbox size={23} aria-hidden="true" /></span><h2>Tổng feedback đã nhận</h2>
        <strong>{feedbackNumber(data?.totalReceived)}</strong><p>Phản hồi gửi từ trang liên hệ</p></article>
      <article className="feedback-metric"><span className="feedback-metric-icon is-amber"><Clock3 size={23} aria-hidden="true" /></span><h2>Chưa xử lý</h2>
        <strong>{feedbackNumber(data?.unreadCount)}</strong><Link to="/admin/feedback?status=NEW">Xem phản hồi đang chờ <ArrowUpRight size={14} aria-hidden="true" /></Link></article>
      <article className="feedback-metric"><span className="feedback-metric-icon is-green"><CheckCheck size={23} aria-hidden="true" /></span><h2>Đã xử lý</h2>
        <strong>{feedbackNumber(data?.resolvedCount)}</strong><Link to="/admin/feedback?status=RESOLVED">Xem phản hồi đã xử lý <ArrowUpRight size={14} aria-hidden="true" /></Link></article>
    </section>
    <section className="feedback-inbox"><div className="feedback-inbox-heading"><div><h2>Phản hồi theo chủ đề</h2><p>Phân bố toàn bộ feedback đã nhận</p></div>
      <button className="feedback-refresh" disabled={resource.loading} onClick={resource.refresh}><RefreshCw size={16} aria-hidden="true" />Làm mới thống kê</button></div>
      {data && <div className="feedback-breakdown">{contactCategories.map(c => {
        const count = data.categories.find(row => row.category === c.category)?.total ?? 0;
        const percentage = data.totalReceived ? count * 100 / data.totalReceived : 0;
        return <Link className="feedback-breakdown-row" data-tone={c.tone} key={c.category} to={`/admin/feedback?category=${c.category}`}>
          <span className="feedback-category-icon"><c.icon size={19} aria-hidden="true" /></span>
          <div className="feedback-breakdown-body"><div><span>{c.label}</span><strong>{feedbackNumber(count)} <small>· {percentage.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%</small></strong></div>
            <div className="feedback-track"><span style={{ width: `${percentage}%` }} /></div></div><ArrowUpRight className="feedback-row-arrow" size={17} aria-hidden="true" />
        </Link>;
      })}</div>}
      {data?.totalReceived === 0 && <p className="feedback-stats-empty">Chưa nhận được feedback. Các chỉ số sẽ cập nhật khi có phản hồi mới.</p>}
    </section>
  </div></ManagementShell>;
}
