import { AlertTriangle, X } from 'lucide-react';

/**
 * ConfirmDeleteModal — Generic delete-confirmation dialog.
 * Props:
 *   isOpen    – boolean
 *   onClose   – () => void
 *   onConfirm – () => void
 *   title     – string (e.g. "Delete Chapter")
 *   message   – string (optional override)
 */
export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md mx-4 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-borderSoft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-status-danger/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-status-danger" />
            </div>
            <h2 className="text-lg font-bold text-brand-textPrimary">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-mutedText hover:text-brand-textPrimary hover:bg-brand-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-8 flex flex-col items-center text-center gap-5">
          <div className="w-16 h-16 rounded-full bg-status-danger/10 ring-4 ring-status-danger/5 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-status-danger" />
          </div>
          <div className="space-y-2">
            <p className="text-brand-textPrimary font-semibold text-base">
              Are you sure?
            </p>
            <p className="text-brand-textSecondary text-sm leading-relaxed max-w-xs">
              {message || 'Are you sure you want to delete this item? This action cannot be undone.'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-borderSoft">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-brand-textSecondary border border-brand-borderSoft rounded-lg hover:bg-brand-surface hover:text-brand-textPrimary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 text-sm font-semibold bg-status-danger hover:bg-status-danger/85 text-brand-white rounded-lg shadow-lg shadow-status-danger/25 transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
