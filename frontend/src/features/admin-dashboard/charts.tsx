import type { MonthStats, PopularCourse } from "./api";
import { formatMoney, formatNumber } from "./format";
const compact = (value: number) => new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
const colors = ["#60a5fa", "#34d399", "#c4b5fd", "#fbbf24", "#fb7185", "#22d3ee"];

export function TrendChart({ rows, field, label }: { rows: MonthStats[]; field: "users" | "revenue"; label: string }) {
  const max = Math.max(1, ...rows.map((row) => row[field]));
  const points = rows.map((row, index) => ({
    row, x: 48 + index * (624 / Math.max(1, rows.length - 1)), y: 185 - row[field] / max * 145,
  }));
  return <div className="admin-chart-scroll">
    <svg className="admin-trend" viewBox="0 0 720 230" role="img" aria-label={label}>
      <title>{label}</title>
      {[0, 0.5, 1].map((ratio) => <g key={ratio}>
        <line x1="48" x2="685" y1={185 - ratio * 145} y2={185 - ratio * 145} stroke="#285071" strokeDasharray="4 5" />
        <text x="40" y={190 - ratio * 145} textAnchor="end" fill="#b7c9dd" fontSize="11">{compact(max * ratio)}</text>
      </g>)}
      <polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke="#60a5fa" strokeWidth="3" />
      {points.map(({ row, x, y }) => <g key={row.month}>
        <circle cx={x} cy={y} r="5" fill="#60a5fa"><title>{row.month}: {field === "revenue" ? formatMoney(row[field]) : formatNumber(row[field])}</title></circle>
        <text x={x} y="214" textAnchor="middle" fill="#b7c9dd" fontSize="10">{row.month.slice(5)}/{row.month.slice(2, 4)}</text>
      </g>)}
    </svg>
    <details className="admin-chart-values"><summary>Xem số liệu theo tháng</summary>
      <ul>{rows.map((row) => <li key={row.month}>{row.month}: {field === "revenue" ? formatMoney(row[field]) : `${formatNumber(row[field])} người dùng mới`}</li>)}</ul>
    </details>
  </div>;
}

export function DistributionChart({ items }: { items: { code: string; name: string; users: number }[] }) {
  const total = items.reduce((sum, item) => sum + item.users, 0);
  if (!total) return <p className="admin-empty">Chưa có người dùng để thống kê.</p>;
  const segments = items.reduce<{ code: string; users: number; offset: number; color: string }[]>((all, item, index) => {
    const offset = all.reduce((sum, segment) => sum + segment.users / total * 100, 0);
    return [...all, { ...item, offset, color: colors[index % colors.length] ?? colors[0] ?? "#60a5fa" }];
  }, []);
  return <div className="admin-distribution">
    <svg viewBox="0 0 160 160" className="admin-donut" role="img" aria-label="Tỷ lệ người dùng theo gói còn hiệu lực">
      <title>Tỷ lệ người dùng theo gói còn hiệu lực</title>
      {segments.filter((item) => item.users > 0).map((item) => <circle key={item.code} cx="80" cy="80" r="58" fill="none"
        stroke={item.color} strokeWidth="18" pathLength="100" strokeDasharray={`${item.users / total * 100} 100`}
        strokeDashoffset={-item.offset} transform="rotate(-90 80 80)" />)}
      <text x="80" y="79" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="700">{formatNumber(total)}</text>
      <text x="80" y="98" textAnchor="middle" fill="#b7c9dd" fontSize="10">người dùng</text>
    </svg>
    <ul className="admin-legend">{items.map((item, index) => <li key={item.code}>
      <span className="admin-color" style={{ background: colors[index % colors.length] }} />
      <span>{item.name}</span><strong>{formatNumber(item.users)} <small>({(item.users / total * 100).toFixed(1)}%)</small></strong>
    </li>)}</ul>
  </div>;
}

export function PopularChart({ courses }: { courses: PopularCourse[] }) {
  if (!courses.length) return <p className="admin-empty">Chưa có lượt đăng ký trong khoảng thời gian này.</p>;
  const max = Math.max(1, ...courses.map((course) => course.students));
  return <ol className="admin-popular">{courses.map((course) => <li key={course.id}>
    <div><span>{course.title}</span><strong>{formatNumber(course.students)} <small>học viên</small></strong></div>
    <div className="admin-bar-track"><div className="admin-bar" style={{ width: `${course.students / max * 100}%` }} /></div>
  </li>)}</ol>;
}
