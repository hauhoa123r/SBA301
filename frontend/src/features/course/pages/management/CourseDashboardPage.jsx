import { useState, useEffect } from 'react';
import { BookOpen, FileQuestion, Users, TrendingUp } from 'lucide-react';
import teacherService from '@/features/course/services/api/courseManagementService';

export default function CourseDashboardPage() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalQuizzes: 0,
    activeCourses: 0,
    revenueData: [],
    topCourses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await teacherService.getDashboardStats();
        setStats(response.data || response || {});
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
          <p className="text-brand-textSecondary">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-textPrimary mb-2">Dashboard</h1>
        <p className="text-brand-textSecondary">Overview of your teaching activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Total Courses</h3>
            <div className="p-2 rounded-lg bg-brand-accent/15">
              <BookOpen className="w-5 h-5 text-brand-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">{stats.totalCourses?.toLocaleString() || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">All created courses</p>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Total Quizzes</h3>
            <div className="p-2 rounded-lg bg-brand-warning/15">
              <FileQuestion className="w-5 h-5 text-brand-warning" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">{stats.totalQuizzes?.toLocaleString() || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">All created quizzes</p>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Active Courses</h3>
            <div className="p-2 rounded-lg bg-status-successStrong/15">
              <TrendingUp className="w-5 h-5 text-status-successStrong" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">{stats.activeCourses?.toLocaleString() || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">Published courses</p>
        </div>
      </div>


    </div>
  );
}
