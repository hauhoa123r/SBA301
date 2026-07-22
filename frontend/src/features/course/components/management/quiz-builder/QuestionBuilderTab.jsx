import { useState } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';
import SingleChoiceBuilder from './SingleChoiceBuilder';

const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE', label: 'Một đáp án' },
  { value: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' },
  // Adding more types later based on QuestionType enum
];

export default function QuestionBuilderTab({ questions, setQuestions }) {
  const [selectedIndex, setSelectedIndex] = useState(questions.length > 0 ? 0 : null);

  const addQuestion = () => {
    const newQ = {
      questionType: 'SINGLE_CHOICE',
      content: '',
      points: 10,
      explanation: '',
      answers: [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
      ]
    };
    setQuestions([...questions, newQ]);
    setSelectedIndex(questions.length);
  };

  const removeQuestion = (idx, e) => {
    e.stopPropagation();
    const updated = [...questions];
    updated.splice(idx, 1);
    setQuestions(updated);
    if (selectedIndex === idx) {
      setSelectedIndex(updated.length > 0 ? 0 : null);
    } else if (selectedIndex > idx) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const updateSelectedQuestion = (field, value) => {
    if (selectedIndex === null) return;
    const updated = [...questions];
    updated[selectedIndex] = { ...updated[selectedIndex], [field]: value };
    setQuestions(updated);
  };

  const updateAnswers = (newAnswers) => {
    updateSelectedQuestion('answers', newAnswers);
  };

  const selectedQ = selectedIndex !== null ? questions[selectedIndex] : null;

  return (
    <div className="flex-1 flex overflow-hidden">
      
      {/* Left Sidebar: Question List */}
      <div className="w-1/3 bg-brand-surface border-r border-brand-borderSoft flex flex-col">
        <div className="p-4 border-b border-brand-borderSoft flex items-center justify-between">
          <h3 className="font-bold text-brand-textPrimary">Câu hỏi ({questions.length})</h3>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {questions.length === 0 ? (
            <div className="text-center p-6 text-brand-mutedText text-sm">
              Chưa có câu hỏi nào. Nhấn Thêm để bắt đầu.
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 group ${
                  selectedIndex === idx 
                  ? 'bg-brand-accent/10 border-brand-accent/50' 
                  : 'bg-brand-panel border-brand-borderSoft hover:border-brand-accent/30'
                }`}
              >
                <div className="mt-0.5 cursor-grab text-brand-mutedText/40 group-hover:text-brand-mutedText">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`text-sm font-medium truncate ${!q.content ? 'text-brand-mutedText italic' : 'text-brand-textPrimary'}`}>
                    {q.content || 'Câu hỏi trống...'}
                  </p>
                  <p className="text-xs text-brand-textSecondary mt-1">
                    {QUESTION_TYPES.find(t => t.value === q.questionType)?.label || q.questionType} · {q.points || 0} điểm
                  </p>
                </div>
                <button
                  onClick={(e) => removeQuestion(idx, e)}
                  className="text-status-danger/60 hover:text-status-danger p-1 rounded hover:bg-status-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Question Editor */}
      <div className="w-2/3 bg-brand-panel flex flex-col overflow-y-auto">
        {selectedQ ? (
          <div className="p-6 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-textPrimary">Sửa câu hỏi</h2>
              <div className="w-48">
                <select
                  value={selectedQ.questionType}
                  onChange={(e) => updateSelectedQuestion('questionType', e.target.value)}
                  className="w-full px-3 py-2 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary text-sm focus:outline-none focus:border-brand-accent"
                >
                  {QUESTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-textSecondary mb-2">
                  Nội dung câu hỏi <span className="text-status-danger">*</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Nhập câu hỏi tại đây..."
                  value={selectedQ.content}
                  onChange={(e) => updateSelectedQuestion('content', e.target.value)}
                  className="w-full px-4 py-3 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-textSecondary mb-2">Điểm</label>
                  <input
                    type="number"
                    min="1"
                    value={selectedQ.points}
                    onChange={(e) => updateSelectedQuestion('points', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-textSecondary mb-2">Giải thích (không bắt buộc)</label>
                <textarea
                  rows="2"
                  placeholder="Giải thích vì sao đáp án đúng là chính xác..."
                  value={selectedQ.explanation || ''}
                  onChange={(e) => updateSelectedQuestion('explanation', e.target.value)}
                  className="w-full px-4 py-2 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:border-brand-accent resize-y"
                />
              </div>
            </div>

            {/* Answer Builder specific to type */}
            <div className="pt-6 border-t border-brand-borderSoft">
              <h3 className="text-base font-bold text-brand-textPrimary mb-4">Đáp án</h3>
              {(selectedQ.questionType === 'SINGLE_CHOICE' || selectedQ.questionType === 'MULTIPLE_CHOICE') && (
                <SingleChoiceBuilder 
                  isMultiple={selectedQ.questionType === 'MULTIPLE_CHOICE'}
                  answers={selectedQ.answers || []} 
                  setAnswers={updateAnswers} 
                />
              )}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-brand-mutedText p-8 text-center">
            <CheckCircle2 className="w-16 h-16 opacity-20 mb-4" />
            <p className="text-lg font-medium">Chọn một câu hỏi để chỉnh sửa</p>
            <p className="text-sm mt-1">Hoặc nhấn "Thêm" để tạo câu hỏi mới.</p>
          </div>
        )}
      </div>

    </div>
  );
}
