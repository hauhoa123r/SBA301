import { describe, expect, it } from "vitest";
import { apiGrouping, groupEventBuckets } from "./overviewModel";

describe("weekly event series", () => {
  it("groups Monday through Sunday across month boundaries and keeps zero buckets", () => {
    expect(groupEventBuckets([
      { label: "2026-09-30", value: 2 }, { label: "2026-10-01", value: 3 },
      { label: "2026-10-04", value: 4 }, { label: "2026-10-05", value: 0 },
    ], "week")).toEqual([{ label: "Tuần 2026-09-28", value: 9 }, { label: "Tuần 2026-10-05", value: 0 }]);
    expect(apiGrouping("week")).toBe("day"); expect(apiGrouping("month")).toBe("month");
  });
  it("leaves server day/month series intact", () => {
    const rows = [{ label: "2026-10", value: 32 }];
    expect(groupEventBuckets(rows, "month")).toBe(rows);
  });
});
