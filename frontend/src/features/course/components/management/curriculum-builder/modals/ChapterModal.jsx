import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

/**
 * ChapterModal — Add / Edit a Chapter title.
 * Props:
 *   isOpen       – boolean
 *   onClose      – () => void
 *   onSubmit     – (title: string) => void
 *   initialData  – { title } | null   (null = "Add" mode, object = "Edit" mode)
 */
export default function ChapterModal({ isOpen, onClose, onSubmit, initialData }) {
  const [title, setTitle] = useState('');
  const isEditing = !!initialData;

  // Reset form whenever modal opens / target changes
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title ?? '');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
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
      <div className="relative w-full max-w-lg mx-4 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-borderSoft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-accent/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-accent" />
            </div>
            <h2 className="text-lg font-bold text-brand-textPrimary">
              {isEditing ? 'Sửa chương' : 'Thêm chương mới'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-mutedText hover:text-brand-textPrimary hover:bg-brand-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-textSecondary mb-2">
              Tên chương <span className="text-status-danger">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="Ví dụ: Nhập môn chữ Hán"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            />
            <p className="mt-2 text-xs text-brand-mutedText/60">
              Đặt tên chương rõ ràng và dễ hiểu.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-brand-textSecondary border border-brand-borderSoft rounded-lg hover:bg-brand-surface hover:text-brand-textPrimary transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 text-sm font-semibold bg-brand-accent hover:bg-brand-accentHover text-brand-white rounded-lg shadow-lg shadow-brand-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isEditing ? 'Lưu thay đổi' : 'Thêm chương'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
