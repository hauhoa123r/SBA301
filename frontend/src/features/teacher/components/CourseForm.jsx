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
        console.error('Error loading data:', err);
        setMasterDataError('Failed to load categories, tags, and plans');
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
      alert('Course title cannot be empty');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    await onSubmit(formData);
  };

  if (loadingMasterData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
          <p className="text-brand-textSecondary">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/teacher/courses')}
        className="flex items-center gap-2 text-brand-accentSoft hover:text-brand-accent font-medium transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-4xl font-bold text-brand-textPrimary">
          {initialData ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-brand-textSecondary mt-2">
          {initialData ? 'Update your course information' : 'Fill in basic information to create a course'}
        </p>
      </div>

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/30 rounded-lg p-4">
          <p className="text-brand-danger font-medium">{error}</p>
        </div>
      )}

      {masterDataError && (
        <div className="bg-brand-warning/10 border border-brand-warning/30 rounded-lg p-4">
          <p className="text-brand-warning font-medium">{masterDataError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-brand-panel rounded-xl border border-brand-borderSoft shadow-lg shadow-black/10 p-8 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-brand-textPrimary mb-2">
              Course Title <span className="text-brand-danger">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter course title"
              className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/50 text-brand-textPrimary placeholder-brand-mutedText focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-textPrimary mb-2">
              Course Description <span className="text-brand-danger">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter a detailed course description"
              rows="5"
              className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/50 text-brand-textPrimary placeholder-brand-mutedText focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors duration-200 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-brand-textPrimary mb-2">
                Category <span className="text-brand-danger">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/50 text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors duration-200"
                required
              >
                <option value="">-- Select a category --</option>
                {masterData.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-brand-textPrimary mb-2">
                Thumbnail
              </label>
              <input
                type="text"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="Enter image URL..."
                className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/50 text-brand-textPrimary placeholder-brand-mutedText focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors duration-200"
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
            <label className="block text-sm font-semibold text-brand-textPrimary mb-3">
              Tags
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
                          ? 'bg-brand-accent text-brand-white border-brand-accent shadow-md'
                          : 'bg-brand-dark/50 text-brand-textSecondary border-brand-borderSoft hover:border-brand-accent'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-brand-mutedText text-sm">No tags available</p>
              )}
            </div>
            {formData.tagIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tagIds.map((tagId) => {
                  const tag = masterData.tags.find((t) => t.id === tagId);
                  return (
                    <div
                      key={tagId}
                      className="flex items-center gap-2 bg-brand-accent/15 text-brand-accentSoft px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tag?.name}
                      <button
                        type="button"
                        onClick={() => handleTagToggle(tagId)}
                        className="ml-1 hover:text-brand-accent"
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
            <label className="block text-sm font-semibold text-brand-textPrimary mb-3">
              Plans
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
                          ? 'bg-brand-accent/10 border-brand-accent shadow-md'
                          : 'bg-brand-dark/50 border-brand-borderSoft hover:border-brand-accent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-brand-textPrimary">{plan.name}</p>
                          <p className="text-sm text-brand-textSecondary">{plan.description}</p>
                        </div>
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                            formData.planIds.includes(plan.id)
                              ? 'bg-brand-accent border-brand-accent'
                              : 'border-brand-borderSoft'
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
                <p className="text-brand-mutedText text-sm">No plans available</p>
              )}
            </div>
          </div>

          {initialData && (
            <div>
              <label className="block text-sm font-semibold text-brand-textPrimary mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/50 text-brand-textPrimary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors duration-200"
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending Review</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-6 border-t border-brand-borderSoft">
          <button
            type="button"
            onClick={() => navigate('/teacher/courses')}
            className="flex-1 px-6 py-3 border border-brand-borderSoft text-brand-textSecondary font-medium rounded-lg hover:bg-brand-panelAlt hover:text-brand-textPrimary transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || loadingMasterData}
            className="flex-1 px-6 py-3 bg-brand-accent hover:bg-brand-accentHover text-brand-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-brand-accent/20"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-white border-t-transparent" />
                Saving...
              </>
            ) : initialData ? (
              <>
                <Plus className="w-5 h-5" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
