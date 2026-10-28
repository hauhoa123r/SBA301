export interface Notice {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  path: string | null;
}

export interface NotificationFeed { content: Notice[]; unreadCount: number; totalPages: number; page: number }

const zone = "Asia/Ho_Chi_Minh";
const dayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: zone });
const relative = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "numeric", year: "numeric", timeZone: zone });
const fullFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "full", timeStyle: "short", timeZone: zone });

export function noticeTime(value: string, now = Date.now()) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return { relative: "", full: "" };
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  const label = seconds < 60 ? "Vừa xong" : seconds < 3600 ? relative.format(-Math.floor(seconds / 60), "minute")
    : seconds < 86400 ? relative.format(-Math.floor(seconds / 3600), "hour")
    : seconds < 604800 ? relative.format(-Math.floor(seconds / 86400), "day") : dateFormat.format(timestamp);
  return { relative: label, full: fullFormat.format(timestamp) };
}

export function groupNotices(notices: Notice[], now = Date.now()) {
  const today = dayFormat.format(now), yesterday = dayFormat.format(now - 86400000);
  const groups = new Map<string, { key: string; label: string; items: Notice[] }>();
  // Only collapse the same record ID. Equal text on different IDs/dates is a separate event.
  const unique = [...new Map(notices.map(notice => [notice.id, notice])).values()]
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0) || b.id - a.id);
  for (const notice of unique) {
    const timestamp = Date.parse(notice.createdAt), valid = Number.isFinite(timestamp);
    const key = valid ? dayFormat.format(timestamp) : "unknown";
    if (!groups.has(key)) groups.set(key, { key, label: key === today ? "Hôm nay" : key === yesterday ? "Hôm qua" : valid ? dateFormat.format(timestamp) : "Trước đây", items: [] });
    groups.get(key)!.items.push(notice);
  }
  return [...groups.values()];
}

export function noticeTarget(notice: Notice): string | null {
  // Match the server's allowlist; authorization is still enforced by the target route/API.
  return notice.path && /^\/learning(?:#notifications|\/courses\/[0-9]+\/lessons\/[0-9]+)$/.test(notice.path) ? notice.path : null;
}

export function noticeSummary(notice: Notice) {
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
  return normalize(notice.content) === normalize(notice.title) ? "" : notice.content.trim();
}

export function noticePreview(notice: Notice) {
  let text = noticeSummary(notice);
  if (notice.type === "FEEDBACK_REPLY") text = text.replace(/^Chủ đề:[^\n]*\n+\s*/u, "");
  if (notice.type === "STUDY_REMINDER") text = text.replace(/\s*Dành vài phút để giữ nhịp học nhé!$/u, "");
  return text.replace(/\s+/g, " ").trim();
}
