import { GripVertical, ChevronDown, ChevronUp, Edit2, Trash2, Plus, BookOpen } from 'lucide-react';
import LessonRow from './LessonRow';

/**
 * ChapterNode — A single chapter card in the curriculum canvas.
 *
 * Props:
 *   chapter          – chapter data object
 *   chapterIndex     – 0-based position
 *   isExpanded       – boolean (is this chapter currently expanded?)
 *   onToggle         – () => void
 *   onEdit           – () => void   (opens ChapterModal in edit mode)
 *   onDelete         – () => void   (opens ConfirmDeleteModal)
 *   onAddLesson      – () => void   (opens LessonModal in add mode)
 *   onEditLesson     – (lesson) => void
 *   onDeleteLesson   – (lesson) => void
 */
export default function ChapterNode({
  chapter,
  chapterIndex,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onManageDocuments,
}) {
  const lessonCount = chapter.lessons?.length ?? 0;

  return (
    <div
      className={`
        border rounded-xl overflow-hidden transition-all duration-300
        ${isExpanded
          ? 'border-brand-accent/30 shadow-lg shadow-brand-accent/5 bg-brand-dark/50'
          : 'border-brand-borderSoft bg-brand-dark/30 hover:border-brand-borderHover/50'
        }
      `}
    >
      {/* ── Chapter Header ────────────────────────────────── */}
      <div
        className={`
          flex items-center gap-2 px-4 py-3.5 transition-colors duration-200 cursor-pointer
          ${isExpanded
            ? 'bg-gradient-to-r from-brand-panelAlt to-brand-panel'
            : 'bg-brand-panelAlt hover:bg-brand-surface/70'
          }
        `}
      >
        <GripVertical className="w-5 h-5 text-brand-mutedText/40 cursor-grab flex-shrink-0 hover:text-brand-mutedText transition-colors" />

        {/* Expand / Collapse */}
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 text-left min-w-0"
        >
          <div
            className={`
              flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200
              ${isExpanded
                ? 'bg-brand-accent/20 text-brand-accent'
                : 'bg-brand-dark/40 text-brand-accentSoft'
              }
            `}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-semibold text-brand-textPrimary truncate">
              Chapter {chapterIndex + 1}: {chapter.title}
            </span>
          </div>

          <span className="ml-auto text-[11px] font-semibold text-brand-mutedText bg-brand-dark/50 px-2.5 py-1 rounded-full flex-shrink-0 ring-1 ring-brand-borderSoft/50">
            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={onEdit}
            className="p-2 text-brand-mutedText hover:text-brand-accentSoft hover:bg-brand-accent/10 rounded-lg transition-colors"
            title="Edit chapter"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-brand-mutedText hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors"
            title="Delete chapter"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onAddLesson}
            className="ml-1 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-brand-accent/15 text-brand-accentSoft hover:bg-brand-accent hover:text-brand-white rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-brand-accent/20"
            title="Add lesson to this chapter"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lesson
          </button>
        </div>
      </div>

      {/* ── Chapter Body (Lessons) ────────────────────────── */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="px-4 py-3 space-y-2">
          {lessonCount > 0 ? (
            chapter.lessons.map((lesson, idx) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                lessonIndex={idx}
                onEdit={() => onEditLesson(lesson)}
                onDelete={() => onDeleteLesson(lesson)}
                onDocuments={() => onManageDocuments(lesson.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center py-10 text-brand-mutedText/50">
              <div className="w-12 h-12 rounded-full bg-brand-dark/40 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-brand-mutedText/30" />
              </div>
              <p className="text-sm font-medium mb-1">No lessons yet</p>
              <p className="text-xs text-brand-mutedText/40 mb-3">Add your first lesson to this chapter</p>
              <button
                onClick={onAddLesson}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-accentSoft hover:text-brand-accent px-4 py-2 rounded-lg border border-dashed border-brand-borderSoft hover:border-brand-accent transition-all"
              >
                <Plus className="w-4 h-4" />
                Add First Lesson
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
