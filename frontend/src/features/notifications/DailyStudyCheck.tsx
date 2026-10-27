import { useEffect } from "react";
import { axiosClient } from "@/shared/api";

export function DailyStudyCheck({ userId, student }: { userId?: string | number; student: boolean }) {
  useEffect(() => {
    if (!userId || !student) return;
    const controller = new AbortController();
    let checkedDay = "", busy = false;
    const check = () => {
      const day = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
      if (busy || checkedDay === day || document.visibilityState === "hidden") return;
      busy = true;
      void axiosClient.post("/api/notifications/daily-study", {}, { signal: controller.signal }).then(() => {
        checkedDay = day;
        window.dispatchEvent(new Event("edujar:notifications"));
      }).catch(() => { /* An optional suggestion must not block login; retry on focus/online. */ })
        .finally(() => { busy = false; });
    };
    check();
    window.addEventListener("focus", check); window.addEventListener("online", check);
    const timer = window.setInterval(check, 60000);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("focus", check); window.removeEventListener("online", check); };
  }, [userId, student]);
  return null;
}
