import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, CheckCheck, Clock3, Inbox, Mail, MessageSquare, RefreshCw, RotateCcw } from "lucide-react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { dateTime, useAdminResource } from "@/features/admin-dashboard/management";
import { ResourceStatus } from "@/pages/admin-dashboard/ManagementShell";
import { categoryOf, contactApi, contactCategories, feedbackNumber, validCategory,
  type ContactInboxData, type ContactMessage, type ContactStatistics } from "./contactModel";

function MessageCard({ message, busy, onStatus, onReply }: { message: ContactMessage; busy: boolean; onStatus: () => void; onReply: (text: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false), [reply, setReply] = useState("");
  const category = categoryOf(message.topic);
  return <article className={`feedback-message ${message.status === "NEW" ? "is-new" : ""}`}>
    <div className="feedback-message-heading">
      <span className="feedback-topic" data-tone={category.tone}><category.icon size={14} aria-hidden="true" />{category.label}</span>
      <span className={`feedback-status ${message.status === "NEW" ? "is-new" : "is-resolved"}`}>
        {message.status === "NEW" ? <Clock3 size={13} aria-hidden="true" /> : <CheckCheck size={13} aria-hidden="true" />}
        {message.status === "NEW" ? "Chưa xử lý" : "Đã xử lý"}
      </span>
    </div>
    <div className="feedback-sender"><span className="feedback-avatar" aria-hidden="true">{message.fullName.slice(0, 1).toLocaleUpperCase("vi-VN")}</span>
      <div><h3>{message.fullName}</h3><a href={`mailto:${encodeURIComponent(message.email)}`}><Mail size={13} aria-hidden="true" />{message.email}</a></div>
    </div>
    <p className={`feedback-message-body ${expanded ? "is-expanded" : ""}`}>{message.message}</p>
    {message.message.length > 350 && <button className="feedback-read-more" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? "Thu gọn" : "Đọc tiếp"}</button>}
    {message.reply ? <section className="feedback-reply"><h4><MessageSquare size={15} />Edujar đã trả lời</h4><p>{message.reply}</p>
      {message.repliedAt && <time dateTime={message.repliedAt}>{dateTime(message.repliedAt)}</time>}</section>
      : <div className="feedback-reply-compose"><button className="feedback-read-more" disabled={busy} aria-expanded={replyOpen} onClick={() => setReplyOpen(!replyOpen)}>{replyOpen ? "Đóng trả lời" : "Trả lời góp ý"}</button>
        {replyOpen && <form onSubmit={event => { event.preventDefault(); if (reply.trim() && !busy) void onReply(reply.trim()); }}>
          <label htmlFor={`feedback-reply-${message.id}`}>Nội dung trả lời</label><textarea id={`feedback-reply-${message.id}`} value={reply} onChange={event => setReply(event.target.value)} required maxLength={5000} rows={4} disabled={busy} />
          <p>{message.registeredSender ? "Câu trả lời sẽ gửi vào thông báo của tài khoản đã gửi góp ý." : "Góp ý từ khách hoặc bản cũ chưa gắn tài khoản: chỉ lưu trả lời tại đây, không gửi thông báo hay email."}</p>
          <button className="feedback-resolve" disabled={busy || !reply.trim()}>{busy ? "Đang gửi…" : "Gửi trả lời"}</button>
        </form>}
      </div>}
    <footer className="feedback-message-footer"><time dateTime={message.createdAt}>{dateTime(message.createdAt)}</time>
      <button className={`feedback-resolve ${message.status === "RESOLVED" ? "is-resolved" : ""}`} disabled={busy} onClick={onStatus}>
        {message.status === "NEW" ? <CheckCheck size={15} aria-hidden="true" /> : <RotateCcw size={15} aria-hidden="true" />}
        {message.status === "NEW" ? "Đánh dấu đã xử lý" : "Đánh dấu chưa xử lý"}
      </button>
    </footer>
  </article>;
}

export function ContactInbox() {
  const [params, setParams] = useSearchParams();
  const category = validCategory(params.get("category"));
  const status = ["NEW", "RESOLVED"].includes(params.get("status") ?? "") ? params.get("status")! : "";
  const pageValue = Number(params.get("page") ?? 0);
  const page = Number.isSafeInteger(pageValue) && pageValue >= 0 && pageValue <= 100000 ? pageValue : 0;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resource = useAdminResource<ContactInboxData>(`${contactApi}?page=${page}${status ? `&status=${status}` : ""}${category ? `&category=${category}` : ""}`);
  const stats = useAdminResource<ContactStatistics>(`${contactApi}/statistics`);
  const selected = stats.data?.categories.find(c => c.category === category);
  const counts = selected ? { total: selected.total, unread: selected.unread, resolved: selected.resolved }
    : { total: stats.data?.totalReceived, unread: stats.data?.unreadCount, resolved: stats.data?.resolvedCount };
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); next.delete("page"); setParams(next);
  }
  function goPage(next: number) { const values = new URLSearchParams(params); values.set("page", String(next)); setParams(values); }
  function refresh() { resource.refresh(); stats.refresh(); }
  async function changeStatus(message: ContactMessage) {
    if (busy) return; setBusy(true); setError("");
    try {
      await axiosClient.patch(`${contactApi}/${message.id}/status`, { status: message.status === "NEW" ? "RESOLVED" : "NEW" });
      if (status && resource.data?.content.length === 1 && page > 0) goPage(page - 1);
      refresh();
    } catch (e) { setError(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  async function replyTo(message: ContactMessage, text: string) {
    if (busy) return; setBusy(true); setError("");
    try { await axiosClient.put(`${contactApi}/${message.id}/reply`, { text }); refresh(); }
    catch (e) { setError(getApiErrorMessage(e)); } finally { setBusy(false); }
  }
  return <div className="feedback-workspace">
    <section className="feedback-hero"><div><span className="feedback-eyebrow">LẮNG NGHE NGƯỜI DÙNG</span>
      <h2>Hộp thư góp ý <MessageSquare size={25} aria-hidden="true" /></h2><p>Mỗi phản hồi là một cơ hội để Edujar tốt hơn.</p></div>
      <Link className="feedback-link-button" to="/admin/feedback/statistics">Xem thống kê <ArrowUpRight size={17} aria-hidden="true" /></Link>
    </section>
    <ResourceStatus loading={false} error={stats.error} retry={stats.refresh} />
    <nav className="feedback-categories" aria-label="Phân loại feedback">
      <button className={`feedback-category ${!category ? "is-active" : ""}`} data-tone="blue" aria-pressed={!category} disabled={busy} onClick={() => filter("category", "")}>
        <span className="feedback-category-icon"><Inbox size={20} aria-hidden="true" /></span><span className="feedback-category-title">Tất cả feedback</span>
        <strong>{feedbackNumber(stats.data?.totalReceived)}</strong><small>Toàn bộ phản hồi đã nhận</small>
      </button>
      {contactCategories.map(c => <button key={c.category} className={`feedback-category ${category === c.category ? "is-active" : ""}`} data-tone={c.tone}
        aria-pressed={category === c.category} disabled={busy} onClick={() => filter("category", c.category)}>
        <span className="feedback-category-icon"><c.icon size={20} aria-hidden="true" /></span><span className="feedback-category-title">{c.label}</span>
        <strong>{feedbackNumber(stats.data?.categories.find(row => row.category === c.category)?.total)}</strong><small>Phản hồi đã nhận</small>
      </button>)}
    </nav>
    <section className="feedback-inbox" aria-labelledby="contact-inbox-title">
      <div className="feedback-inbox-heading"><div><h2 id="contact-inbox-title">{contactCategories.find(c => c.category === category)?.label ?? "Tất cả phản hồi"}</h2>
        <p>{feedbackNumber(counts.unread)} phản hồi chưa xử lý</p></div>
        <button className="feedback-refresh" disabled={resource.loading || stats.loading || busy} onClick={refresh}><RefreshCw size={16} aria-hidden="true" />Làm mới phản hồi</button>
      </div>
      <div className="feedback-status-tabs" role="group" aria-label="Lọc trạng thái feedback">
        {[["", "Tất cả", counts.total], ["NEW", "Chưa xử lý", counts.unread], ["RESOLVED", "Đã xử lý", counts.resolved]].map(([value, label, count]) =>
          <button key={String(value)} aria-pressed={status === value} className={status === value ? "is-active" : ""} disabled={busy} onClick={() => filter("status", String(value))}>
            {label}<span>{feedbackNumber(count as number | undefined)}</span>
          </button>)}
      </div>
      <ResourceStatus {...resource} retry={resource.refresh} />
      {error && <p className="admin-error" role="alert">{error}</p>}
      {resource.data && <>
        {!resource.data.content.length ? <div className="feedback-empty"><Inbox size={38} strokeWidth={1.4} aria-hidden="true" /><h3>Chưa có phản hồi phù hợp</h3><p>Phản hồi từ người dùng sẽ xuất hiện tại đây.</p></div>
          : <div className="feedback-messages">{resource.data.content.map(message => <MessageCard key={message.id} message={message} busy={busy} onStatus={() => { void changeStatus(message); }} onReply={text => replyTo(message, text)} />)}</div>}
        <div className="admin-pagination feedback-pagination"><span>{feedbackNumber(resource.data.totalElements)} phản hồi · Trang {page + 1}/{Math.max(1, resource.data.totalPages)}</span><div>
          <button className="admin-button" disabled={busy || page === 0} onClick={() => goPage(page - 1)}>Trước</button>
          <button className="admin-button" disabled={busy || page + 1 >= resource.data.totalPages} onClick={() => goPage(page + 1)}>Sau</button>
        </div></div>
      </>}
    </section>
  </div>;
}
