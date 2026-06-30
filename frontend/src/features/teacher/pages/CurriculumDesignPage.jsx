import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-react';
import { getCourseCurriculum, updateCourseCurriculum } from '../service/teacherService';

export default function CurriculumDesignPage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();
  const course = location.state?.course;

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState({});

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true);
        const response = await getCourseCurriculum(courseId);
        setChapters(response.data || response || []);
      } catch (err) {
        console.error('Lỗi khi tải giáo trình:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCurriculum();
    }
  }, [courseId]);

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;

    const newChapter = {
      id: Date.now(),
      title: newChapterTitle,
      lessons: [],
      isNew: true,
    };

    setChapters([...chapters, newChapter]);
    setNewChapterTitle('');
  };

  const handleAddLesson = (chapterId) => {
    const title = newLessonTitle[chapterId] || '';
    if (!title.trim()) return;

    setChapters(
      chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            lessons: [
              ...(chapter.lessons || []),
              {
                id: Date.now(),
                title,
                order: (chapter.lessons?.length || 0) + 1,
                isNew: true,
              },
            ],
          };
        }
        return chapter;
      })
    );

    setNewLessonTitle({ ...newLessonTitle, [chapterId]: '' });
  };

  const handleDeleteChapter = (chapterId) => {
    setChapters(chapters.filter((c) => c.id !== chapterId));
  };

  const handleDeleteLesson = (chapterId, lessonId) => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.id === chapterId) {
          return {
            ...chapter,
            lessons: chapter.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return chapter;
      })
    );
  };

  const handleSaveCurriculum = async () => {
    try {
      setLoading(true);
      await updateCourseCurriculum(courseId, chapters);
      navigate('/teacher/courses', {
        state: { message: 'Cập nhật giáo trình thành công!' },
      });
    } catch (err) {
      console.error('Lỗi khi cập nhật giáo trình:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4" />
          <p className="text-gray-600">Đang tải giáo trình...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/teacher/courses')}
        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay Lại
      </button>

      <div>
        <h1 className="text-4xl font-bold text-gray-900">Thiết Kế Giáo Trình</h1>
        <p className="text-gray-600 mt-2">{course?.title}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <button
                  onClick={() =>
                    setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)
                  }
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  {expandedChapter === chapter.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="font-semibold text-gray-900">{chapter.title}</span>
                  <span className="ml-auto text-sm text-gray-600">
                    {chapter.lessons?.length || 0} bài học
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteChapter(chapter.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {expandedChapter === chapter.id && (
                <div className="p-4 space-y-3">
                  {chapter.lessons?.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium text-gray-600 w-6 text-center">
                          {lesson.order}
                        </span>
                        <span className="text-gray-900">{lesson.title}</span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors duration-200">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                          className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Tên bài học mới..."
                      value={newLessonTitle[chapter.id] || ''}
                      onChange={(e) =>
                        setNewLessonTitle({
                          ...newLessonTitle,
                          [chapter.id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddLesson(chapter.id);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => handleAddLesson(chapter.id)}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tên chương mới..."
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddChapter();
                }
              }}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={handleAddChapter}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Thêm Chương
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate('/teacher/courses')}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Hủy
          </button>
          <button
            onClick={handleSaveCurriculum}
            className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Lưu Giáo Trình
          </button>
        </div>
      </div>
    </div>
  );
}
