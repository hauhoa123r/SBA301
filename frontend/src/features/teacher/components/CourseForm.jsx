import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axios';

export default function CourseForm({ initialData = null, onSubmit, loading = false, error = null }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    thumbnailUrl: initialData?.thumbnailUrl || '',
    tagIds: initialData?.tagIds || [],
    planIds: initialData?.planIds || [],
    status: initialData?.status || 'DRAFT',
  });

  const [masterData, setMasterData] = useState({
    categories: [],
    tags: [],
    plans: [],
  });

  const [loadingMasterData, setLoadingMasterData] = useState(true);
  const [masterDataError, setMasterDataError] = useState(null);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingMasterData(true);
        setMasterDataError(null);

        const [categoriesRes, tagsRes, plansRes] = await Promise.all([
          axios.get('/categories'),
          axios.get('/tags'),
          axios.get('/plans'),
        ]);

        setMasterData({
          categories: categoriesRes.data?.data || categoriesRes.data || [],
          tags: tagsRes.data?.data || tagsRes.data || [],
          plans: plansRes.data?.data || plansRes.data || [],
        });
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu:', err);
        setMasterDataError('Không thể tải dữ liệu phân loại, thẻ và gói cước');
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handlePlanToggle = (planId) => {
    setFormData((prev) => ({
      ...prev,
      planIds: prev.planIds.includes(planId)
        ? prev.planIds.filter((id) => id !== planId)
        : [...prev.planIds, planId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Tiêu đề khóa học không được để trống');
      return;
    }

    if (!formData.categoryId) {
      alert('Vui lòng chọn danh mục');
      return;
    }

    await onSubmit(formData);
  };

  if (loadingMasterData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/teacher/courses')}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay Lại
      </button>

      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          {initialData ? 'Sửa Khóa Học' : 'Tạo Khóa Học Mới'}
        </h1>
        <p className="text-gray-600 mt-2">
          {initialData ? 'Cập nhật thông tin khóa học của bạn' : 'Điền thông tin cơ bản để tạo khóa học'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {masterDataError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">{masterDataError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tiêu Đề Khóa Học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề khóa học"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mô Tả Khóa Học <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết về khóa học"
              rows="5"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Danh Mục <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {masterData.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ảnh Đại Diện
              </label>
              <input
                type="text"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="Nhập đường dẫn URL ảnh..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
              />
              {formData.thumbnailUrl && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Từ Khóa (Tags)
            </label>
            <div className="space-y-2">
              {masterData.tags.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {masterData.tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${
                        formData.tagIds.includes(tag.id)
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal-600'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Không có từ khóa nào</p>
              )}
            </div>
            {formData.tagIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tagIds.map((tagId) => {
                  const tag = masterData.tags.find((t) => t.id === tagId);
                  return (
                    <div
                      key={tagId}
                      className="flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag?.name}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tagId)}
                        className="ml-1 hover:text-teal-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Gói Cước (Plans)
            </label>
            <div className="space-y-2">
              {masterData.plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {masterData.plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => handlePlanToggle(plan.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.planIds.includes(plan.id)
                          ? 'bg-teal-50 border-teal-600 shadow-md'
                          : 'bg-white border-gray-200 hover:border-teal-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{plan.name}</p>
                          <p className="text-sm text-gray-600">{plan.description}</p>
                        </div>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                            formData.planIds.includes(plan.id)
                              ? 'bg-teal-600 border-teal-600'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData.planIds.includes(plan.id) && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Không có gói cước nào</p>
              )}
            </div>
          </div>

          {initialData && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Trạng Thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="DRAFT">Bản Nháp</option>
                <option value="PENDING">Chờ Duyệt</option>
                <option value="PUBLISHED">Xuất Bản</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/teacher/courses')}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || loadingMasterData}
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang lưu...
              </>
            ) : initialData ? (
              <>
                <Plus className="w-5 h-5" />
                Lưu Thay Đổi
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Tạo Khóa Học
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
