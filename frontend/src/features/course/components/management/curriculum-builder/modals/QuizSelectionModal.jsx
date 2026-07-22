import { useState, useEffect } from 'react';
import { X, FileQuestion, Search, CheckCircle2 } from 'lucide-react';
import { quizService } from '../../../../services/api/quiz.services';

export default function QuizSelectionModal({ isOpen, onClose, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedQuizId(null);
      fetchQuizzes();
    }
  }, [isOpen]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizService.getMyQuizzes();
      setQuizzes(response.data || []);
    } catch (error) {
      console.error("Không thể tải bài kiểm tra:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    if (selectedQuizId) {
      const selectedQuiz = quizzes.find(q => q.id === selectedQuizId);
      onSelect(selectedQuiz);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-4 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-2xl flex flex-col h-[70vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-borderSoft flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-info/15 flex items-center justify-center">
              <FileQuestion className="w-5 h-5 text-brand-info" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-textPrimary">
                Gắn bài kiểm tra
              </h2>
              <p className="text-xs text-brand-mutedText/60 mt-0.5">
                Chọn một bài kiểm tra từ ngân hàng bài kiểm tra để gắn vào chương này.
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

        {/* Body */}
        <div className="p-4 border-b border-brand-borderSoft">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mutedText" />
            <input
              type="text"
              autoFocus
              placeholder="Tìm bài kiểm tra của bạn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-info transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-brand-surface">
          {loading ? (
             <div className="flex items-center justify-center py-20 text-brand-textSecondary">
                Đang tải bài kiểm tra...
             </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-brand-textSecondary">
              <FileQuestion className="w-12 h-12 mb-4 opacity-50" />
              <p>Không có bài kiểm tra nào khớp với tìm kiếm.</p>
              <p className="text-sm mt-1 opacity-70">
                Bạn có thể tạo thêm bài kiểm tra trong ngân hàng bài kiểm tra.
              </p>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div 
                key={quiz.id}
                onClick={() => setSelectedQuizId(quiz.id)}
                className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                  selectedQuizId === quiz.id
                    ? 'bg-brand-info/10 border-brand-info shadow-sm'
                    : 'bg-brand-surface border-brand-borderSoft hover:border-brand-info/50'
                }`}
              >
                <div>
                  <h4 className={`font-semibold ${selectedQuizId === quiz.id ? 'text-brand-info' : 'text-brand-textPrimary'}`}>
                    {quiz.title}
                  </h4>
                  <p className="text-xs text-brand-textSecondary mt-1">
                    {quiz.questionsCount} câu hỏi · {quiz.timeLimitMinutes > 0 ? `${quiz.timeLimitMinutes} phút` : 'Không giới hạn thời gian'} · Điểm đạt: {quiz.passScore}%
                  </p>
                </div>
                {selectedQuizId === quiz.id && (
                  <CheckCircle2 className="w-6 h-6 text-brand-info" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-borderSoft flex items-center justify-end gap-3 flex-shrink-0 bg-brand-panel">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-brand-textSecondary border border-brand-borderSoft rounded-lg hover:bg-brand-surface transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedQuizId}
            className="px-6 py-2.5 text-sm font-semibold bg-brand-info hover:bg-brand-info/80 text-brand-white rounded-lg shadow-lg shadow-brand-info/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gắn bài kiểm tra
          </button>
        </div>

      </div>
    </div>
  );
}
