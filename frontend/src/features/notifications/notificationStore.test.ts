import { describe, expect, it, vi } from "vitest";
import { createNotificationStore } from "./notificationStore";
import type { NotificationFeed } from "./model";

function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
const feed = (unreadCount = 3, page = 0): NotificationFeed => ({ content: [{ id: 10 + page, type: "STUDY_REMINDER", title: "Daily", content: "Lesson", createdAt: "2026-10-28T01:00:00Z", path: null, read: unreadCount === 0 }], unreadCount, page, totalPages: 2 });

describe("shared notification requests and read state", () => {
  function setup() {
    const getPage = vi.fn<(page: number, signal: AbortSignal) => Promise<NotificationFeed>>().mockResolvedValue(feed());
    const markRead = vi.fn<(id?: number) => Promise<void>>().mockResolvedValue();
    let clock = 100000;
    const store = createNotificationStore({ getPage, markRead, errorMessage: () => "Request failed" }, () => clock);
    return { store, getPage, markRead, advance: () => { clock += 31000; } };
  }
  it("shares a pending page across the bell, full inbox and refresh clicks; opening never marks read", async () => {
    const { store, getPage, markRead, advance } = setup(), wait = deferred<NotificationFeed>();
    getPage.mockReturnValueOnce(wait.promise);
    store.retain("7", 0); store.retain("7", 0);
    const first = store.load(0, true), second = store.load(0, true);
    expect(first).toBe(second);
    await Promise.resolve(); expect(getPage).toHaveBeenCalledTimes(1);
    wait.resolve(feed()); await first;
    await store.load(0); expect(getPage).toHaveBeenCalledTimes(1);
    advance(); await store.load(0); expect(getPage).toHaveBeenCalledTimes(2);
    expect(markRead).not.toHaveBeenCalled();
  });
  it("uses the server unread count after a 204 read and keeps both active pages consistent", async () => {
    const { store, getPage, markRead } = setup(), mutation = deferred<void>();
    store.retain("7", 0); store.retain("7", 1); await store.refresh();
    markRead.mockReturnValueOnce(mutation.promise);
    getPage.mockImplementation(page => Promise.resolve(feed(0, page)));
    const read = store.mark(10);
    expect(store.mark(10)).toBe(read); await Promise.resolve();
    expect(markRead).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot().unreadCount).toBe(3);
    mutation.resolve(); await read;
    expect(store.getSnapshot().unreadCount).toBe(0);
    expect(store.getSnapshot().pages[0]?.data?.content[0]?.read).toBe(true);
    expect(store.getSnapshot().pages[1]?.data?.unreadCount).toBe(0);
    expect(store.getSnapshot().reading).toBeNull();
  });
  it("does not alter read flags/count on a failed PUT and supports retry", async () => {
    const { store, markRead } = setup();
    store.retain("7", 0); await store.load(0);
    markRead.mockRejectedValueOnce(new Error("write failed")); await store.mark();
    expect(store.getSnapshot().unreadCount).toBe(3);
    expect(store.getSnapshot().pages[0]?.data?.content[0]?.read).toBe(false);
    expect(store.getSnapshot().writeError).toBe("Request failed");
    await store.mark(); expect(store.getSnapshot().writeError).toBe("");
  });
  it("retains loaded records on refresh errors instead of flashing an empty inbox", async () => {
    const { store, getPage } = setup();
    store.retain("7", 0); await store.load(0);
    getPage.mockRejectedValueOnce(new Error("offline")); await store.load(0, true);
    expect(store.getSnapshot().pages[0]?.data?.content).toHaveLength(1);
    expect(store.getSnapshot().pages[0]?.error).toBe("Request failed");
  });
  it("discards an old account response and clears its private records", async () => {
    const { store, getPage } = setup(), old = deferred<NotificationFeed>();
    getPage.mockReturnValueOnce(old.promise);
    store.retain("7", 0); const pending = store.load(0);
    await Promise.resolve(); store.setUser("8");
    old.resolve(feed(99)); await pending;
    expect(store.getSnapshot()).toMatchObject({ userId: "8", pages: {} });
    expect(store.getSnapshot().unreadCount).toBeUndefined();
    store.retain("8", 0); await store.load(0);
    expect(store.getSnapshot().unreadCount).toBe(3);
  });
  it("ignores a stale GET racing with marking read", async () => {
    const { store, getPage } = setup(), old = deferred<NotificationFeed>();
    store.retain("7", 0); await store.load(0);
    getPage.mockReturnValueOnce(old.promise);
    const refreshing = store.load(0, true); await Promise.resolve();
    getPage.mockResolvedValue(feed(0)); await store.mark();
    old.resolve(feed(3)); await refreshing;
    expect(store.getSnapshot().unreadCount).toBe(0);
  });
});
