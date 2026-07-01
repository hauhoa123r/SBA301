import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  Users,
  BookOpen,
  Star,
  Clock,
  PlayCircle,
  Edit2,
  ListChecks,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import teacherService from '../service/teacherService';

/* ────────────────────── helpers ────────────────────── */

const formatPrice = (price) => {
  if (!price || price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const IMAGE_FALLBACK = '/images/image_404.png';

/* ────────────────────── component ────────────────────── */

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
    navigate('/teacher/courses/create');
  };

  const handleEditCourse = (course) => {
    navigate(`/teacher/courses/edit/${course.id}`, { state: { course } });
  };

  const handleDesignCurriculum = (course) => {
    navigate(`/teacher/courses/${course.id}/curriculum`, { state: { course } });
  };

  /* ─── render ─── */

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
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

      {/* ── Summary stats ── */}
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

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
            <p className="text-brand-textSecondary">Loading course list...</p>
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-lg p-4">
          <p className="text-brand-danger font-medium">{error}</p>
        </div>
      )}

      {/* ── Course grid ── */}
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
                <div
                  key={course.id}
                  className="bg-brand-panel rounded-xl border border-brand-borderSoft overflow-hidden hover:shadow-xl hover:shadow-black/15 hover:border-brand-borderHover transition-all duration-300 group flex flex-col"
                >
                  {/* ── Image header ── */}
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
                    {/* Status badge – top-left */}
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={course.status} />
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    {/* Category & Level */}
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

                    {/* Title */}
                    <h3 className="text-lg font-bold text-brand-textPrimary line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    {/* Price & Rating */}
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

                    {/* Stats row */}
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

                  {/* ── Footer actions ── */}
                  <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Info
                    </button>
                    <button
                      onClick={() => handleDesignCurriculum(course)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-brand-surface hover:bg-brand-elevated text-brand-textSecondary hover:text-brand-textPrimary text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <ListChecks className="w-4 h-4" />
                      Curriculum
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
