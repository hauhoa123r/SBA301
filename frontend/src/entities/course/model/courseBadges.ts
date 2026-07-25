export const BADGE_COLORS = {
  Bestseller:
    "bg-status-warningStrong/10 text-status-warning border-status-warningStrong/20",
  Hot: "bg-status-danger/10 text-status-danger border-status-danger/20",
  New: "bg-status-successStrong/10 text-status-success border-status-successStrong/20",
} as const;

export type CourseBadge = keyof typeof BADGE_COLORS;

