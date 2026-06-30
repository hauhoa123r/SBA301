import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Award } from 'lucide-react';
import { getTeacherDashboardStats } from '../service/teacherService';

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
        const response = await getTeacherDashboardStats();
        setStats(response.data || response || {});
      } catch (err) {
        console.error('Lỗi khi tải thống kê:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bảng Điều Khiển</h1>
        <p className="text-gray-600">Tổng quan tình hình hoạt động giảng dạy của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold">Doanh Thu Tổng Cộng</h3>
            <DollarSign className="w-6 h-6 text-teal-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Tính từ đầu năm</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold">Tổng Học Viên</h3>
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalStudents?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Học viên đang học</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold">Đánh Giá Trung Bình</h3>
            <Award className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.averageRating?.toFixed(1) || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Từ tất cả khóa học</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-semibold">Khóa Học Hoạt Động</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCourses || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Đã xuất bản</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Khóa Học Hàng Đầu</h2>
          <div className="space-y-4">
            {stats.topCourses && stats.topCourses.length > 0 ? (
              stats.topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">{course.title}</p>
                    <p className="text-sm text-gray-600">{course.enrollmentCount} học viên</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${course.revenue?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">{course.rating?.toFixed(1)}/5 ⭐</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">Chưa có dữ liệu khóa học</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Doanh Thu Theo Tháng</h2>
          <div className="space-y-4">
            {stats.revenueData && stats.revenueData.length > 0 ? (
              stats.revenueData.map((item) => (
                <div key={item.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-600">{item.month}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
                      style={{
                        width: `${(item.revenue / Math.max(...stats.revenueData.map(d => d.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="w-20 text-right text-sm font-semibold text-gray-900">
                    ${item.revenue?.toLocaleString() || 0}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">Chưa có dữ liệu doanh thu</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
