import { useState, useEffect } from 'react';
import { X, BookOpen, Link2, Clock } from 'lucide-react';

/**
 * Creates a fresh empty lesson scaffold.
 */
const emptyLesson = () => ({
  title:            '',
  video_url:        '',
});

/**
 * LessonModal — Add / Edit a Lesson with a single form block.
 *
 * Props:
 *   isOpen       – boolean
 *   onClose      – () => void
 *   onSubmit     – (lessonData) => void
 *   initialData  – lesson object | null   (null = "Add", object = "Edit")
 */
export default function LessonModal({ isOpen, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(emptyLesson());
  const [durationInput, setDurationInput] = useState('');
  const isEditing = !!initialData;

  // Reset when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setForm(initialData
        ? {
            title:            initialData.title || '',
            video_url:        initialData.video_url || '',
          }
        : emptyLesson()
      );
      
      const totalSeconds = initialData?.duration_seconds || 0;
      if (totalSeconds > 0) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        setDurationInput(s > 0 ? `${m}:${s.toString().padStart(2, '0')}` : m.toString());
      } else {
        setDurationInput('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // ── Field helpers ─────────────────────────────────────────
  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      return;
    }
    let totalSeconds = 0;
    const trimmed = durationInput.trim();
    if (trimmed) {
      if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        const m = parseInt(parts[0]) || 0;
        const s = parseInt(parts[1]) || 0;
        totalSeconds = (m * 60) + s;
      } else {
        const m = parseInt(trimmed) || 0;
        totalSeconds = m * 60;
      }
    }

    onSubmit({ 
      ...form, 
      title: form.title.trim(),
      duration_seconds: totalSeconds
    });
    onClose();
  };

  // ── Shared input classes ──────────────────────────────────
  const inputCls =
    'w-full px-4 py-2.5 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl mx-4 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-2xl shadow-black/40 max-h-[85vh] flex flex-col">

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-borderSoft flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-accent/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-textPrimary">
                {isEditing ? 'Edit Lesson' : 'Add New Lesson'}
              </h2>
              <p className="text-xs text-brand-mutedText/60 mt-0.5">
                {isEditing ? 'Update lesson basic details' : 'Fill in lesson basic details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-brand-mutedText hover:text-brand-textPrimary hover:bg-brand-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Content: Body ────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-brand-textSecondary mb-2">
              Lesson Title <span className="text-status-danger">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Understanding Pinyin Tones"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className={inputCls}
            />
            <p className="mt-2 text-xs text-brand-mutedText/60">
              A clear lesson title helps students navigate the course.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
              <Link2 className="w-4 h-4" />
              Video URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/video.mp4"
              value={form.video_url}
              onChange={(e) => setField('video_url', e.target.value)}
              className={inputCls}
            />
            <p className="mt-2 text-xs text-brand-mutedText/60">
              Paste a direct video link or a YouTube/Vimeo URL.
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 15 or 15:30"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              className={inputCls}
            />
            <p className="mt-2 text-xs text-brand-mutedText/60">
              Enter minutes (e.g., 15) or minutes and seconds (e.g., 15:30).
            </p>
          </div>
        </form>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-borderSoft flex-shrink-0">
          <p className="text-xs text-brand-mutedText/50">
            {form.title.trim() ? '✓ Title set' : '⚠ Title required'}
            {form.video_url ? ' · ✓ Video' : ''}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-brand-textSecondary border border-brand-borderSoft rounded-lg hover:bg-brand-surface hover:text-brand-textPrimary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              className="px-6 py-2.5 text-sm font-semibold bg-brand-accent hover:bg-brand-accentHover text-brand-white rounded-lg shadow-lg shadow-brand-accent/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isEditing ? 'Save Changes' : 'Add Lesson'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
