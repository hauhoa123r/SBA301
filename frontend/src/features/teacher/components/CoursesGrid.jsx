import { Edit2, BookOpen } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CoursesGrid({ courses, onEditCourse, onDesignCurriculum }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
        <BookOpen className="w-16 h-16 text-brand-mutedText/30 mb-4" />
        <p className="text-brand-textSecondary text-lg font-medium">No courses yet</p>
        <p className="text-brand-mutedText text-sm mt-2">Create your first course to get started</p>
      </div>
    );
  }

  return (
    <>
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-brand-panel rounded-xl border border-brand-borderSoft overflow-hidden hover:shadow-xl hover:shadow-black/15 transition-all duration-300 group"
        >
          <div className="relative aspect-video overflow-hidden bg-brand-dark">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-panel to-brand-surface">
                <BookOpen className="w-12 h-12 text-brand-mutedText/30" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <StatusBadge status={course.status} />
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-brand-textPrimary line-clamp-2 mb-2">
              {course.title}
            </h3>
            {course.description && (
              <p className="text-sm text-brand-textSecondary line-clamp-2 mb-4">
                {course.description}
              </p>
            )}

            <div className="flex gap-2 pt-4 border-t border-brand-borderSoft">
              <button
                onClick={() => onEditCourse(course)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDesignCurriculum(course)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand-surface hover:bg-brand-elevated text-brand-textSecondary hover:text-brand-textPrimary text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <BookOpen className="w-4 h-4" />
                Curriculum
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
