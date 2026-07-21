import { useState } from 'react';
import { GripVertical, Edit2, Trash2, Video, FileText, Clock, HelpCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function LessonRow({ lesson, lessonIndex, onEdit, onDelete, onDocuments }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasVideo = !!lesson.video_url;
  const hasDocs  = (lesson.documents?.length ?? 0) > 0;
  const hasQuiz  = (lesson.quizzes?.length ?? 0) > 0;

  const formatDuration = (s) => {
    if (!s || s <= 0) return null;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return mins > 0 ? `${mins}m${secs > 0 ? ` ${secs}s` : ''}` : `${secs}s`;
  };

  const duration = formatDuration(lesson.duration_seconds);

  return (
    <div className="space-y-1">
      <div className="group relative flex items-center gap-3 px-4 py-3 bg-brand-dark/25 hover:bg-brand-surface/50 rounded-lg border border-brand-borderSoft/40 hover:border-brand-borderSoft transition-all duration-200">
      <GripVertical className="w-4 h-4 text-brand-mutedText/40 group-hover:text-brand-mutedText/70 cursor-grab flex-shrink-0 transition-colors" />

      {hasDocs && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 flex-shrink-0
            ${isExpanded ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-dark/40 text-brand-accentSoft hover:bg-brand-dark/60'}
          `}
        >
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      )}

      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 text-brand-accentSoft text-xs font-bold flex-shrink-0 ring-1 ring-brand-accent/15">
        {lessonIndex + 1}
      </span>

      <span className="flex-1 text-brand-textPrimary text-sm font-medium truncate">
        {lesson.title}
      </span>

      <div className="flex items-center gap-1.5">
        {hasVideo && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-accent/10 text-brand-accentSoft text-[11px] font-medium"
            title="Has video"
          >
            <Video className="w-3 h-3" />
            Video
          </span>
        )}
        {hasDocs && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-info/10 text-brand-info text-[11px] font-medium"
            title={`${lesson.documents.length} document(s)`}
          >
            <FileText className="w-3 h-3" />
            {lesson.documents.length}
          </span>
        )}
        {hasQuiz && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-status-warningStrong/10 text-status-warningStrong text-[11px] font-medium"
            title={`${lesson.quizzes.length} quiz(zes)`}
          >
            <HelpCircle className="w-3 h-3" />
            Quiz
          </span>
        )}
        {duration && (
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-dark/40 text-brand-mutedText text-[11px] font-medium"
            title="Duration"
          >
            <Clock className="w-3 h-3" />
            {duration}
          </span>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 text-brand-mutedText hover:text-brand-accentSoft hover:bg-brand-accent/10 rounded-lg transition-colors"
          title="Edit lesson"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDocuments}
          className="p-1.5 text-brand-mutedText hover:text-brand-info hover:bg-brand-info/10 rounded-lg transition-colors"
          title="Manage documents"
        >
          <FileText className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-brand-mutedText hover:text-status-danger hover:bg-status-danger/10 rounded-lg transition-colors"
          title="Delete lesson"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

      {hasDocs && (
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="pl-14 pr-4 pt-1 pb-2 space-y-1">
            {lesson.documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm bg-brand-dark/40 rounded-lg border border-brand-borderSoft/30">
              <div className="flex items-center gap-2 text-brand-textSecondary truncate">
                <FileText className="w-3.5 h-3.5 text-brand-info flex-shrink-0" />
                <span className="truncate">{doc.title}</span>
              </div>
              <a
                href={doc.fileUrl || doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-brand-mutedText hover:text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors ml-4 flex-shrink-0"
                title="View Document"
              >
                <Eye className="w-4 h-4" />
              </a>
            </div>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
