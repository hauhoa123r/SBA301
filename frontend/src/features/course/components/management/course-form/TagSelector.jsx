export default function TagSelector({ tags = [], selectedTagIds = [], onToggle, error = null }) {
  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-brand-textPrimary">
        Thẻ
      </label>
      {error ? <p className="mb-3 text-sm text-brand-danger">{error}</p> : null}

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => onToggle(tag.id)}
                className={`rounded-full border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-accent bg-brand-accent text-brand-white shadow-sm'
                    : 'border-brand-borderSoft bg-brand-dark/40 text-brand-textSecondary hover:border-brand-accent hover:text-brand-accent'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-brand-mutedText">Chưa có thẻ nào</p>
      )}
    </div>
  );
}
