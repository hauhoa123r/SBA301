import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useAccessibleDialog } from "@/features/payment/model/useAccessibleDialog";
import { formatMoney, formatNumber } from "./format";

import { defaultDates, type DateFilter } from "./analyticsModel";

export function DateControls({ value, onChange, lab = false, hourly = false, maxDays = 731 }: {
  value: DateFilter; onChange: (value: DateFilter) => void; lab?: boolean; hourly?: boolean; maxDays?: number;
}) {
  const [draft, setDraft] = useState(value); const [error, setError] = useState("");
  function submit(e: FormEvent) {
    e.preventDefault();
    const days = (Date.parse(draft.to) - Date.parse(draft.from)) / 86400000 + 1;
    if (!Number.isFinite(days) || days < 1 || days > maxDays) { setError(`Chọn khoảng từ 1 đến ${maxDays} ngày.`); return; }
    setError(""); onChange(draft);
  }
  return <form className="admin-filters admin-date-controls" onSubmit={submit}>
    <label>Từ ngày<input required type="date" value={draft.from} max={draft.to} onChange={e => setDraft({ ...draft, from: e.target.value })} /></label>
    <label>Đến ngày<input required type="date" min={draft.from} max={defaultDates().to} value={draft.to} onChange={e => setDraft({ ...draft, to: e.target.value })} /></label>
    <label>Phân nhóm<select value={draft.mode} onChange={e => setDraft({ ...draft, mode: e.target.value })}>{hourly && <option value="hour">Hour · Giờ</option>}<option value="day">Day · Ngày</option><option value="month">Month · Tháng</option></select></label>
    {lab && <label className="admin-check"><input type="checkbox" checked={draft.includeLab} onChange={e => setDraft({ ...draft, includeLab: e.target.checked })} />Bao gồm Activity Lab</label>}
    <button className="admin-button">Áp dụng</button><span className="admin-caption">Asia/Ho_Chi_Minh · tối đa {maxDays} ngày</span>
    {error && <p role="alert">{error}</p>}
  </form>;
}
export function Metric({ title, value, detail }: { title: string; value: number | null; detail?: string }) {
  return <section className="admin-card"><h2>{title}</h2><strong className="admin-card-value">{value == null ? "Chưa xác định" : formatNumber(value)}</strong>{detail && <p className="admin-card-detail">{detail}</p>}</section>;
}
export function ValueChart({ title, rows, money = false }: { title: string; rows: { label: string; value: number }[]; money?: boolean }) {
  const [hovered, setHovered] = useState<{ label: string; value: number } | null>(null);
  const max = Math.max(1, ...rows.map(r => r.value));
  const width = Math.max(640, rows.length * 34); const step = (width - 80) / Math.max(1, rows.length);
  const format = money ? formatMoney : formatNumber;
  return <section className="admin-panel"><h2>{title}</h2>
    {!rows.some(r => r.value !== 0) && <p className="admin-empty">Không có dữ liệu trong khoảng chọn; các khoảng trống được hiển thị bằng 0.</p>}
    <div className="admin-chart-scroll"><svg viewBox={`0 0 ${width} 245`} style={{ minWidth: width, width: "100%" }} role="img" aria-label={title}><title>{title}</title>
      {[0, 0.5, 1].map(n => <g key={n}><line x1={60} x2={width - 10} y1={190 - n * 150} y2={190 - n * 150} stroke="#285071" /><text x={54} y={194 - n * 150} textAnchor="end" fill="#b7c9dd" fontSize={10}>{new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(n * max)}</text></g>)}
      {rows.map((r, i) => <g key={`${i}-${r.label}`}><rect tabIndex={0} aria-label={`${r.label}: ${format(r.value)}`} onMouseEnter={() => setHovered(r)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(r)} onBlur={() => setHovered(null)} x={65 + i * step} y={190 - r.value / max * 150} width={Math.max(3, step - 8)} height={Math.max(1, r.value / max * 150)} fill="#60a5fa"><title>{r.label}: {format(r.value)}</title></rect>
        {(rows.length <= 31 || i % Math.ceil(rows.length / 20) === 0) && <text x={65 + i * step} y={215} fill="#b7c9dd" fontSize={10} transform={`rotate(-25 ${65 + i * step} 215)`}>{r.label.length > 18 ? `${r.label.slice(0, 16)}…` : r.label}</text>}</g>)}
    </svg></div>
    <p className="admin-chart-tooltip" role="status">{hovered ? `${hovered.label}: ${format(hovered.value)}` : "Di chuột hoặc dùng Tab để xem giá trị."}</p>
    <details className="admin-chart-values"><summary>Xem số liệu chính xác</summary><div className="admin-table-scroll"><table><thead><tr><th>Khoảng / Mục</th><th>Giá trị</th></tr></thead><tbody>{rows.map((r, i) => <tr key={`${i}-${r.label}`}><td>{r.label}</td><td>{format(r.value)}</td></tr>)}</tbody></table></div></details>
  </section>;
}
export function AdminDialog({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useAccessibleDialog({ open: true, onClose: close, dialogRef: ref });
  return <div className="admin-dialog-backdrop"><div className="admin-dialog admin-management-form" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" tabIndex={-1} ref={ref}>
    <h2 id="admin-dialog-title">{title}</h2>{children}<button className="admin-button" onClick={close}>Đóng</button>
  </div></div>;
}
