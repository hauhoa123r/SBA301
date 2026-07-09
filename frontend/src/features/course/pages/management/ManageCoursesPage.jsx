import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Users, BookOpen } from 'lucide-react';
import CourseCard from '../../components/management/ManageCourseCard';
import teacherService from '@/features/course/services/api/courseManagementService';

export default function ManageCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await teacherService.getCourses();
        setCourses(response.data || response || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load course list');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCreateCourse = () => {
    navigate('/management/courses/create');
  };

  const handleEditCourse = (course) => {
    navigate(`/management/courses/edit/${course.id}`, { state: { course } });
  };

  const handleDesignCurriculum = (course) => {
    navigate(`/management/courses/${course.id}/curriculum`, { state: { course } });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-brand-textPrimary mb-2">My Courses</h1>
          <p className="text-brand-textSecondary">Manage and develop your courses</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accentHover text-brand-white font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-brand-accent/20 hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          New Course
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-textSecondary text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-brand-textPrimary mt-2">{courses.length}</p>
            </div>
            <BookOpen className="w-10 h-10 text-brand-accent opacity-20" />
          </div>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-textSecondary text-sm font-medium">Published</p>
              <p className="text-3xl font-bold text-brand-textPrimary mt-2">
                {courses.filter((c) => c.status === 'PUBLISHED').length}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-status-successStrong opacity-20" />
          </div>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-brand-textSecondary text-sm font-medium">Active Students</p>
              <p className="text-3xl font-bold text-brand-textPrimary mt-2">
                {courses.reduce((sum, course) => sum + (course.students || 0), 0)}
              </p>
            </div>
            <Users className="w-10 h-10 text-brand-info opacity-20" />
          </div>
        </div>
      </div>


      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
            <p className="text-brand-textSecondary">Loading course list...</p>
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
              <p className="text-brand-textSecondary text-lg font-medium">No courses yet</p>
              <p className="text-brand-mutedText text-sm mt-2">
                Create your first course to get started
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
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
