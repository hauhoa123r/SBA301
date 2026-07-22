export default function StatusBadge({ status }) {
  const statusConfig = {
    PUBLISHED: {
      className: 'bg-status-successStrong/20 text-status-successSoft',
      label: 'Đã xuất bản',
    },
    DRAFT: {
      className: 'bg-brand-warning/20 text-status-warningSoft',
      label: 'Bản nháp',
    },
    PENDING: {
      className: 'bg-brand-accent/20 text-brand-accentSoft',
      label: 'Chờ duyệt',
    },
    HIDDEN: {
      className: 'bg-brand-mutedText/20 text-brand-mutedText',
      label: 'Đã ẩn',
    },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${config.className}`}>
      {config.label}
    </span>
  );
}
