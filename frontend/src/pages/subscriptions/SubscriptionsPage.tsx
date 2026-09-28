import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Crown, LoaderCircle } from "lucide-react";
import { useAuth } from "@/features/auth";
import { createPayment } from "@/features/payment";
import { getSubscriptionPlans, startFreeTrial, type SubscriptionPlan } from "@/features/subscription/api";
import { useSubscription } from "@/features/subscription/useSubscription";
import { getApiErrorMessage } from "@/shared/api";
import { formatVndCurrency } from "@/shared/utils";

export function SubscriptionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { status, loading: statusLoading, error: statusError } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    let active = true;
    void getSubscriptionPlans().then(data => {
      if (active) { setPlans(data); setError(""); }
    }).catch((failure: unknown) => {
      if (active) setError(getApiErrorMessage(failure, "Không thể tải các gói học. Vui lòng thử lại."));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);

  async function selectPlan(plan: SubscriptionPlan) {
    if (submitting.current) return;
    if (!user) { void navigate("/login?returnTo=%2Fsubscriptions"); return; }
    submitting.current = true;
    setPending(plan.code);
    setError("");
    try {
      if (plan.code === "FREE_TRIAL") {
        await startFreeTrial();
        void navigate("/learning");
      } else {
        const payment = await createPayment({ planCode: plan.code });
        void navigate("/payment/checkout", { state: { payment, plan } });
      }
    } catch (failure: unknown) {
      setError(getApiErrorMessage(failure, "Chưa thể đăng ký gói. Vui lòng thử lại."));
    } finally {
      submitting.current = false;
      setPending(null);
    }
  }

  return (
    <main className="user-ui-scope mx-auto max-w-6xl px-4 py-12 text-brand-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-accentSoft">Một gói học · Toàn bộ thư viện</span>
        <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Chọn gói học tiếng Trung của bạn</h1>
        <p className="mt-5 text-base leading-7 text-brand-textSecondary">Tự do khám phá mọi khóa học đã xuất bản, học từ vựng, luyện mẫu câu và làm bài kiểm tra trong thời hạn gói.</p>
      </div>

      {status && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-accent/25 bg-brand-cardBg p-5">
          <div>
            <p className="font-bold">{status.active ? `Gói ${status.planCode === "FREE_TRIAL" ? "Free Trial" : status.planCode} đang hoạt động` : "Chưa có gói học còn hiệu lực"}</p>
            {status.expiresAt && <p className="mt-1 text-sm text-brand-textSecondary">{status.active ? "Có hiệu lực đến" : "Gói trước đã hết hạn lúc"} {new Date(status.expiresAt).toLocaleString("vi-VN")}</p>}
          </div>
          {(status.active || status.legacyCourseIds.length > 0) && <Link to="/learning" className="inline-flex items-center gap-2 font-bold text-brand-accentSoft">Vào học <ArrowRight size={18} /></Link>}
        </div>
      )}
      {(error || statusError) && <div role="alert" className="mt-6 rounded-xl border border-status-danger/30 p-4 text-status-danger">{error || statusError}{plans.length === 0 && <button onClick={() => setRetry(value => value + 1)} className="ml-3 underline">Thử lại</button>}</div>}

      {loading ? <p role="status" className="py-16 text-center">Đang tải gói học…</p> : (
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map(plan => {
            const trial = plan.code === "FREE_TRIAL";
            const premium = plan.code === "PREMIUM";
            const trialUsed = trial && status?.trialAvailable === false;
            const busy = pending === plan.code;
            return (
              <article key={plan.code} className={`flex flex-col rounded-3xl border p-6 sm:p-8 ${plan.code === "STANDARD" ? "border-brand-accent bg-brand-accent/15 ring-1 ring-brand-accent" : premium ? "border-amber-400/60 bg-brand-cardBg" : "border-brand-border bg-brand-cardBg"}`}>
                <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold uppercase tracking-[0.2em]">{plan.name}</h2>{premium ? <Crown className="text-amber-400" /> : <BookOpen className="text-brand-accentSoft" />}</div>
                <p className="mt-7 text-4xl font-black">{formatVndCurrency(plan.price)}</p>
                <p className="mt-2 text-sm text-brand-textSecondary">{trial ? `Học thử ${plan.durationDays} ngày` : `${plan.durationDays} ngày truy cập`}</p>
                <ul className="my-8 space-y-4 text-sm leading-6 text-brand-textSecondary">
                  {["Truy cập toàn bộ khóa học", "Từ vựng và mẫu câu thực hành", "Bài kiểm tra và lưu tiến độ", trial ? "Mỗi tài khoản được dùng thử một lần" : "Bao gồm khóa mới trong thời hạn gói"].map(text => <li key={text} className="flex gap-3"><Check size={18} className="mt-1 shrink-0 text-brand-accentSoft" />{text}</li>)}
                </ul>
                {premium && <p className="mb-6 rounded-xl bg-amber-400/10 p-3 text-xs leading-6 text-amber-200">Hiện tại quyền truy cập giống Standard. Các tính năng bổ sung cho Premium sẽ được cập nhật sau.</p>}
                <button type="button" onClick={() => void selectPlan(plan)} disabled={Boolean(pending) || statusLoading || trialUsed || Boolean(user && statusError)} className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3 font-bold text-white transition hover:bg-brand-accentHover disabled:cursor-not-allowed disabled:opacity-50">{busy && <LoaderCircle size={18} className="animate-spin" />}{trialUsed ? "Đã sử dụng quyền học thử" : busy ? "Đang xử lý…" : trial ? "Bắt đầu học thử" : status?.active && status.planCode !== "FREE_TRIAL" ? `Gia hạn / chọn ${plan.name}` : `Đăng ký ${plan.name}`}</button>
              </article>
            );
          })}
        </div>
      )}
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-7 text-brand-textSecondary">Gói trả phí bắt đầu khi thanh toán được xác nhận. Nếu gói trả phí hiện tại còn hạn, thời gian mới được cộng tiếp vào ngày hết hạn. Thanh toán từng lần, không tự động gia hạn.</p>
      <div className="mt-6 text-center"><Link to="/courses" className="font-semibold text-brand-accentSoft underline underline-offset-4">Khám phá các khóa học</Link></div>
    </main>
  );
}
