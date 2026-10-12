import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useAdminResource } from "@/features/admin-dashboard/management";
import type { FeedbackForm } from "./model";
import "./feedback.css";

export function FeedbackBanner() {
  const { user } = useAuth();
  const resource = useAdminResource<FeedbackForm | null>(user ? "/api/feedback/current/participation" : "/api/feedback/current");
  const form = resource.data;
  if (!form) return null;
  const completed = form.onePerUser && form.hasSubmitted;
  return <section className="feedback-banner mx-auto max-w-5xl" aria-label="Khảo sát feedback">
    <div><p className="feedback-eyebrow">GÓP Ý CÙNG CHINESE LEARNING</p><h2>{form.title}</h2><p>{form.description.slice(0, 220)}</p></div>
    {completed ? <p className="feedback-completed" role="status">Bạn đã hoàn thành khảo sát</p>
      : <Link className="feedback-button" to="/feedback">Tham gia khảo sát</Link>}
  </section>;
}
