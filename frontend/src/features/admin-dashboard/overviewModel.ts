/** Weekly display sums daily events; never use this for distinct users/DAU. */
export function groupEventBuckets(rows: { label: string; value: number }[], mode: string) {
  if (mode !== "week") return rows;
  const buckets = new Map<string, number>();
  for (const row of rows) {
    const date = new Date(`${row.label.slice(0, 10)}T00:00:00Z`);
    if (!Number.isFinite(date.getTime())) continue;
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + row.value);
  }
  return Array.from(buckets, ([label, value]) => ({ label: `Tuần ${label}`, value }));
}
export function apiGrouping(mode: string) { return mode === "week" ? "day" : mode; }
