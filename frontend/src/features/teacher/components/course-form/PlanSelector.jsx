export default function PlanSelector({ plans = [], selectedPlanIds = [], onToggle, error = null }) {
  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price ?? 0);

  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-brand-textPrimary">
        Membership Plans
      </label>
      {error ? <p className="mb-3 text-sm text-brand-danger">{error}</p> : null}

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {plans.map((plan) => {
            const isSelected = selectedPlanIds.includes(plan.id);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onToggle(plan.id)}
                className={`rounded-lg border-2 p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-brand-accent bg-brand-accent/10 shadow-md'
                    : 'border-brand-borderSoft bg-brand-dark/50 hover:border-brand-accent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-brand-textPrimary">{plan.name}</p>
                      {plan.durationDay ? (
                        <span className="rounded-full bg-brand-panelAlt px-2 py-0.5 text-xs font-medium text-brand-textSecondary">
                          {plan.durationDay} days
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 inline-flex rounded-full bg-brand-accent/10 px-2.5 py-1 text-sm font-semibold text-brand-accent">
                      {formatPrice(plan.price)}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors duration-200 ${
                      isSelected ? 'border-brand-accent bg-brand-accent' : 'border-brand-borderSoft'
                    }`}
                  >
                    {isSelected ? (
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-brand-mutedText">No plans available</p>
      )}
    </div>
  );
}
