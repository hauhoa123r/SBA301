import { Star, Clock, PlayCircle, Edit2, ListChecks, Users, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

const formatPrice = (price) => {
  if (!price || price === 0) return 'Free';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const IMAGE_FALLBACK = '/images/image_404.png';

export default function ManageCourseCard({ course, onEdit, onDesignCurriculum, onDelete }) {
  return (
    <div className="bg-brand-panel rounded-xl border border-brand-borderSoft overflow-hidden hover:shadow-xl hover:shadow-black/15 hover:border-brand-borderHover transition-all duration-300 group flex flex-col">
      {/* Image Header */}
      <div className="relative aspect-video overflow-hidden bg-brand-dark">
        <img
          src={course.thumbnailUrl || IMAGE_FALLBACK}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = IMAGE_FALLBACK;
          }}
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={course.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-accent truncate">
            {course.category}
          </span>
          {course.level && (
            <span className="text-xs text-brand-textSecondary whitespace-nowrap">
              {course.level}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-brand-textPrimary line-clamp-2 leading-snug">
          {course.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-brand-warning">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">
              {course.rating != null ? course.rating.toFixed(1) : '—'}
            </span>
          </div>
          <span className="text-sm font-bold text-brand-accentSoft">
            {formatPrice(course.price)}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-borderSoft text-brand-textSecondary text-xs">
          <div className="flex items-center gap-1.5" title="Students">
            <Users className="w-3.5 h-3.5" />
            <span>{course.students ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Lessons">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{course.totalLessons ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Duration">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration || '—'}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 p-4 pt-0">
        <button
          onClick={() => onEdit(course)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <Edit2 className="w-4 h-4" />
          Edit Info
        </button>
        <button
          onClick={() => onDesignCurriculum(course)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-surface hover:bg-brand-elevated text-brand-textSecondary hover:text-brand-textPrimary text-sm font-medium rounded-lg transition-colors duration-200"
        >
          <ListChecks className="w-4 h-4" />
          Curriculum
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(course)}
            title="Delete course"
            className="flex-shrink-0 flex items-center justify-center p-2 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
