import { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter } from 'lucide-react';
import { getCourseReviews } from '../service/teacherService';

export default function StudentReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await getCourseReviews();
        setReviews(response.data || response || []);
      } catch (err) {
        console.error('Lỗi khi tải đánh giá:', err);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    return review.rating === parseInt(filter);
  });

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const ratingStats = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Đánh Giá Từ Học Viên</h1>
        <p className="text-gray-600">Xem và quản lý tất cả đánh giá từ học viên của bạn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Đánh Giá Tổng Hợp</h2>
          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</p>
              <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-sm text-gray-600">Dựa trên {reviews.length} đánh giá</p>
            </div>
          </div>

          <div className="space-y-3">
            {ratingStats.map((stat) => (
              <div key={stat.star} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-600">{stat.star} sao</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{
                      width: `${(stat.count / reviews.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 text-sm font-medium text-gray-600 text-right">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Thống Kê Khóa Học</h2>
          <div className="space-y-4">
            {[...new Set(reviews.map((r) => r.courseTitle))].map((courseTitle, index) => {
              const courseReviews = reviews.filter((r) => r.courseTitle === courseTitle);
              const courseAverage = (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1);
              return (
                <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                  <p className="font-medium text-gray-900 truncate mb-2">{courseTitle}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(courseAverage))}
                      <span className="text-sm font-medium text-gray-600">{courseAverage}</span>
                    </div>
                    <span className="text-sm text-gray-600">{courseReviews.length} đánh giá</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-bold text-gray-900">Danh Sách Đánh Giá Chi Tiết</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-600 font-bold text-sm">
                      {review.studentName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{review.studentName || 'Học viên ẩn danh'}</p>
                      <p className="text-sm text-gray-600">{review.courseTitle}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="mb-3">{renderStars(review.rating)}</div>

                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Chưa có đánh giá nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
