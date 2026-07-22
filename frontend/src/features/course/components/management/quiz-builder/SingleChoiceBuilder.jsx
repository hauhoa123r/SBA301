import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

export default function SingleChoiceBuilder({ isMultiple, answers, setAnswers }) {
  
  const addAnswer = () => {
    setAnswers([...answers, { content: '', isCorrect: false }]);
  };

  const removeAnswer = (idx) => {
    const updated = [...answers];
    updated.splice(idx, 1);
    setAnswers(updated);
  };

  const updateAnswer = (idx, field, value) => {
    const updated = [...answers];
    updated[idx] = { ...updated[idx], [field]: value };
    setAnswers(updated);
  };

  const toggleCorrect = (idx) => {
    const updated = [...answers];
    if (!isMultiple) {
      // If single choice, uncheck all others
      updated.forEach((a, i) => {
        a.isCorrect = (i === idx);
      });
    } else {
      updated[idx].isCorrect = !updated[idx].isCorrect;
    }
    setAnswers(updated);
  };

  return (
    <div className="space-y-3">
      {answers.map((ans, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <button
            onClick={() => toggleCorrect(idx)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              ans.isCorrect 
              ? 'bg-status-success/10 text-status-success hover:bg-status-success/20' 
              : 'bg-brand-surface border border-brand-borderSoft text-brand-mutedText hover:border-status-success/50 hover:text-status-success/50'
            }`}
            title="Đánh dấu là đáp án đúng"
          >
            {ans.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
          
          <input
            type="text"
            placeholder={`Lựa chọn ${idx + 1}`}
            value={ans.content}
            onChange={(e) => updateAnswer(idx, 'content', e.target.value)}
            className={`flex-1 px-4 py-2 border rounded-lg bg-brand-dark/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all ${
              ans.isCorrect ? 'border-status-success/50 text-brand-textPrimary' : 'border-brand-borderSoft text-brand-textPrimary'
            }`}
          />
          
          <button
            onClick={() => removeAnswer(idx)}
            disabled={answers.length <= 2}
            className="flex-shrink-0 p-2 text-status-danger/50 hover:text-status-danger hover:bg-status-danger/10 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        onClick={addAnswer}
        className="flex items-center gap-2 mt-2 px-4 py-2 text-sm font-semibold text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" /> Thêm lựa chọn
      </button>
    </div>
  );
}
