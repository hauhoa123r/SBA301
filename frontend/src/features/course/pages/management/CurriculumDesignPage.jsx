import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Save, BookOpen, Layers } from "lucide-react";
import teacherService from '@/features/course/services/api/courseManagementService';
import { showSuccessToast, showErrorToast } from '@/shared/utils/toast';

import ChapterNode from '@/features/course/components/management/curriculum-builder/ChapterNode';

import ChapterModal from '@/features/course/components/management/curriculum-builder/modals/ChapterModal';
import LessonModal from '@/features/course/components/management/curriculum-builder/modals/LessonModal';
import ConfirmDeleteModal from '@/features/course/components/management/common/ConfirmDeleteModal';
import QuizSelectionModal from '@/features/course/components/management/curriculum-builder/modals/QuizSelectionModal';

const enrichLesson = (ls) => ({
  video_url: ls.videoUrl || ls.video_url || "",
  durationSeconds: ls.durationSeconds || ls.duration_seconds || 0,
  orderIndex: ls.orderIndex || ls.order_index || 0,
  documents: [],
  quizzes: [],
  assignments: [],
  ...ls,
});
const enrichChapter = (ch) => ({
  ...ch,
  orderIndex: ch.orderIndex || ch.order_index || 0,
  lessons: (ch.lessons ?? []).map(enrichLesson),
  quizzes: ch.quizzes ?? [],
});


export default function CurriculumDesignPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const course = location.state?.course;

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  const [expandedChapterId, setExpandedChapterId] = useState(null);

  const [isChapterModalOpen, setChapterModalOpen] = useState(false);
  const [isLessonModalOpen, setLessonModalOpen] = useState(false);
  const [isQuizSelectionOpen, setQuizSelectionOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await teacherService.getCurriculum(courseId);
        const raw = res?.data ?? res ?? [];
        if (!cancelled) setChapters(raw.map(enrichChapter));
      } catch (err) {
        console.error("Error loading curriculum:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const openAddChapterModal = useCallback(() => {
    setEditingTarget(null);
    setChapterModalOpen(true);
  }, []);

  const openEditChapterModal = useCallback((chapter) => {
    setEditingTarget({ chapterId: chapter.id, chapterData: chapter });
    setChapterModalOpen(true);
  }, []);

  const handleChapterSubmit = useCallback(
    (title) => {
      if (editingTarget?.chapterId) {
        setChapters((prev) =>
          prev.map((ch) =>
            ch.id === editingTarget.chapterId ? { ...ch, title } : ch,
          ),
        );
      } else {
        const newCh = {
          id: Date.now(),
          title,
          orderIndex: chapters.length + 1,
          lessons: [],
          quizzes: [],
          isNew: true,
        };
        setChapters((prev) => [...prev, newCh]);
        setExpandedChapterId(newCh.id);
      }
    },
    [editingTarget, chapters.length],
  );

  const openAddLessonModal = useCallback((chapterId) => {
    setEditingTarget({ chapterId, lessonData: null });
    setLessonModalOpen(true);
  }, []);


  const openEditLessonModal = useCallback((chapterId, lesson) => {
    setEditingTarget({ chapterId, lessonData: lesson });
    setLessonModalOpen(true);
  }, []);

  const handleLessonSubmit = useCallback(
    (lessonData) => {
      const { chapterId, lessonData: existing } = editingTarget;

      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== chapterId) return ch;

          if (existing) {
            return {
              ...ch,
              lessons: ch.lessons.map((ls) =>
                ls.id === existing.id ? { ...ls, ...lessonData } : ls,
              ),
            };
          } else {
            return {
              ...ch,
              lessons: [
                ...ch.lessons,
                enrichLesson({
                  id: Date.now(),
                  orderIndex: ch.lessons.length + 1,
                  isNew: true,
                  ...lessonData,
                }),
              ],
            };
          }
        }),
      );
    },
    [editingTarget],
  );


  const openAddQuizModal = useCallback((chapterId) => {
    setEditingTarget({ chapterId });
    setQuizSelectionOpen(true);
  }, []);

  const openEditQuizModal = useCallback((chapterId, quiz) => {
    navigate(`/management/quizzes/edit/${quiz.id}`);
  }, [navigate]);

  const handleQuizAttach = useCallback(
    (selectedQuiz) => {
      const { chapterId } = editingTarget;
      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== chapterId) return ch;
          const quizzes = ch.quizzes || [];
          
          // Avoid attaching the same quiz twice
          if (quizzes.some(q => q.id === selectedQuiz.id)) {
            return ch;
          }

          return {
            ...ch,
            quizzes: [
              ...quizzes,
              { ...selectedQuiz, orderIndex: quizzes.length + 1 }
            ],
          };
        }),
      );
    },
    [editingTarget],
  );

  const openDeleteChapterModal = useCallback((chapter) => {
    setEditingTarget({
      type: "chapter",
      chapterId: chapter.id,
      label: `chapter "${chapter.title}"`,
    });
    setDeleteModalOpen(true);
  }, []);

  const openDeleteLessonModal = useCallback((chapterId, lesson) => {
    setEditingTarget({
      type: "lesson",
      chapterId,
      lessonId: lesson.id,
      label: `lesson "${lesson.title}"`,
    });
    setDeleteModalOpen(true);
  }, []);

  const openDeleteQuizModal = useCallback((chapterId, quiz) => {
    setEditingTarget({
      type: "quiz",
      chapterId,
      quizId: quiz.id,
      label: `quiz "${quiz.title}"`,
    });
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!editingTarget) return;

    if (editingTarget.type === "chapter") {
      setChapters((prev) =>
        prev.filter((c) => c.id !== editingTarget.chapterId),
      );
      setExpandedChapterId((prev) =>
        prev === editingTarget.chapterId ? null : prev,
      );
    } else if (editingTarget.type === "lesson") {
      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== editingTarget.chapterId) return ch;
          return {
            ...ch,
            lessons: ch.lessons.filter((l) => l.id !== editingTarget.lessonId),
          };
        }),
      );
    } else if (editingTarget.type === "quiz") {
      setChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== editingTarget.chapterId) return ch;
          return {
            ...ch,
            quizzes: (ch.quizzes || []).filter((q) => q.id !== editingTarget.quizId),
          };
        }),
      );
    }
  }, [editingTarget]);


  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = chapters.map(ch => ({
        id: ch.isNew ? null : ch.id,
        title: ch.title,
        orderIndex: ch.orderIndex,
        lessonRequests: ch.lessons.map(ls => ({
          id: ls.isNew ? null : ls.id,
          title: ls.title,
          videoUrl: ls.video_url,
          durationSecond: ls.durationSeconds,
          orderIndex: ls.orderIndex,
          documents: (ls.documents || []).map(d => ({
            id: d.id,
            title: d.title,
            fileUrl: d.fileUrl || d.file_url
          }))
        })),
        quizIds: (ch.quizzes || []).map(q => q.id)
      }));

      await teacherService.updateCurriculum(courseId, payload);
      showSuccessToast("Curriculum updated successfully!");
    } catch (err) {
      console.error("Error saving curriculum:", err);
      showErrorToast("Error saving curriculum");
    } finally {
      setSaving(false);
    }
  };

  const totalLessons = chapters.reduce(
    (sum, ch) => sum + (ch.lessons?.length ?? 0),
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-brand-accent border-t-transparent mb-4" />
          <p className="text-brand-textSecondary">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/management/courses")}
          className="flex items-center gap-2 text-brand-accentSoft hover:text-brand-accent font-medium transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Courses
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-accent/20 hover:shadow-brand-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-white border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Curriculum
            </>
          )}
        </button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-textPrimary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-accent to-brand-accentHover flex items-center justify-center shadow-lg shadow-brand-accent/20">
              <Layers className="w-5 h-5 text-brand-white" />
            </div>
            Curriculum Builder
          </h1>
          {course?.title && (
            <p className="text-brand-textSecondary mt-2 ml-[52px]">
              {course.title}
            </p>
          )}
        </div>

        {chapters.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-panel rounded-lg border border-brand-borderSoft text-xs font-medium text-brand-textSecondary">
              <BookOpen className="w-3.5 h-3.5 text-brand-accent" />
              {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-panel rounded-lg border border-brand-borderSoft text-xs font-medium text-brand-textSecondary">
              <Layers className="w-3.5 h-3.5 text-brand-info" />
              {totalLessons} {totalLessons === 1 ? "Lesson" : "Lessons"}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {chapters.length > 0 ? (
          chapters.map((chapter, idx) => (
            <ChapterNode
              key={chapter.id}
              chapter={chapter}
              chapterIndex={idx}
              isExpanded={expandedChapterId === chapter.id}
              onToggle={() =>
                setExpandedChapterId((prev) =>
                  prev === chapter.id ? null : chapter.id,
                )
              }
              onEdit={() => openEditChapterModal(chapter)}
              onDelete={() => openDeleteChapterModal(chapter)}
              onAddLesson={() => openAddLessonModal(chapter.id)}
              onEditLesson={(lesson) => openEditLessonModal(chapter.id, lesson)}
              onDeleteLesson={(lesson) =>
                openDeleteLessonModal(chapter.id, lesson)
              }
              onAddQuiz={() => openAddQuizModal(chapter.id)}
              onEditQuiz={(quiz) => openEditQuizModal(chapter.id, quiz)}
              onDeleteQuiz={(quiz) => openDeleteQuizModal(chapter.id, quiz)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center py-20 text-brand-mutedText/50 bg-brand-panel/30 rounded-xl border border-dashed border-brand-borderSoft">
            <div className="w-16 h-16 rounded-full bg-brand-dark/40 flex items-center justify-center mb-4">
              <Layers className="w-8 h-8 text-brand-mutedText/30" />
            </div>
            <p className="text-lg font-semibold text-brand-textSecondary mb-1">
              No chapters yet
            </p>
            <p className="text-sm text-brand-mutedText/60 mb-6">
              Start building your curriculum by adding the first chapter.
            </p>
            <button
              onClick={openAddChapterModal}
              className="flex items-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accentHover text-brand-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-accent/25 hover:shadow-brand-accent/35 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add First Chapter
            </button>
          </div>
        )}
      </div>

      {chapters.length > 0 && (
        <button
          onClick={openAddChapterModal}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-brand-borderSoft text-brand-accentSoft hover:text-brand-accent hover:border-brand-accent hover:bg-brand-accent/5 rounded-xl font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Chapter
        </button>
      )}

      <ChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setChapterModalOpen(false)}
        onSubmit={handleChapterSubmit}
        initialData={editingTarget?.chapterData ?? null}
      />

      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setLessonModalOpen(false)}
        onSubmit={handleLessonSubmit}
        initialData={editingTarget?.lessonData ?? null}
      />

      <QuizSelectionModal
        isOpen={isQuizSelectionOpen}
        onClose={() => setQuizSelectionOpen(false)}
        onSelect={handleQuizAttach}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={
          editingTarget?.type === "chapter" ? "Delete Chapter" : 
          editingTarget?.type === "lesson" ? "Delete Lesson" : "Delete Quiz"
        }
        message={
          editingTarget?.label
            ? `Are you sure you want to delete ${editingTarget.label}? This action cannot be undone.`
            : undefined
        }
      />
    </div>
  );
}
