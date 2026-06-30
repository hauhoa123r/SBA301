import { Edit2, BookOpen } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CoursesGrid({ courses, onEditCourse, onDesignCurriculum }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
        <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Chưa có khóa học nào</p>
        <p className="text-gray-400 text-sm mt-2">Hãy tạo khóa học đầu tiên của bạn để bắt đầu</p>
      </div>
    );
  }

  return (
    <>
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                <BookOpen className="w-12 h-12 text-teal-300" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <StatusBadge status={course.status} />
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
              {course.title}
            </h3>
            {course.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {course.description}
              </p>
            )}

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={() => onEditCourse(course)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4" />
                Sửa
              </button>
              <button
                onClick={() => onDesignCurriculum(course)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <BookOpen className="w-4 h-4" />
                Giáo Trình
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
