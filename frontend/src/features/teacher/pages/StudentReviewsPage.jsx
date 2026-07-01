import { useState, useEffect } from 'react';
import { Star, MessageSquare, Filter } from 'lucide-react';
import teacherService from '../service/teacherService';

export default function StudentReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await teacherService.getCourseReviews();
        setReviews(response.data || response || []);
      } catch (err) {
        console.error('Error loading reviews:', err);
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
            className={`w-4 h-4 ${i < rating ? 'fill-brand-warning text-brand-warning' : 'text-brand-mutedText/40'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
          <p className="text-brand-textSecondary">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-brand-textPrimary mb-2">Student Reviews</h1>
        <p className="text-brand-textSecondary">View and manage all reviews from your students</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <h2 className="text-lg font-bold text-brand-textPrimary mb-6">Overall Rating</h2>
          <div className="flex items-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-textPrimary mb-2">{averageRating}</p>
              <div className="flex justify-center mb-2">{renderStars(Math.round(averageRating))}</div>
              <p className="text-sm text-brand-textSecondary">Based on {reviews.length} reviews</p>
            </div>
          </div>

          <div className="space-y-3">
            {ratingStats.map((stat) => (
              <div key={stat.star} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-brand-textSecondary">{stat.star} stars</span>
                <div className="flex-1 bg-brand-dark rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-brand-warning transition-all duration-300 rounded-full"
                    style={{
                      width: reviews.length > 0 ? `${(stat.count / reviews.length) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="w-10 text-sm font-medium text-brand-textSecondary text-right">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-brand-panel p-6 rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
          <h2 className="text-lg font-bold text-brand-textPrimary mb-6">Course Statistics</h2>
          <div className="space-y-4">
            {[...new Set(reviews.map((r) => r.courseTitle))].map((courseTitle, index) => {
              const courseReviews = reviews.filter((r) => r.courseTitle === courseTitle);
              const courseAverage = (courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length).toFixed(1);
              return (
                <div key={index} className="pb-4 border-b border-brand-borderSoft last:border-b-0">
                  <p className="font-medium text-brand-textPrimary truncate mb-2">{courseTitle}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(courseAverage))}
                      <span className="text-sm font-medium text-brand-textSecondary">{courseAverage}</span>
                    </div>
                    <span className="text-sm text-brand-mutedText">{courseReviews.length} reviews</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-brand-panel rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10">
        <div className="p-6 border-b border-brand-borderSoft flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-bold text-brand-textPrimary">Detailed Review List</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-brand-textSecondary border border-brand-borderSoft rounded-lg hover:bg-brand-surface transition-colors duration-200">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="divide-y divide-brand-borderSoft">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-brand-surface/50 transition-colors duration-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-accent/15 text-brand-accent font-bold text-sm">
                      {review.studentName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-brand-textPrimary">{review.studentName || 'Anonymous Student'}</p>
                      <p className="text-sm text-brand-textSecondary">{review.courseTitle}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-brand-mutedText">
                    {new Date(review.createdAt).toLocaleDateString('en-US')}
                  </div>
                </div>

                <div className="mb-3">{renderStars(review.rating)}</div>

                {review.comment && (
                  <div className="bg-brand-dark/50 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-brand-mutedText mt-1 flex-shrink-0" />
                      <p className="text-sm text-brand-textSecondary leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-brand-mutedText/30 mx-auto mb-4" />
              <p className="text-brand-textSecondary font-medium">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
