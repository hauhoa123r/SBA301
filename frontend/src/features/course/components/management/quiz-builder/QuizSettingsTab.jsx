import { FileText, Percent, Timer } from 'lucide-react';

export default function QuizSettingsTab({ form, setField }) {
  const inputCls =
    'w-full px-4 py-2.5 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all';

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 bg-brand-panel space-y-6">
      
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
          <FileText className="w-4 h-4" />
          Tiêu đề bài kiểm tra <span className="text-status-danger">*</span>
        </label>
        <input
          autoFocus
          type="text"
          placeholder="Ví dụ: Kiểm tra từ vựng giữa kỳ"
          value={form.title}
          onChange={(e) => setField('title', e.target.value)}
          className={inputCls}
        />
        <p className="mt-2 text-xs text-brand-mutedText/60">
          Tiêu đề rõ ràng giúp học viên hiểu mục tiêu của bài kiểm tra.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
            <Percent className="w-4 h-4" />
            Điểm đạt (%)
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
            Tỷ lệ phần trăm tối thiểu để đạt bài kiểm tra này, ví dụ 50 cho 50%.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-textSecondary mb-2">
            <Timer className="w-4 h-4" />
            Giới hạn thời gian (phút)
          </label>
          <input
            type="number"
            min="0"
            placeholder="0 nếu không giới hạn"
            value={form.timeLimitMinutes}
            onChange={(e) => setField('timeLimitMinutes', parseInt(e.target.value) || 0)}
            className={inputCls}
          />
          <p className="mt-2 text-xs text-brand-mutedText/60">
            Đặt là 0 nếu không muốn giới hạn thời gian.
          </p>
        </div>
      </div>

    </div>
  );
}
