import { useCallback, useEffect, useSyncExternalStore } from "react";
import { axiosClient, getApiErrorMessage } from "@/shared/api";
import type { NotificationFeed } from "./model";
import { createNotificationStore, emptyNotifications } from "./notificationStore";

const store = createNotificationStore({
  getPage: async (page, signal) => (await axiosClient.get<NotificationFeed>(`/api/notifications?page=${page}`, { signal })).data,
  markRead: async id => { await axiosClient.put(id === undefined ? "/api/notifications/read" : `/api/notifications/${id}/read`); },
  errorMessage: error => getApiErrorMessage(error, "Không thể cập nhật thông báo. Vui lòng thử lại."),
});

let consumers = 0, stopPolling: (() => void) | undefined;
function observeUpdates() {
  if (++consumers === 1) {
    const visibleRefresh = () => { if (document.visibilityState !== "hidden") void store.refresh(false); };
    const invalidate = () => { void store.refresh(); };
    window.addEventListener("edujar:notifications", invalidate);
    window.addEventListener("focus", visibleRefresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    const timer = window.setInterval(visibleRefresh, 60000);
    stopPolling = () => { clearInterval(timer); window.removeEventListener("edujar:notifications", invalidate); window.removeEventListener("focus", visibleRefresh); document.removeEventListener("visibilitychange", visibleRefresh); };
  }
  return () => { if (--consumers === 0) stopPolling?.(); };
}

export function useNotificationFeed(id: string | number | undefined, page: number) {
  const userId = id === undefined ? null : String(id);
  const getSnapshot = useCallback(() => store.getSnapshot().userId === userId ? store.getSnapshot() : emptyNotifications, [userId]);
  const state = useSyncExternalStore(store.subscribe, getSnapshot, () => emptyNotifications);
  useEffect(() => store.retain(userId, page), [userId, page]);
  useEffect(observeUpdates, []);
  return { ...state, current: state.pages[page], refresh: () => store.load(page, true), ensureFresh: () => store.load(page), mark: store.mark };
}
