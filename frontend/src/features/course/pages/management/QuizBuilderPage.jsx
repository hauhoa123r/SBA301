import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Settings, ListChecks, Save } from 'lucide-react';
import QuizSettingsTab from '../../components/management/quiz-builder/QuizSettingsTab';
import QuestionBuilderTab from '../../components/management/quiz-builder/QuestionBuilderTab';
import { quizService } from '../../services/api/quiz.services';
import { showErrorToast, showSuccessToast } from '@/shared/utils/toast';

const emptyQuiz = () => ({
  title: '',
  passScore: 50,
  timeLimitMinutes: 0,
  questions: [],
});

export default function QuizBuilderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = useParams();

  const [form, setForm] = useState(emptyQuiz());
  const [activeTab, setActiveTab] = useState('settings');
  const [isSaving, setIsSaving] = useState(false);
  
  const initialQuizData = location.state?.quizData || null;
  const isEditing = !!quizId || !!initialQuizData;

  useEffect(() => {
    if (quizId) {
      quizService.getQuizById(quizId).then(res => {
        const data = res.data;
        setForm({
          id: data.id,
          title: data.title || '',
          passScore: data.passScore ?? 50,
          timeLimitMinutes: data.timeLimitMinutes ?? 0,
          questions: data.questions || [],
        });
      }).catch(err => {
        console.error("Failed to load quiz", err);
      });
    } else if (initialQuizData) {
      setForm({
        id: initialQuizData.id,
        title: initialQuizData.title || '',
        passScore: initialQuizData.passScore ?? 50,
        timeLimitMinutes: initialQuizData.timeLimitMinutes ?? 0,
        questions: initialQuizData.questions ? JSON.parse(JSON.stringify(initialQuizData.questions)) : [],
      });
    }
  }, [initialQuizData, quizId]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const setQuestions = (newQuestions) => {
    setForm((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleCancel = () => {
    navigate('/management/quizzes');
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setActiveTab('settings');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        passScore: form.passScore,
        timeLimitMinutes: form.timeLimitMinutes,
        questions: form.questions
      };
      
      if (quizId) {
        await quizService.updateQuiz(quizId, payload);
      } else {
        await quizService.createQuiz(payload);
      }
      
      navigate('/management/quizzes');
    } catch (error) {
      console.error("Failed to save quiz", error);
      showErrorToast("Error saving quiz");
    } finally {
      setIsSaving(false);
    }
  };

  const totalPoints = form.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] max-w-7xl mx-auto py-6 px-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
          <button
          onClick={handleCancel}
          className="flex items-center gap-2 text-brand-accentSoft hover:text-brand-accent font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Quiz Bank
        </button>

        <button
          onClick={handleSave}
          disabled={!form.title.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Save Changes' : 'Save Quiz'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-brand-panel border border-brand-borderSoft rounded-xl shadow-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-borderSoft flex-shrink-0 bg-brand-surface">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-accent to-brand-accentHover flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <FileQuestion className="w-6 h-6 text-brand-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-textPrimary">
                {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
              </h1>
              <p className="text-sm text-brand-textSecondary mt-1">
                {form.questions.length} Questions · Total Points: {totalPoints}
              </p>
            </div>
          </div>
          
          <div className="text-right">
             <p className="text-xs text-brand-mutedText/60">
              {!form.title.trim() && <span className="text-status-warning block">⚠ Title required</span>}
              {form.title.trim() && form.questions.length === 0 && <span className="text-status-warning block">⚠ Add at least one question</span>}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-brand-borderSoft px-6 pt-2 bg-brand-dark/20 flex-shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
            }`}
          >
            <Settings className="w-4 h-4" />
            Quiz Settings
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'questions'
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-brand-textSecondary hover:text-brand-textPrimary'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            Question Builder
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-hidden flex flex-col relative bg-brand-dark/10">
          {activeTab === 'settings' && (
            <QuizSettingsTab form={form} setField={setField} />
          )}
          {activeTab === 'questions' && (
            <QuestionBuilderTab questions={form.questions} setQuestions={setQuestions} />
          )}
        </div>

      </div>
    </div>
  );
}
