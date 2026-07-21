import { FileText, Percent, Timer } from 'lucide-react';

export default function QuizSettingsTab({ form, setField }) {
  const inputCls =
    'w-full px-4 py-2.5 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all';

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 bg-brand-panel space-y-6">
      
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
          <FileText className="w-4 h-4" />
          Quiz Title <span className="text-status-danger">*</span>
        </label>
        <input
          autoFocus
          type="text"
          placeholder="e.g. Mid-term Vocabulary Test"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          className={inputCls}
        />
        <p className="mt-2 text-xs text-brand-mutedText/60">
          A clear title helps students understand the purpose of the quiz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
            <Percent className="w-4 h-4" />
            Pass Score (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="50"
            value={form.passScore}
            onChange={(e) => setField('passScore', parseInt(e.target.value) || 0)}
            className={inputCls}
          />
          <p className="mt-2 text-xs text-brand-mutedText/60">
            Minimum percentage required to pass this quiz (e.g., 50 for 50%).
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
            <Timer className="w-4 h-4" />
            Time Limit (Minutes)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0 for unlimited"
            value={form.timeLimitMinutes}
            onChange={(e) => setField('timeLimitMinutes', parseInt(e.target.value) || 0)}
            className={inputCls}
          />
          <p className="mt-2 text-xs text-brand-mutedText/60">
            Set to 0 if you don't want to enforce a time limit.
          </p>
        </div>
      </div>

    </div>
  );
}
