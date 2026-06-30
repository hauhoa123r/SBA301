import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, BookOpen } from 'lucide-react';
import CoursesGrid from '../components/CoursesGrid';
import { getTeacherCourses } from '../service/teacherService';

export default function ManageCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getTeacherCourses();
        setCourses(response.data || response || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách khóa học');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = () => {
    navigate('/teacher/courses/create');
  };

  const handleEditCourse = (course) => {
    navigate(`/teacher/courses/edit/${course.id}`, { state: { course } });
  };

  const handleDesignCurriculum = (course) => {
    navigate(`/teacher/courses/${course.id}/curriculum`, { state: { course } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Khóa Học Của Tôi</h1>
          <p className="text-gray-600">Quản lý và phát triển các khóa học của bạn</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Khóa Học Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Tổng Khóa Học</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{courses.length}</p>
            </div>
            <BookOpen className="w-10 h-10 text-teal-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Đã Xuất Bản</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {courses.filter(c => c.status === 'PUBLISHED').length}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Học Viên Tích Cực</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {courses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
            <p className="text-gray-600">Đang tải danh sách khóa học...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CoursesGrid
            courses={courses}
            onEditCourse={handleEditCourse}
            onDesignCurriculum={handleDesignCurriculum}
          />
        </div>
      )}
    </div>
  );
}
