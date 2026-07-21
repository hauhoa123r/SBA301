import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileQuestion, MoreVertical, Edit2, Trash2, Clock, CheckCircle2, ListChecks } from 'lucide-react';
import { quizApi } from '../../api/quizApi';

export default function QuizDashboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizApi.getMyQuizzes();
      setQuizzes(response.data || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizApi.deleteQuiz(quizId);
        setQuizzes(quizzes.filter(q => q.id !== quizId));
      } catch (error) {
        console.error("Error deleting quiz:", error);
        alert('Failed to delete quiz');
      }
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-textPrimary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-info to-blue-500 flex items-center justify-center shadow-lg shadow-brand-info/20">
              <FileQuestion className="w-5 h-5 text-brand-white" />
            </div>
            Quiz Bank
          </h1>
          <p className="text-brand-textSecondary mt-2 ml-[52px]">
            Manage your centralized question banks and quizzes.
          </p>
        </div>

        <button
          onClick={() => navigate('/management/quizzes/create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-accent/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create New Quiz
        </button>
      </div>

      <div className="bg-brand-panel border border-brand-borderSoft rounded-xl p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-mutedText" />
          <input
            type="text"
            placeholder="Search quizzes by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-brand-borderSoft rounded-lg bg-brand-dark/60 text-brand-textPrimary placeholder-brand-mutedText/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand-info transition-all"
          />
        </div>
        <div className="text-sm font-medium text-brand-textSecondary">
          {filteredQuizzes.length} Quizzes
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-brand-textSecondary">
          Loading quizzes...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-brand-panel border border-brand-borderSoft rounded-xl p-5 hover:shadow-lg hover:border-brand-info/50 transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-info/10 flex items-center justify-center text-brand-info">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => navigate(`/management/quizzes/edit/${quiz.id}`)}
                    className="p-1.5 text-brand-mutedText hover:text-brand-info hover:bg-brand-info/10 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(quiz.id)}
                    className="p-1.5 text-brand-mutedText hover:text-status-danger hover:bg-status-danger/10 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-brand-textPrimary text-lg mb-1 truncate">
                {quiz.title}
              </h3>
              <p className="text-xs text-brand-mutedText/80 mb-4 flex-1">
                Last updated: {new Date(quiz.updatedAt).toLocaleDateString()}
              </p>

              <div className="flex items-center gap-4 text-xs font-medium text-brand-textSecondary mt-auto pt-4 border-t border-brand-borderSoft">
                <span className="flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5" />
                  {quiz.questionsCount} Qs
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {quiz.passScore}% Pass
                </span>
                {quiz.timeLimitMinutes > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.timeLimitMinutes}m
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredQuizzes.length === 0 && (
        <div className="text-center py-20 bg-brand-panel border border-dashed border-brand-borderSoft rounded-xl">
          <FileQuestion className="w-12 h-12 text-brand-mutedText/30 mx-auto mb-3" />
          <p className="text-brand-textSecondary font-medium">No quizzes found.</p>
          <p className="text-sm text-brand-mutedText mt-1">Try adjusting your search or create a new quiz.</p>
        </div>
      )}
    </div>
  );
}
