export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={`admin-status admin-status-${status.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`}>{label ?? status}</span>;
}
