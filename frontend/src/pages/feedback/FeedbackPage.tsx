import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { axiosClient, getApiErrorMessage, getApiErrorStatus } from "@/shared/api";
import { useAdminResource } from "@/features/admin-dashboard/management";
import { FeedbackFields } from "@/features/feedback/FeedbackFields";
import type { FeedbackAnswer, FeedbackForm } from "@/features/feedback/model";

function ActiveForm({ form }: { form: FeedbackForm }) {
  const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false); const [error, setError] = useState(""); const [stale, setStale] = useState(false);
  useEffect(() => {
    let active = true;
    if (!(form.onePerUser && form.hasSubmitted)) {
      axiosClient.post("/api/feedback/current/start", { formId: form.id, revision: form.revision }).catch((e: unknown) => {
        if (active) { setError(getApiErrorMessage(e)); if (getApiErrorStatus(e) === 409) setStale(true); }
      });
    }
    return () => { active = false; };
  }, [form.id, form.revision, form.onePerUser, form.hasSubmitted]);
  async function submit(answers: FeedbackAnswer[]) {
    setBusy(true); setError("");
    try { await axiosClient.post("/api/feedback/current/submissions", { formId: form.id, revision: form.revision, answers }); setSent(true); }
    catch (e) { setError(getApiErrorMessage(e)); if (getApiErrorStatus(e) === 409) setStale(true); }
    finally { setBusy(false); }
  }
  const completed = form.onePerUser && form.hasSubmitted;
  return <><h1>{form.title}</h1><p className="feedback-intro">{form.description}</p><p className="feedback-note">{form.onePerUser ? "Mỗi tài khoản được gửi một lần." : "Bạn có thể gửi nhiều phản hồi."} Câu hỏi có dấu * là bắt buộc.</p>
    {completed || sent ? <div className="feedback-success" role="status"><h2>{completed ? "Bạn đã hoàn thành khảo sát" : "Đã gửi phản hồi thành công"}</h2><p>Cảm ơn bạn đã góp ý cho trải nghiệm học tiếng Trung.</p>
      {!form.onePerUser && sent && <button className="feedback-button" onClick={() => setSent(false)}>Gửi phản hồi khác</button>}<Link to="/">Về trang chủ</Link></div>
      : <FeedbackFields key={`${form.id}-${form.revision}`} questions={form.questions} onSubmit={submit} busy={busy || stale} />}
    {error && <div className="feedback-error" role="alert">{error}{stale && <button className="feedback-button" onClick={() => window.location.reload()}>Tải lại khảo sát hiện hành</button>}</div>}
  </>;
}
export function FeedbackPage() {
  const { user } = useAuth();
  const resource = useAdminResource<FeedbackForm | null>(user ? "/api/feedback/current/participation" : "/api/feedback/current");
  return <section className="feedback-page user-ui-scope" aria-label="Biểu mẫu feedback"><Link to="/" className="feedback-back">← Trang chủ</Link>
    {resource.loading && <p role="status">Đang tải khảo sát…</p>}
    {resource.error && <div className="feedback-error" role="alert">{resource.error}<button className="feedback-button" onClick={resource.refresh}>Thử lại</button></div>}
    {!resource.loading && !resource.error && !resource.data && <p>Hiện chưa có đợt khảo sát đang mở.</p>}
    {resource.data && (user ? <ActiveForm key={`${resource.data.id}-${resource.data.revision}`} form={resource.data} />
      : <><h1>{resource.data.title}</h1><p>{resource.data.description}</p><Link className="feedback-button" to="/login?returnTo=%2Ffeedback">Đăng nhập để tham gia khảo sát</Link></>)}
  </section>;
}
