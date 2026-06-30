export default function StatusBadge({ status }) {
  const statusConfig = {
    PUBLISHED: {
      backgroundColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: 'Đã Xuất Bản',
    },
    DRAFT: {
      backgroundColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Bản Nháp',
    },
    PENDING: {
      backgroundColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: 'Đang Chờ',
    },
    HIDDEN: {
      backgroundColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: 'Ẩn',
    },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.backgroundColor} ${config.textColor}`}>
      {config.label}
    </span>
  );
}
