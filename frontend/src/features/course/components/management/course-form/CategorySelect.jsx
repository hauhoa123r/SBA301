export default function CategorySelect({ value, onChange, options = [], error = null, loading = false }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-textPrimary">
        Danh mục <span className="text-brand-danger">*</span>
      </label>
      <select
        name="categoryId"
        value={value}
        onChange={onChange}
        disabled={loading}
        className="w-full rounded-lg border border-brand-borderSoft bg-brand-dark/50 px-4 py-3 text-brand-textPrimary transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-accent"
        required
      >
        <option value="">-- Chọn danh mục --</option>
        {options.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm text-brand-danger">{error}</p> : null}
    </div>
  );
}
