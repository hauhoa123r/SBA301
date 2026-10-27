export function SkeletonLine({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`admin-skeleton ${className}`} />;
}

export function AdminLoading({ kind = "table", label = "Đang tải dữ liệu…" }: { kind?: "table" | "chart" | "page" | "compact"; label?: string }) {
  return <div className={`admin-loading-layout admin-loading-${kind}`} role="status" aria-label={label}>
    <span className="admin-sr-only">{label}</span>
    {kind === "page" && <div className="admin-cards" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <div className="admin-card" key={i}><SkeletonLine className="admin-skeleton-heading" /><SkeletonLine className="admin-skeleton-value" /><SkeletonLine /></div>)}</div>}
    {kind === "chart" ? <div className="admin-skeleton-chart" aria-hidden="true"><SkeletonLine className="admin-skeleton-heading" /><SkeletonLine className="admin-skeleton-plot" /></div>
      : <div className="admin-skeleton-table" aria-hidden="true">{Array.from({ length: kind === "compact" ? 3 : 5 }, (_, i) => <div className="admin-skeleton-row" key={i}><SkeletonLine /><SkeletonLine /><SkeletonLine /></div>)}</div>}
  </div>;
}
