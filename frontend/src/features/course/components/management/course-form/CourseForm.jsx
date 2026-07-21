import { useEffect, useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import teacherService from '@/features/course/services/api/courseManagementService';
import CategorySelect from './CategorySelect';
import TagSelector from './TagSelector';

const getInitialFormState = (initialData) => ({
  title: initialData?.title || '',
  description: initialData?.description || '',
  price: initialData?.price ?? '',
  categoryId: initialData?.categoryId || '',
  thumbnailUrl: initialData?.thumbnailUrl || '',
  tagIds: Array.isArray(initialData?.tagIds) ? initialData.tagIds : [],
  status: initialData?.status || 'PENDING',
});

const normalizeMasterList = (value) => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    if (Array.isArray(value.data)) return value.data;
    if (Array.isArray(value.items)) return value.items;
  }
  return [];
};

const getErrorMessage = (error) => error?.message || 'Unable to load this section';

export default function CourseForm({ initialData = null, onSubmit, loading = false, error = null }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => getInitialFormState(initialData));
  const [masterData, setMasterData] = useState({
    categories: [],
    tags: [],
  });
  const [masterDataErrors, setMasterDataErrors] = useState({
    categories: null,
    tags: null,
  });
  const [priceError, setPriceError] = useState('');
  const [loadingMasterData, setLoadingMasterData] = useState(true);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoadingMasterData(true);
        setMasterDataErrors({ categories: null, tags: null });

        const [categoriesResult, tagsResult] = await Promise.allSettled([
          teacherService.getCategories(),
          teacherService.getTags(),
        ]);

        setMasterData({
          categories: categoriesResult.status === 'fulfilled' ? normalizeMasterList(categoriesResult.value) : [],
          tags: tagsResult.status === 'fulfilled' ? normalizeMasterList(tagsResult.value) : [],
        });

        setMasterDataErrors({
          categories: categoriesResult.status === 'rejected' ? getErrorMessage(categoriesResult.reason) : null,
          tags: tagsResult.status === 'rejected' ? getErrorMessage(tagsResult.reason) : null,
        });
      } catch (err) {
        console.error('Error loading course master data:', err);
        setMasterDataErrors({
          categories: 'Failed to load categories',
          tags: 'Failed to load tags',
        });
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setPriceError('');
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.some((id) => Number(id) === Number(tagId))
        ? prev.tagIds.filter((id) => Number(id) !== Number(tagId))
        : [...prev.tagIds, tagId],
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

    const price = Number(formData.price);
    if (formData.price === '' || !Number.isFinite(price) || price < 0) {
      setPriceError('Price must be a number greater than or equal to 0.');
      return;
    }

    const sanitizedFormData = {
      ...formData,
      price,
      tagIds: [...new Set((formData.tagIds || []).map((id) => Number(id)).filter(Number.isFinite))],
    };

    await onSubmit(sanitizedFormData);
  };

  if (loadingMasterData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
          <p className="text-brand-textSecondary">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/management/courses')}
        className="flex items-center gap-2 font-medium text-brand-accentSoft transition-colors duration-200 hover:text-brand-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h1 className="text-4xl font-bold text-brand-textPrimary">
          {initialData ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="mt-2 text-brand-textSecondary">
          {initialData ? 'Update your course information' : 'Fill in the basics to create a new course'}
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-brand-danger/30 bg-brand-danger/10 p-4">
          <p className="font-medium text-brand-danger">{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-brand-borderSoft bg-brand-panel p-8 shadow-lg shadow-black/10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-textPrimary">
                Course Title <span className="text-brand-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
                className="w-full rounded-lg border border-brand-borderSoft bg-brand-dark/50 px-4 py-3 text-brand-textPrimary placeholder-brand-mutedText transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-textPrimary">
                Course Description <span className="text-brand-danger">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter a detailed course description"
                rows="6"
                className="w-full resize-none rounded-lg border border-brand-borderSoft bg-brand-dark/50 px-4 py-3 text-brand-textPrimary placeholder-brand-mutedText transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                required
              />
            </div>

            <div>
              <label htmlFor="course-price" className="mb-2 block text-sm font-semibold text-brand-textPrimary">
                Course Price <span className="text-brand-danger">*</span>
              </label>
              <input
                id="course-price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter course price"
                aria-invalid={Boolean(priceError)}
                aria-describedby={priceError ? 'course-price-error' : undefined}
                className="w-full rounded-lg border border-brand-borderSoft bg-brand-dark/50 px-4 py-3 text-brand-textPrimary placeholder-brand-mutedText transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent"
                required
              />
              {priceError ? <p id="course-price-error" role="alert" className="mt-2 text-sm text-brand-danger">{priceError}</p> : null}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <CategorySelect
              value={formData.categoryId}
              onChange={handleChange}
              options={masterData.categories}
              error={masterDataErrors.categories}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-textPrimary">
                Thumbnail
              </label>
              <input
                type="text"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="Enter image URL..."
                className="w-full rounded-lg border border-brand-borderSoft bg-brand-dark/50 px-4 py-3 text-brand-textPrimary placeholder-brand-mutedText transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
              {formData.thumbnailUrl ? (
                <div className="mt-3 overflow-hidden rounded-lg">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Course thumbnail preview"
                    className="h-40 w-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ) : null}
            </div>

            <TagSelector
              tags={masterData.tags}
              selectedTagIds={formData.tagIds}
              onToggle={handleTagToggle}
              error={masterDataErrors.tags}
            />


          </div>
        </div>

        <div className="flex gap-4 border-t border-brand-borderSoft pt-6">
          <button
            type="button"
            onClick={() => navigate('/management/courses')}
            className="flex-1 rounded-lg border border-brand-borderSoft px-6 py-3 font-medium text-brand-textSecondary transition-colors duration-200 hover:bg-brand-panelAlt hover:text-brand-textPrimary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || loadingMasterData}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-accent px-6 py-3 font-medium text-brand-white shadow-lg shadow-brand-accent/20 transition-colors duration-200 hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-white border-t-transparent" />
                Saving...
              </>
            ) : initialData ? (
              <>
                <Plus className="h-5 w-5" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
