import { describe, expect, it } from "vitest";
import { groupNotices, noticePreview, noticeSummary, noticeTarget, noticeTime } from "./model";
import type { Notice } from "./model";

const notice = (id: number, createdAt: string): Notice => ({ id, createdAt, title: "Bài học hôm nay", content: "Tiếp tục bài Sales", type: "STUDY_REMINDER", read: false, path: "/learning/courses/1/lessons/2" });

describe("notification presentation", () => {
  const now = Date.parse("2026-10-28T01:00:00Z");
  it("groups at Vietnam midnight and retains distinct reminder events with identical text", () => {
    const groups = groupNotices([notice(1, "2026-10-27T16:59:59Z"), notice(2, "2026-10-27T17:00:00Z"), notice(2, "2026-10-27T17:00:00Z")], now);
    expect(groups.map(group => [group.label, group.items.map(item => item.id)])).toEqual([["Hôm nay", [2]], ["Hôm qua", [1]]]);
  });
  it("formats human Vietnamese times and handles invalid timestamps", () => {
    expect(noticeTime("2026-10-28T00:58:00Z", now).relative).toBe("2 phút trước");
    expect(noticeTime("2026-10-28T00:00:00Z", now).relative).toBe("1 giờ trước");
    expect(noticeTime("2026-10-28T02:00:00Z", now).relative).toBe("Vừa xong");
    expect(noticeTime("invalid", now)).toEqual({ relative: "", full: "" });
  });
  it("allows existing lesson/feedback targets and rejects unsafe routes", () => {
    const sample = notice(1, "");
    expect(noticeTarget(sample)).toBe("/learning/courses/1/lessons/2");
    expect(noticeTarget({ ...sample, path: "/learning#notifications" })).toBe("/learning#notifications");
    for (const path of ["//evil.test/learning/", "https://evil.test", "/learning/../admin", "/learning/courses/1/lessons/2?redirect=https://evil.test", "/admin/users", null]) expect(noticeTarget({ ...sample, path })).toBeNull();
  });
  it("omits only a repeated title and keeps long response text intact", () => {
    const sample = notice(1, "");
    expect(noticeSummary({ ...sample, content: " Bài học\n hôm nay " })).toBe("");
    expect(noticeSummary({ ...sample, content: "Chủ đề: Hỗ trợ\n\nNội dung trả lời đầy đủ" })).toContain("\n\nNội dung trả lời đầy đủ");
    expect(noticePreview({ ...sample, type: "FEEDBACK_REPLY", content: "Chủ đề: Hỗ trợ\n\nNội dung trả lời đầy đủ" })).toBe("Nội dung trả lời đầy đủ");
  });
});
