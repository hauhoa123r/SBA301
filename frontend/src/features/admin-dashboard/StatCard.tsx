import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { formatMoney, formatNumber } from "./format";
import { useCountUp } from "./motion";
import { SkeletonLine } from "./AdminSkeleton";

export function StatCard({ title, value, icon: Icon, detail, money, trend, tone = "blue", loading = false }: {
  title: string; value: number | undefined; icon: LucideIcon; detail: string; money?: boolean; trend?: number | null; tone?: string; loading?: boolean;
}) {
  const format = money ? formatMoney : formatNumber;
  const valid = value !== undefined && Number.isFinite(value);
  const exact = valid ? format(value) : "—";
  const numberRef = useCountUp(valid ? value : undefined, !money, format);
  const waiting = loading && !valid;
  return <section className="admin-card" aria-busy={loading}><div className="admin-card-title"><h2>{title}</h2><span className="admin-card-icon" data-tone={tone}><Icon size={18} strokeWidth={1.7} aria-hidden="true" /></span></div>
    <output className="admin-card-value" aria-label={waiting ? `${title}: đang tải` : `${title}: ${exact}`} aria-live="off" title={waiting ? "Đang tải dữ liệu" : `Giá trị chính xác: ${exact}`}>
      {waiting ? <SkeletonLine className="admin-skeleton-value" /> : <span ref={numberRef} aria-hidden="true">{exact}</span>}
    </output>
    <p className="admin-card-detail">{trend !== undefined && trend !== null && Number.isFinite(trend) && <span className={`admin-card-trend ${trend < 0 ? "is-negative" : ""}`}>
      {trend < 0 ? <ArrowDownRight size={12} aria-hidden="true" /> : <ArrowUpRight size={12} aria-hidden="true" />}{Math.abs(trend).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%
    </span>}{detail}</p>
  </section>;
}
