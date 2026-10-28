import type { NotificationFeed } from "./model";

interface PageState { data?: NotificationFeed; loading: boolean; error: string; updatedAt: number }
export interface NotificationSnapshot {
  userId: string | null;
  pages: Record<number, PageState>;
  unreadCount?: number;
  reading: number | "all" | null;
  writeError: string;
}
interface Transport {
  getPage: (page: number, signal: AbortSignal) => Promise<NotificationFeed>;
  markRead: (id?: number) => Promise<void>;
  errorMessage: (error: unknown) => string;
}
export const emptyNotifications: NotificationSnapshot = { userId: null, pages: {}, reading: null, writeError: "" };

// Shared by the header bell and full inbox. Requests and read operations have one owner.
export function createNotificationStore(api: Transport, now = Date.now) {
  let state = emptyNotifications, generation = 0;
  let writing: Promise<void> | null = null;
  const pending = new Map<number, { controller: AbortController; promise: Promise<void> }>();
  const activePages = new Map<number, number>();
  const listeners = new Set<() => void>();
  const publish = (next: NotificationSnapshot) => { state = next; listeners.forEach(listener => listener()); };
  const abortReads = () => { pending.forEach(item => item.controller.abort()); pending.clear(); };
  const setPage = (page: number, next: PageState) => publish({ ...state, pages: { ...state.pages, [page]: next } });

  function setUser(userId: string | null) {
    if (state.userId === userId) return;
    generation++; abortReads(); activePages.clear(); writing = null;
    publish({ ...emptyNotifications, userId });
  }
  function load(page: number, force = false, afterWrite = false): Promise<void> {
    if (!state.userId || (writing && !afterWrite)) return writing ?? Promise.resolve();
    const existing = pending.get(page);
    if (existing) return existing.promise;
    const previous = state.pages[page];
    if (!force && previous?.updatedAt && now() - previous.updatedAt < 30000) return Promise.resolve();
    const epoch = generation, controller = new AbortController();
    setPage(page, { ...previous, loading: true, error: "", updatedAt: previous?.updatedAt ?? 0 });
    const promise = Promise.resolve().then(() => api.getPage(page, controller.signal)).then(data => {
      if (epoch !== generation || controller.signal.aborted) return;
      publish({ ...state, unreadCount: data.unreadCount, pages: { ...state.pages, [page]: { data, loading: false, error: "", updatedAt: now() } } });
    }).catch((error: unknown) => {
      if (epoch === generation && !controller.signal.aborted)
        setPage(page, { ...previous, loading: false, error: api.errorMessage(error), updatedAt: previous?.updatedAt ?? 0 });
    }).finally(() => { if (pending.get(page)?.controller === controller) pending.delete(page); });
    pending.set(page, { controller, promise });
    return promise;
  }
  function refresh(force = true, afterWrite = false) { return Promise.all([...activePages.keys()].map(page => load(page, force, afterWrite))); }
  function retain(userId: string | null, page: number) {
    setUser(userId);
    if (!userId) return () => {};
    activePages.set(page, (activePages.get(page) ?? 0) + 1);
    void load(page);
    return () => {
      if (state.userId !== userId) return;
      const count = (activePages.get(page) ?? 1) - 1;
      if (count > 0) activePages.set(page, count); else activePages.delete(page);
    };
  }
  function mark(id?: number): Promise<void> {
    if (!state.userId) return Promise.resolve();
    if (writing) return writing;
    const epoch = ++generation;
    abortReads();
    publish({ ...state, reading: id ?? "all", writeError: "", pages: Object.fromEntries(Object.entries(state.pages).map(([page, value]) => [page, { ...value, loading: false }])) });
    const operation = Promise.resolve().then(() => api.markRead(id)).then(async () => {
      if (epoch !== generation) return;
      // PUT is 204: get authoritative records and the global unread count from the server.
      publish({ ...state, pages: Object.fromEntries(Object.entries(state.pages).map(([page, value]) => [page, { ...value, updatedAt: 0 }])) });
      await refresh(true, true);
    }).catch((error: unknown) => {
      if (epoch === generation) publish({ ...state, writeError: api.errorMessage(error) });
    }).finally(() => {
      if (epoch === generation) { writing = null; publish({ ...state, reading: null }); }
    });
    writing = operation;
    return operation;
  }
  return { retain, setUser, load, refresh, mark, getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; } };
}
