import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import CourseForm from '@/features/course/components/management/course-form/CourseForm';
import teacherService from '@/features/course/services/api/courseManagementService';

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
          const response = await teacherService.getCourses();
          const foundCourse = response.find((c) => c.id === parseInt(courseId));
          if (foundCourse) {
            setCourse(foundCourse);
          } else {
            setError('Course not found');
          }
        } catch (err) {
          setError(err.message || 'Error loading course data');
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
      await teacherService.updateCourse(courseId, formData);
      navigate('/management/courses', {
        state: { message: 'Course updated successfully!' },
      });
    } catch (err) {
      setError(err.message || 'Error updating course');
      setLoading(false);
    }
  };

  if (courseLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
          <p className="text-brand-textSecondary">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-brand-danger font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate('/management/courses')}
            className="px-6 py-3 bg-brand-accent hover:bg-brand-accentHover text-brand-white font-medium rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CourseForm initialData={course} onSubmit={handleSubmit} loading={loading} error={error} />
  );
}
