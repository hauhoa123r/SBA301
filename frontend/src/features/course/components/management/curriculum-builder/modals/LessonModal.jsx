import { useState, useEffect } from 'react';
import {
  X, Plus, Trash2,
  BookOpen, Video, FileText, Link2, Clock,
} from 'lucide-react';

const TABS = [
  { key: 'basic',     label: 'Basic Info', Icon: BookOpen },
  { key: 'media',     label: 'Media',      Icon: Video },
  { key: 'documents', label: 'Documents',  Icon: FileText },
];

/**
 * Creates a fresh empty lesson scaffold.
 */
const emptyLesson = () => ({
  title:            '',
  video_url:        '',
  duration_seconds: 0,
  documents:        [],
});

/**
 * LessonModal — Add / Edit a Lesson with a tabbed left-sidebar layout.
 *
 * Props:
 *   isOpen       – boolean
 *   onClose      – () => void
 *   onSubmit     – (lessonData) => void
 *   initialData  – lesson object | null   (null = "Add", object = "Edit")
 */
export default function LessonModal({ isOpen, onClose, onSubmit, initialData }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [form, setForm] = useState(emptyLesson());
  const isEditing = !!initialData;

  // Reset when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('basic');
      setForm(initialData
        ? {
            title:            initialData.title || '',
            video_url:        initialData.video_url || '',
            duration_seconds: initialData.duration_seconds || 0,
            documents:        initialData.documents?.map((d) => ({ ...d })) || [],
          }
        : emptyLesson()
      );
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // ── Field helpers ─────────────────────────────────────────
  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Document helpers ──────────────────────────────────────
  const addDocument = () =>
    setForm((prev) => ({
      ...prev,
      documents: [...prev.documents, { id: Date.now(), title: '', file_url: '' }],
    }));

  const updateDocument = (docId, field, value) =>
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.id === docId ? { ...d, [field]: value } : d
      ),
    }));

  const deleteDocument = (docId) =>
    setForm((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setActiveTab('basic');
      return;
    }
    onSubmit({ ...form, title: form.title.trim() });
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
      <div className="relative w-full max-w-3xl mx-4 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-2xl shadow-black/40 max-h-[85vh] flex flex-col">

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
                {isEditing ? 'Update lesson details across tabs' : 'Fill in lesson details across tabs'}
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

        {/* ── Content: Sidebar + Body ────────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left Sidebar Tabs */}
          <div className="w-48 flex-shrink-0 border-r border-brand-borderSoft bg-brand-dark/30 py-3 px-2 flex flex-col gap-1">
            {TABS.map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left
                  ${activeTab === key
                    ? 'bg-brand-accent/15 text-brand-accent shadow-sm'
                    : 'text-brand-mutedText hover:text-brand-textPrimary hover:bg-brand-surface/50'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {key === 'basic' && !form.title.trim() && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-status-danger flex-shrink-0" title="Required" />
                )}
                {key === 'documents' && form.documents.length > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded-full">
                    {form.documents.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Content Area */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          >

            {/* ── TAB: Basic Info ─────────────────────────────── */}
            {activeTab === 'basic' && (
              <div className="space-y-5">
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
              </div>
            )}

            {/* ── TAB: Media ─────────────────────────────────── */}
            {activeTab === 'media' && (
              <div className="space-y-5">
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
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 600"
                    value={form.duration_seconds || ''}
                    onChange={(e) =>
                      setField('duration_seconds', parseInt(e.target.value) || 0)
                    }
                    className={`${inputCls} md:w-48`}
                  />
                  <p className="mt-2 text-xs text-brand-mutedText/60">
                    Duration in seconds (e.g. 600 = 10 minutes).
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: Documents ─────────────────────────────── */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {form.documents.length === 0 && (
                  <div className="flex flex-col items-center py-8 text-brand-mutedText/50">
                    <div className="w-12 h-12 rounded-full bg-brand-dark/40 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-brand-mutedText/30" />
                    </div>
                    <p className="text-sm font-medium mb-1">No documents attached</p>
                    <p className="text-xs text-brand-mutedText/40">
                      Add supporting materials like PDFs, slides, or worksheets.
                    </p>
                  </div>
                )}

                {form.documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-4 bg-brand-dark/30 rounded-lg border border-brand-borderSoft/60 hover:border-brand-borderSoft transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-info/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-brand-info" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        placeholder={`Document ${idx + 1} title`}
                        value={doc.title}
                        onChange={(e) => updateDocument(doc.id, 'title', e.target.value)}
                        className={inputCls}
                      />
                      <input
                        type="text"
                        placeholder="File URL (e.g. https://...)"
                        value={doc.file_url}
                        onChange={(e) => updateDocument(doc.id, 'file_url', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 mt-0.5 text-brand-mutedText hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addDocument}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-brand-accentSoft hover:text-brand-accent border border-dashed border-brand-borderSoft hover:border-brand-accent rounded-lg transition-all w-full justify-center hover:bg-brand-accent/5"
                >
                  <Plus className="w-4 h-4" />
                  Add Document
                </button>
              </div>
            )}
          </form>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-borderSoft flex-shrink-0">
          <p className="text-xs text-brand-mutedText/50">
            {form.title.trim() ? '✓ Title set' : '⚠ Title required'}
            {form.video_url ? ' · ✓ Video' : ''}
            {form.documents.length > 0 ? ` · ${form.documents.length} doc(s)` : ''}
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
