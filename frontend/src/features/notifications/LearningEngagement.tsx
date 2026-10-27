import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Flame, Trophy } from "lucide-react";
import { axiosClient } from "@/shared/api";
import "./notifications.css";

interface Streak { current: number; longest: number; activeToday: boolean; lastActivityDate: string | null; timezone: string }
interface Recommendation { courseId: number; lessonId: number; courseTitle: string; lessonTitle: string; path: string }

function useStreak() {
  const [value, setValue] = useState<{ streak?: Streak; error?: string }>({});
  useEffect(() => {
    const controller = new AbortController();
    const load = () => { void axiosClient.get<Streak>("/api/learning/streak", { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setValue({ streak: data }); })
      .catch(() => { if (!controller.signal.aborted) setValue({ error: "Chưa tải được chuỗi ngày học." }); }); };
    load(); window.addEventListener("focus", load);
    return () => { controller.abort(); window.removeEventListener("focus", load); };
  }, []);
  return value;
}
export function StreakBadge() {
  const { streak } = useStreak();
  return <Link className="learning-streak-badge" to="/learning#profile" aria-label={streak ? `Chuỗi học ${streak.current} ngày` : "Xem chuỗi ngày học"}>
    <Flame size={18} aria-hidden="true" /><span>{streak?.current ?? "—"}</span><span className="learning-streak-unit">ngày</span>
  </Link>;
}
export function LearningEngagement() {
  const { streak, error } = useStreak();
  const [suggestion, setSuggestion] = useState<{ recommendation?: Recommendation | null; error?: string }>({});
  useEffect(() => {
    const controller = new AbortController();
    void axiosClient.get<{ recommendation: Recommendation | null }>("/api/notifications/recommendation", { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setSuggestion(data); })
      .catch(() => { if (!controller.signal.aborted) setSuggestion({ error: "Chưa tải được bài học gợi ý." }); });
    return () => controller.abort();
  }, []);
  return <div className="learning-engagement">
    <section className="learning-streak-card" aria-label="Chuỗi ngày học"><div className="learning-streak-symbol"><Flame size={30} /></div>
      <div><span className="learning-notification-eyebrow">MỖI NGÀY MỘT CHÚT</span><h3>Chuỗi ngày học của bạn</h3>
        <strong className="learning-streak-number">{streak?.current ?? "—"}<small>ngày liên tiếp</small></strong>
        <p>{error ?? (streak?.activeToday ? "Hôm nay đã có hoạt động học. Giữ vững nhịp nhé!" : "Hoàn thành một hoạt động học hôm nay để nối tiếp chuỗi.")}</p>
        <span className="learning-streak-best"><Trophy size={15} />Kỷ lục: {streak?.longest ?? "—"} ngày</span>
        <small className="learning-streak-note">Tính theo ngày có xem video hoặc thao tác học đã lưu, theo giờ Việt Nam.</small>
      </div>
    </section>
    <section className="learning-recommendation" aria-label="Bài học gợi ý hôm nay"><BookOpen size={24} /><span className="learning-notification-eyebrow">BƯỚC TIẾP THEO</span>
      <h3>{suggestion.recommendation?.lessonTitle ?? "Sẵn sàng học tiếp?"}</h3>
      <p>{suggestion.error ?? suggestion.recommendation?.courseTitle ?? (suggestion.recommendation === null ? "Bạn đã hoàn thành các bài hiện có hoặc cần kích hoạt gói học để học tiếp." : "Đang tìm bài học phù hợp với tiến độ của bạn…")}</p>
      <Link to={suggestion.recommendation?.path ?? "/courses"}>{suggestion.recommendation ? "Tiếp tục bài học" : "Khám phá khóa học"}<ArrowUpRight size={17} /></Link>
    </section>
  </div>;
}
