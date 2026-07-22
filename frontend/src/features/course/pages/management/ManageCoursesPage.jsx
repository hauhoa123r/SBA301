import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import CourseCard from '@/features/course/components/management/course-card/ManageCourseCard';
import ConfirmDeleteModal from '@/features/course/components/management/common/ConfirmDeleteModal';
import teacherService from '@/features/course/services/api/courseManagementService';

export default function ManageCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getCourses();
      setCourses(response.data || response || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Lỗi tải danh sách khóa học');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/management/courses/create');
  };

  const handleEditCourse = (course) => {
    navigate(`/management/courses/edit/${course.id}`, { state: { course } });
  };

  const handleDesignCurriculum = (course) => {
    navigate(`/management/courses/${course.id}/curriculum`, { state: { course } });
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      setLoading(true);
      await teacherService.deleteCourse(courseToDelete.id);
      setError(null); // clear any previous error
      await fetchCourses(); // reload list
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa khóa học');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-brand-textPrimary mb-2">Khóa Học Của Tôi</h1>
          <p className="text-brand-textSecondary">Quản lý và phát triển khóa học của bạn</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accentHover text-brand-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-brand-accent/20 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Tạo Khóa Học
        </button>
      </div>


      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
            <p className="text-brand-textSecondary">Đang tải danh sách khóa học...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-lg p-4">
          <p className="text-brand-danger font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <BookOpen className="w-16 h-16 text-brand-mutedText/30 mb-4" />
              <p className="text-brand-textSecondary text-lg font-medium">Chưa có khóa học nào</p>
              <p className="text-brand-mutedText text-sm mt-2">
                Tạo khóa học đầu tiên để bắt đầu
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEditCourse}
                  onDesignCurriculum={handleDesignCurriculum}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa Khóa Học"
        message={`Bạn có chắc chắn muốn xóa khóa học "${courseToDelete?.title}"? Hành động này sẽ xóa vĩnh viễn tất cả các chương và bài học liên quan.`}
      />
    </div>
  );
}
