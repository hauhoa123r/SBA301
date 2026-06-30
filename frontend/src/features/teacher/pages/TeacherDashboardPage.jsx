import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';
import teacherService from '../service/teacherService';

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    averageRating: 0,
    totalCourses: 0,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Total Revenue</h3>
            <div className="p-2 rounded-lg bg-brand-accent/15">
              <DollarSign className="w-5 h-5 text-brand-accent" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">${stats.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">Since the beginning of the year</p>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Total Students</h3>
            <div className="p-2 rounded-lg bg-brand-info/15">
              <Users className="w-5 h-5 text-brand-info" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">{stats.totalStudents?.toLocaleString() || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">Currently enrolled</p>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Average Rating</h3>
            <div className="p-2 rounded-lg bg-brand-warning/15">
              <Award className="w-5 h-5 text-brand-warning" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">{stats.averageRating?.toFixed(1) || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">Across all courses</p>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-brand-textSecondary text-sm font-semibold">Active Courses</h3>
            <div className="p-2 rounded-lg bg-status-successStrong/15">
              <TrendingUp className="w-5 h-5 text-status-successStrong" />
            </div>
          </div>
          <p className="text-3xl font-bold text-brand-textPrimary">{stats.totalCourses || 0}</p>
          <p className="text-xs text-brand-mutedText mt-2">Published</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <h2 className="text-lg font-bold text-brand-textPrimary mb-6">Top Courses</h2>
          <div className="space-y-4">
            {stats.topCourses && stats.topCourses.length > 0 ? (
              stats.topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-4 pb-4 border-b border-brand-borderSoft last:border-b-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/15 text-brand-accent font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-brand-textPrimary truncate">{course.title}</p>
                    <p className="text-sm text-brand-textSecondary">{course.enrollmentCount} students</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-textPrimary">${course.revenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-brand-mutedText">{course.rating?.toFixed(1)}/5 ⭐</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-textSecondary text-center py-8">No course data available</p>
            )}
          </div>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <h2 className="text-lg font-bold text-brand-textPrimary mb-6">Monthly Revenue</h2>
          <div className="space-y-4">
            {stats.revenueData && stats.revenueData.length > 0 ? (
              stats.revenueData.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-brand-textSecondary">{item.month}</div>
                  <div className="flex-1 bg-brand-dark rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-accent to-brand-accentBright transition-all duration-300 rounded-full"
                      style={{
                        width: `${(item.revenue / Math.max(...stats.revenueData.map(d => d.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-brand-textPrimary">
                    ${item.revenue?.toLocaleString() || 0}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-textSecondary text-center py-8">No revenue data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
