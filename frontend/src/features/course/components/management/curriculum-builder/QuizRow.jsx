import { GripVertical, Edit2, Trash2, FileQuestion } from 'lucide-react';

export default function QuizRow({ quiz, quizIndex, onEdit, onDelete }) {
  const points = quiz.questions?.reduce((sum, q) => sum + (Number(q.points) || 0), 0) || 0;
  
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-brand-panel border border-brand-borderSoft rounded-lg hover:border-brand-info/50 group transition-all">
      <GripVertical className="w-4 h-4 text-brand-mutedText/30 cursor-grab flex-shrink-0 group-hover:text-brand-mutedText transition-colors" />
      
      <div className="w-8 h-8 rounded-lg bg-brand-info/10 flex items-center justify-center flex-shrink-0">
        <FileQuestion className="w-4 h-4 text-brand-info" />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-brand-textPrimary truncate">
          Quiz {quizIndex + 1}: {quiz.title}
        </h4>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[11px] text-brand-mutedText/80">
            {quiz.questions?.length || 0} questions
          </span>
          <span className="text-[11px] text-brand-mutedText/80">
            {points} pts
          </span>
          {quiz.timeLimitMinutes > 0 && (
            <span className="text-[11px] text-brand-mutedText/80">
              {quiz.timeLimitMinutes} mins
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-brand-mutedText hover:text-brand-info hover:bg-brand-info/10 rounded-md transition-colors"
          title="Edit Quiz"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-brand-mutedText hover:text-status-danger hover:bg-status-danger/10 rounded-md transition-colors"
          title="Delete Quiz"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
