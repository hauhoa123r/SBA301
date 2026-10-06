import { Link } from "react-router-dom";
import { buildLearningActivities } from "../../shared/learnCourseUtils";

export default function TestPracticeView({ course }) {
    const { allQuizzes } = buildLearningActivities(course);
    const passed = new Set(course.progress?.passedQuizIds || []);
    return <section className="space-y-5 rounded-2xl border border-brand-border bg-brand-panel p-5">
        <h2 className="text-xl font-black">Luyện kiểm tra</h2>
        <p className="text-sm text-brand-textSecondary">Các bài kiểm tra trong khóa học và kết quả đã lưu của bạn.</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allQuizzes.map(quiz => {
                const result = course.progress?.quizResults.find(item => item.quizId === quiz.id);
                return <Link key={quiz.id} to={`/learning/courses/${course.id}/quizzes/${quiz.id}`}
                    className="space-y-3 rounded-xl border border-brand-border bg-brand-light p-5 no-underline hover:border-brand-accent">
                    <h3 className="font-bold">{quiz.title}</h3>
                    <p className="text-sm text-brand-textSecondary">{quiz.chapter.title}</p>
                    <p className="text-sm">{quiz.questions.length} câu hỏi · Điểm đạt {quiz.passScore}%</p>
                    <p className={passed.has(quiz.id) ? "text-status-successSoft" : "text-brand-textSecondary"}>
                        {passed.has(quiz.id) ? "Đã đạt" : result ? "Chưa đạt" : "Chưa làm"}
                        {result && ` · Lần gần nhất: ${result.score}%`}
                    </p>
                </Link>;
            })}
        </div>
        {!allQuizzes.length && <p>Khóa học chưa có bài kiểm tra.</p>}
    </section>;
}
