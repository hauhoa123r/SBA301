import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CourseForm from '../components/CourseForm';
import { updateCourse, getTeacherCourses } from '../service/teacherService';

export default function EditCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const [course, setCourse] = useState(location.state?.course || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseLoading, setCourseLoading] = useState(!course);

  useEffect(() => {
    if (!course) {
      const fetchCourse = async () => {
        try {
          setCourseLoading(true);
          const response = await getTeacherCourses();
          const foundCourse = response.find((c) => c.id === parseInt(courseId));
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError('Không tìm thấy khóa học');
          }
        } catch (err) {
          setError(err.message || 'Lỗi khi tải dữ liệu khóa học');
        } finally {
          setCourseLoading(false);
        }
      };

      fetchCourse();
    }
  }, [courseId, course]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await updateCourse(courseId, formData);
      navigate('/teacher/courses', {
        state: { message: 'Cập nhật khóa học thành công!' },
      });
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật khóa học');
      setLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu khóa học...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate('/teacher/courses')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <CourseForm initialData={course} onSubmit={handleSubmit} loading={loading} error={error} />
  );
}
