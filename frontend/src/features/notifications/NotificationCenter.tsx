import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight, Bell, BookOpen, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, Inbox, Loader2, MessageCircle, RefreshCw, X } from "lucide-react";
import { useAuth } from "@/features/auth/model/useAuth";
import { groupNotices, noticePreview, noticeSummary, noticeTarget, noticeTime } from "./model";
import type { Notice } from "./model";
import { useNotificationFeed } from "./useNotificationFeed";
import "./notifications.css";

const mobileQuery = "(max-width: 600px)";
const subscribeViewport = (notify: () => void) => {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
const mobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const desktopSnapshot = () => false;

function notificationNavigation(value: unknown): { notificationId: number; notificationPage: number } | null {
  if (!value || typeof value !== "object" || !("notificationId" in value) || !("notificationPage" in value)) return null;
  if (typeof value.notificationId !== "number" || typeof value.notificationPage !== "number"
    || !Number.isInteger(value.notificationPage) || value.notificationPage < 0 || value.notificationPage > 10000) return null;
  return { notificationId: value.notificationId, notificationPage: value.notificationPage };
}

export function NotificationCenter({ fullPage = false }: { fullPage?: boolean }) {
  const { user } = useAuth();
  const location = useLocation();
  const destination = fullPage ? notificationNavigation(location.state as unknown) : null;
  const [open, setOpen] = useState(false), [page, setPage] = useState(destination?.notificationPage ?? 0);
  const [now, setNow] = useState(Date.now);
  const [position, setPosition] = useState({ left: 12, top: 64, height: 500 });
  const trigger = useRef<HTMLButtonElement>(null), panel = useRef<HTMLDialogElement>(null);
  const restoreFocus = useRef(true);
  const mobile = useSyncExternalStore(subscribeViewport, mobileSnapshot, desktopSnapshot);
  const generatedId = useId();
  const feedId = fullPage ? "notifications" : `notification-feed-${generatedId}`;
  const headingId = `${feedId}-heading`;
  const feed = useNotificationFeed(user?.id, page), current = feed.current, data = current?.data;
  const pagination = data ?? Object.values(feed.pages).find(value => value.data)?.data;
  const loading = !current || current.loading;
  const busy = feed.reading !== null;
  const unread = feed.unreadCount;
  const close = (restore = true) => { restoreFocus.current = restore; setOpen(false); };

  useEffect(() => {
    if (!open && !fullPage) return;
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, [open, fullPage]);

  useEffect(() => {
    if (fullPage) return;
    const element = panel.current;
    if (!element) return;
    if (!open) {
      if (element.open) { element.close(); if (restoreFocus.current) trigger.current?.focus(); }
      return;
    }
    if (element.open) element.close();
    if (mobile) element.showModal(); else element.show();
    element.querySelector<HTMLButtonElement>('[aria-label="Đóng thông báo"]')?.focus({ preventScroll: true });
    const reposition = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(400, window.innerWidth - 24);
      const top = Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - 220));
      setPosition({ left: Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)), top, height: Math.max(180, window.innerHeight - top - 12) });
    };
    reposition();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !element.contains(event.target) && !trigger.current?.contains(event.target)) {
        restoreFocus.current = false; setOpen(false);
      }
      // Modal dialogs retarget backdrop clicks to the dialog itself.
      if (event.target === element) {
        const rect = element.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
          restoreFocus.current = true; setOpen(false);
        }
      }
    };
    const keyboard = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); restoreFocus.current = true; setOpen(false); }
    };
    const previousOverflow = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      if (mobile) document.body.style.overflow = previousOverflow;
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, mobile, fullPage]);

  const keepMobileFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (!mobile || event.key !== "Tab") return;
    const elements = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex="0"]')].filter(node => node.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const content = <>
    <header className="notice-panel-header"><div><h2 id={headingId}>Thông báo <span className="notice-count" aria-label={unread === undefined ? "Đang tải số chưa đọc" : `${unread} chưa đọc`}>{unread === undefined ? "…" : `${unread} chưa đọc`}</span></h2><p>Cập nhật dành cho bạn</p></div>
      {!fullPage && <button type="button" className="notice-icon-button" aria-label="Đóng thông báo" onClick={() => close()}><X size={18} /></button>}</header>
    <div className="learning-notification-tools"><span className="notice-feed-label">Tất cả thông báo</span><div>
      <button type="button" className="notice-icon-button" aria-label="Làm mới thông báo" title="Làm mới thông báo" disabled={loading || busy} onClick={() => { void feed.refresh(); }}><RefreshCw size={15} className={loading ? "notice-spinning" : ""} /></button>
      <button type="button" className="notice-read-all" disabled={busy || loading || !unread} onClick={() => { void feed.mark(); }}>{feed.reading === "all" ? <Loader2 size={15} className="notice-spinning" /> : <CheckCheck size={15} />}Đọc tất cả</button>
    </div></div>
    <span className="sr-only" role="status">{busy ? "Đang lưu trạng thái thông báo…" : unread === undefined ? "" : `${unread} thông báo chưa đọc`}</span>
    <div className="notice-feed-scroll" aria-busy={loading}>
      {(current?.error || feed.writeError) && <div role="alert" className="learning-notification-error"><p>{feed.writeError || current?.error}</p>{current?.error && <button type="button" disabled={loading} onClick={() => { void feed.refresh(); }}>Thử lại</button>}</div>}
      {loading && !data && <div className="notice-loading" role="status"><span className="sr-only">Đang tải thông báo…</span>{[0, 1, 2].map(item => <div className="notice-skeleton" aria-hidden="true" key={item}><span /><div><span /><span /><span /></div></div>)}</div>}
      {!loading && !data && !current?.error && <div className="learning-notification-empty"><Inbox size={28} /><h3>Chưa có thông báo</h3></div>}
      {data && <div className="learning-notification-list">
        {!data.content.length && <div className="learning-notification-empty"><Inbox size={30} /><h3>Chưa có thông báo</h3><p>Phản hồi góp ý và gợi ý bài học sẽ xuất hiện ở đây.</p></div>}
        {groupNotices(data.content, now).map(group => <section className="notice-date-group" key={group.key} aria-label={group.label}><h3 className="notice-date-label">{group.label}</h3>
          {group.items.map(notice => <NotificationCard key={`${notice.id}:${destination?.notificationId === notice.id ? location.key : ""}`} notice={notice} now={now} fullPage={fullPage} page={page}
            initiallyExpanded={destination?.notificationId === notice.id} busy={busy} reading={feed.reading === notice.id}
            onRead={() => { if (!notice.read) void feed.mark(notice.id); }} onNavigate={() => close(false)} />)}
        </section>)}
      </div>}
    </div>
    {pagination && pagination.totalPages > 1 && <nav className="learning-notification-pagination" aria-label="Trang thông báo"><button type="button" className="notice-icon-button" disabled={page === 0 || loading || busy} onClick={() => setPage(value => value - 1)} aria-label="Thông báo trước"><ChevronLeft size={17} /></button>
      <span>Trang {page + 1} / {pagination.totalPages}</span><button type="button" className="notice-icon-button" disabled={page + 1 >= pagination.totalPages || loading || busy} onClick={() => setPage(value => value + 1)} aria-label="Thông báo sau"><ChevronRight size={17} /></button></nav>}
    {!fullPage && <Link className="learning-notification-all" to="/learning#notifications" onClick={() => close(false)}>Xem tất cả thông báo<ChevronRight size={15} /></Link>}
  </>;
  return <div className={`learning-notifications ${fullPage ? "is-page" : ""}`}>
    {!fullPage && <button type="button" className="learning-notifications-trigger" ref={trigger} aria-label={unread === undefined ? "Thông báo" : `Thông báo, ${unread} chưa đọc`}
      aria-haspopup="dialog" aria-expanded={open} aria-controls={feedId} onClick={() => { restoreFocus.current = true; setOpen(value => !value); if (!open) { setNow(Date.now()); void feed.ensureFresh(); } }}>
      <Bell size={19} aria-hidden="true" />{!!unread && <span>{unread > 99 ? "99+" : unread}</span>}
    </button>}
    {fullPage ? <section className="learning-notification-panel" id={feedId} aria-labelledby={headingId}>{content}</section>
      : <dialog ref={panel} className="learning-notification-panel" id={feedId} aria-labelledby={headingId} aria-modal={mobile ? "true" : undefined}
        style={{ "--notice-left": `${position.left}px`, "--notice-top": `${position.top}px`, "--notice-height": `${position.height}px` } as CSSProperties}
        onKeyDown={keepMobileFocus} onCancel={event => { event.preventDefault(); close(); }}
        onBlur={event => { if (!mobile && event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== trigger.current) close(false); }}>{content}</dialog>}
  </div>;
}

function NotificationCard({ notice, now, fullPage, page, initiallyExpanded, busy, reading, onRead, onNavigate }: {
  notice: Notice; now: number; fullPage: boolean; page: number; initiallyExpanded: boolean;
  busy: boolean; reading: boolean; onRead: () => void; onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const article = useRef<HTMLElement>(null);
  const bodyId = useId();
  const feedback = notice.type === "FEEDBACK_REPLY", reminder = notice.type === "STUDY_REMINDER";
  const target = noticeTarget(notice), summary = noticeSummary(notice), time = noticeTime(notice.createdAt, now);
  const canExpand = summary.length > 140 || summary.includes("\n");
  useEffect(() => {
    if (initiallyExpanded) { article.current?.focus({ preventScroll: true }); article.current?.scrollIntoView({ block: "nearest" }); }
  }, [initiallyExpanded]);
  return <article ref={article} tabIndex={-1} className={`learning-notice ${notice.read ? "is-read" : "is-unread"}`} aria-label={`${notice.title}${notice.read ? "" : ", chưa đọc"}`}>
    <span className="learning-notice-icon" data-type={notice.type} aria-hidden="true">{feedback ? <MessageCircle size={17} /> : reminder ? <BookOpen size={17} /> : <Bell size={17} />}</span>
    <div className="notice-card-body"><div className="notice-card-meta"><span>{feedback ? "Phản hồi góp ý" : reminder ? "Nhắc học" : "Edujar"}</span><span className="notice-card-time"><time dateTime={notice.createdAt || undefined} title={time.full}>{time.relative}</time>{!notice.read && <span className="notice-unread-dot" aria-hidden="true" />}</span></div>
      <h4>{notice.title}</h4>
      {summary && <p id={bodyId} className={`notice-content ${expanded ? "is-expanded" : ""}`}>{expanded ? summary : noticePreview(notice)}</p>}
      <div className="learning-notice-actions">
        {target && (feedback && fullPage ? <button type="button" className="notice-action" disabled={busy} aria-expanded={expanded} aria-controls={summary ? bodyId : undefined} onClick={() => { setExpanded(value => !value); onRead(); }}>{expanded ? "Thu gọn phản hồi" : "Xem phản hồi"}<ChevronDown size={14} /></button>
          : <Link className="notice-action" aria-disabled={busy || undefined} to={target} state={feedback ? { notificationId: notice.id, notificationPage: page } : undefined} onClick={event => { if (busy) { event.preventDefault(); return; } onRead(); onNavigate(); }}>{feedback ? "Xem phản hồi" : "Tiếp tục bài học"}<ArrowUpRight size={14} /></Link>)}
        {canExpand && !(feedback && fullPage) && <button type="button" className="notice-expand" aria-expanded={expanded} aria-controls={bodyId} onClick={() => setExpanded(value => !value)}>{expanded ? "Thu gọn" : "Xem thêm"}</button>}
        {notice.read ? <span className="notice-read-status"><CheckCheck size={13} />Đã đọc</span> : <button type="button" className="notice-mark-read" disabled={busy} onClick={event => { if (document.activeElement === event.currentTarget) article.current?.focus({ preventScroll: true }); onRead(); }} aria-label={`Đánh dấu đã đọc: ${notice.title}`} title="Đánh dấu đã đọc">{reading ? <Loader2 size={14} className="notice-spinning" /> : <Check size={14} />}<span className="sr-only">Đánh dấu đã đọc</span></button>}
      </div>
    </div>
  </article>;
}
