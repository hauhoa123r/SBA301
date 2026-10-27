import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useAccessibleDialog } from "@/features/payment/model/useAccessibleDialog";
import { formatMoney, formatNumber } from "./format";

import { defaultDates, type DateFilter } from "./analyticsModel";
import { adminMotion, useContentEntrance } from "./motion";

export function DateControls({ value, onChange, lab = false, hourly = false, weekly = false, maxDays = 731, showCaption = true, actions }: {
  value: DateFilter; onChange: (value: DateFilter) => void; lab?: boolean; hourly?: boolean; weekly?: boolean; maxDays?: number; showCaption?: boolean; actions?: ReactNode;
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
    <label>Phân nhóm<select value={draft.mode} onChange={e => setDraft({ ...draft, mode: e.target.value })}>{hourly && <option value="hour">Giờ</option>}<option value="day">Ngày</option>{weekly && <option value="week">Tuần</option>}<option value="month">Tháng</option></select></label>
    {lab && <label className="admin-check"><input type="checkbox" checked={draft.includeLab} onChange={e => setDraft({ ...draft, includeLab: e.target.checked })} />Bao gồm Activity Lab</label>}
    <div className="admin-filter-actions"><button type="submit" className="admin-button">Áp dụng</button>{actions}</div>{showCaption && <span className="admin-caption">Asia/Ho_Chi_Minh · tối đa {maxDays} ngày</span>}
    {error && <p role="alert">{error}</p>}
  </form>;
}
export function Metric({ title, value, detail }: { title: string; value: number | null; detail?: string }) {
  return <section className="admin-card"><h2>{title}</h2><strong className="admin-card-value">{value == null ? "Chưa xác định" : formatNumber(value)}</strong>{detail && <p className="admin-card-detail">{detail}</p>}</section>;
}
export function ValueChart({ title, rows, money = false, variant = "bar", color = "#2563eb" }: { title: string; rows: { label: string; value: number }[]; money?: boolean; variant?: "bar" | "area"; color?: string }) {
  const id = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<SVGGElement>(null);
  const contentKey = JSON.stringify([variant, color, rows]);
  useContentEntrance(plotRef, contentKey, adminMotion.chart);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => {
      const measured = entries[0]?.contentRect.width;
      if (measured && measured > 0) setWidth(Math.max(280, measured));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [hovered, setHovered] = useState<{ label: string; value: number } | null>(null);
  const safeRows = rows.filter(row => typeof row.value === "number" && Number.isFinite(row.value) && row.value >= 0);
  const max = Math.max(1, ...safeRows.map(r => r.value));
  const step = (width - 80) / Math.max(1, rows.length);
  const points = rows.flatMap((r, i) => typeof r.value === "number" && Number.isFinite(r.value) && r.value >= 0
    ? [{ ...r, x: 65 + i * step + step / 2, y: 190 - r.value / max * 150 }] : []);
  const area = points.length ? `M ${points[0]!.x} 190 L ${points.map(p => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1]!.x} 190 Z` : "";
  const format = money ? formatMoney : formatNumber;
  const currentHover = hovered && points.find(row => row.label === hovered.label && row.value === hovered.value);
  return <section className="admin-panel admin-chart-panel"><h2>{title}</h2>
    <p className="admin-chart-context">{safeRows.length !== rows.length ? "Một số giá trị không hợp lệ chưa được hiển thị. Vui lòng tải lại dữ liệu."
      : !safeRows.length ? "Không có dữ liệu trong khoảng chọn."
        : !safeRows.some(r => r.value !== 0) ? "Không có dữ liệu trong khoảng chọn; các khoảng trống được hiển thị bằng 0."
          : <><span className="admin-chart-key" style={{ background: color }} aria-hidden="true" />{money ? "Doanh thu (VND)" : "Số lượng"} · {formatNumber(safeRows.length)} mốc dữ liệu</>}</p>
    <div className="admin-chart-scroll" ref={containerRef}><svg viewBox={`0 0 ${width} 240`} style={{ width: "100%" }} role="img" aria-label={title}><title>{title}</title>
      <defs><linearGradient id={`chart-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".22" /><stop offset="100%" stopColor={color} stopOpacity=".015" /></linearGradient></defs>
      {[0, .25, 0.5, .75, 1].map(n => <g key={n}><line className="admin-chart-grid" x1={60} x2={width - 10} y1={190 - n * 150} y2={190 - n * 150} /><text className="admin-chart-label" x={52} y={194 - n * 150} textAnchor="end">{new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(n * max)}</text></g>)}
      <g ref={plotRef} className="admin-chart-plot">{variant === "area" && <><path d={area} fill={`url(#chart-${id})`} /><polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" /></>}
      {points.map((r, i) => <g key={`${i}-${r.label}`}>
        {variant === "area" ? <circle cx={r.x} cy={r.y} r={currentHover?.label === r.label ? 5 : 3} fill={color} tabIndex={0} aria-label={`${r.label}: ${format(r.value)}`} onFocus={() => setHovered(r)} onBlur={() => setHovered(null)} onMouseEnter={() => setHovered(r)} onMouseLeave={() => setHovered(null)}><title>{r.label}: {format(r.value)}</title></circle>
          : <rect tabIndex={0} aria-label={`${r.label}: ${format(r.value)}`} onMouseEnter={() => setHovered(r)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(r)} onBlur={() => setHovered(null)} x={r.x - Math.min(step - 8, 38) / 2} y={r.y} rx={3} width={Math.max(2, Math.min(38, step - 8))} height={Math.max(1, r.value / max * 150)} fill={color} opacity={hovered && hovered.label !== r.label ? .5 : .85}><title>{r.label}: {format(r.value)}</title></rect>}
        {(i % Math.max(1, Math.ceil(rows.length / (width < 450 ? 4 : 7))) === 0 || i === rows.length - 1) && <text x={r.x} y={215} className="admin-chart-label" textAnchor="middle">{r.label.length > 18 ? `${r.label.slice(0, 16)}…` : /^\d{4}-\d{2}-\d{2}$/.test(r.label) ? r.label.slice(5).split("-").reverse().join("/") : r.label}</text>}
      </g>)}
      </g></svg></div>
    <p className="admin-chart-tooltip" role="status">{currentHover ? `${currentHover.label}: ${format(currentHover.value)}` : "Di chuột hoặc dùng Tab để xem giá trị."}</p>
    <details className="admin-chart-values"><summary>Xem số liệu chính xác</summary><div className="admin-table-scroll"><table><thead><tr><th>Khoảng / Mục</th><th>Giá trị</th></tr></thead><tbody>{safeRows.map((r, i) => <tr key={`${i}-${r.label}`}><td>{r.label}</td><td>{format(r.value)}</td></tr>)}</tbody></table></div></details>
  </section>;
}
export function AdminDialog({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useAccessibleDialog({ open: true, onClose: close, dialogRef: ref });
  return <div className="admin-dialog-backdrop"><div className="admin-dialog admin-management-form" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" tabIndex={-1} ref={ref}>
    <h2 id="admin-dialog-title">{title}</h2>{children}<button className="admin-button" onClick={close}>Đóng</button>
  </div></div>;
}
