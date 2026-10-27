import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BookOpen, CheckCheck, ChevronLeft, ChevronRight, Inbox, MessageCircle, RefreshCw, X } from "lucide-react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import { useAuth } from "@/features/auth/model/useAuth";
import "./notifications.css";

interface Notice { id: number; type: string; title: string; content: string; read: boolean; createdAt: string; path: string | null }
interface Feed { content: Notice[]; unreadCount: number; totalPages: number; page: number }

export function NotificationCenter({ fullPage = false }: { fullPage?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false), [page, setPage] = useState(0), [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: Feed; error?: string }>({ key: "" });
  const [busy, setBusy] = useState(false), [writeError, setWriteError] = useState("");
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const key = `${user?.id ?? "guest"}:${page}:${revision}`;
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  const data = result.key.startsWith(`${user?.id ?? "guest"}:`) ? result.data : undefined;
  useEffect(() => {
    if (!user?.id) return;
    const controller = new AbortController();
    void axiosClient.get<Feed>(`/api/notifications?page=${page}`, { signal: controller.signal })
      .then(({ data: feed }) => { if (!controller.signal.aborted) setResult({ key, data: feed }); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setResult({ key, error: getApiErrorMessage(error) }); });
    return () => controller.abort();
  }, [key, page, user?.id]);
  useEffect(() => {
    const visibleRefresh = () => { if (document.visibilityState !== "hidden") refresh(); };
    window.addEventListener("edujar:notifications", refresh); window.addEventListener("focus", visibleRefresh);
    const timer = window.setInterval(visibleRefresh, 60000);
    return () => { clearInterval(timer); window.removeEventListener("edujar:notifications", refresh); window.removeEventListener("focus", visibleRefresh); };
  }, [refresh]);
  useEffect(() => {
    if (!open || fullPage) return;
    const outside = (event: MouseEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("mousedown", outside); document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", keyboard); };
  }, [open, fullPage]);
  async function mark(id?: number) {
    if (busy) return; setBusy(true); setWriteError("");
    try {
      await axiosClient.put(id === undefined ? "/api/notifications/read" : `/api/notifications/${id}/read`);
      window.dispatchEvent(new Event("edujar:notifications"));
    } catch (error) { setWriteError(getApiErrorMessage(error)); }
    finally { setBusy(false); }
  }
  const loading = result.key !== key;
  return <div className={`learning-notifications ${fullPage ? "is-page" : ""}`} ref={root}>
    {!fullPage && <button type="button" className="learning-notifications-trigger" ref={trigger} aria-label={`Thông báo, ${data?.unreadCount ?? 0} chưa đọc`}
      aria-expanded={open} aria-controls="learning-notification-feed" onClick={() => { setOpen(!open); if (!open) refresh(); }}>
      <Bell size={19} aria-hidden="true" />{!!data?.unreadCount && <span>{data.unreadCount > 99 ? "99+" : data.unreadCount}</span>}
    </button>}
    {(fullPage || open) && <section className="learning-notification-panel" id={fullPage ? "notifications" : "learning-notification-feed"} aria-label="Thông báo của bạn">
      <header><div><span className="learning-notification-eyebrow">GÓC HỌC TẬP</span><h2>Thông báo <span>{data?.unreadCount ?? 0} chưa đọc</span></h2></div>
        {!fullPage && <button aria-label="Đóng thông báo" onClick={() => { setOpen(false); trigger.current?.focus(); }}><X size={18} /></button>}</header>
      <div className="learning-notification-tools"><button onClick={refresh} disabled={loading}><RefreshCw size={14} />Làm mới</button>
        <button onClick={() => { void mark(); }} disabled={busy || !data?.unreadCount}><CheckCheck size={15} />Đọc tất cả</button></div>
      {(writeError || result.error) && <p role="alert" className="learning-notification-error">{writeError || result.error}</p>}
      {loading && !data && <p role="status" className="learning-notification-empty">Đang tải thông báo…</p>}
      {data && <><div className="learning-notification-list">{!data.content.length && <div className="learning-notification-empty"><Inbox size={32} /><h3>Bạn đã xem hết rồi</h3><p>Trả lời góp ý và gợi ý học hằng ngày sẽ xuất hiện tại đây.</p></div>}
        {data.content.map(notice => <article className={`learning-notice ${notice.read ? "" : "is-unread"}`} key={notice.id}>
          <span className="learning-notice-icon" data-type={notice.type}>{notice.type === "FEEDBACK_REPLY" ? <MessageCircle size={19} /> : <BookOpen size={19} />}</span>
          <div><h3>{notice.title}</h3><p>{notice.content}</p><time dateTime={notice.createdAt}>{notice.createdAt ? new Date(notice.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : ""}</time>
            <div className="learning-notice-actions">{notice.path?.startsWith("/learning/") && <Link to={notice.path} onClick={() => { setOpen(false); if (!notice.read) void mark(notice.id); }}>Tiếp tục bài học →</Link>}
              {!notice.read && <button disabled={busy} onClick={() => { void mark(notice.id); }}>Đánh dấu đã đọc</button>}</div>
          </div>
        </article>)}</div>
        {data.totalPages > 1 && <nav className="learning-notification-pagination" aria-label="Trang thông báo"><button disabled={page === 0 || loading} onClick={() => setPage(page - 1)} aria-label="Thông báo trước"><ChevronLeft size={17} /></button>
          <span>{page + 1}/{data.totalPages}</span><button disabled={page + 1 >= data.totalPages || loading} onClick={() => setPage(page + 1)} aria-label="Thông báo sau"><ChevronRight size={17} /></button></nav>}
      </>}
      {!fullPage && <Link className="learning-notification-all" to="/learning#notifications" onClick={() => setOpen(false)}>Xem tất cả thông báo</Link>}
    </section>}
  </div>;
}
