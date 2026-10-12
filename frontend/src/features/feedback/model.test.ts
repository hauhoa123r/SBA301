import { describe, expect, it } from "vitest";
import { buildAnswers, newQuestion, type FeedbackQuestion } from "./model";

const question = (patch: Partial<FeedbackQuestion> = {}): FeedbackQuestion => ({ ...newQuestion(), id: 10, title: "Câu hỏi", ...patch });
describe("feedback answer validation", () => {
  it("rejects a required blank response and omits optional blanks", () => {
    const result = buildAnswers([question({ required: true }), question()], { "0": "  " });
    expect(result.errors).toEqual({ "0": "Vui lòng trả lời câu hỏi này." }); expect(result.answers).toEqual([]);
  });
  it("enforces text length and trims accepted responses", () => {
    expect(buildAnswers([question({ maxLength: 3 })], { "0": "abcd" }).errors["0"]).toBeDefined();
    expect(buildAnswers([question()], { "0": "  góp ý  " }).answers[0]?.text).toBe("góp ý");
  });
  it("enforces numeric bounds and decimal precision", () => {
    const q = question({ type: "NUMBER", minValue: 0, maxValue: 10 });
    for (const value of ["-1", "11", "NaN", "1.12345"]) expect(buildAnswers([q], { "0": value }).errors["0"]).toBeDefined();
    expect(buildAnswers([q], { "0": "1.1234" }).answers[0]?.number).toBe(1.1234);
  });
  it("saves multiple selected IDs without losing selections", () => {
    const q = question({ type: "MULTIPLE_CHOICE", minSelections: 2, maxSelections: 3, options: [1, 2, 3].map(id => ({ id, label: String(id) })) });
    expect(buildAnswers([q], { "0": [1] }).errors["0"]).toBeDefined();
    const result = buildAnswers([q], { "0": [1, 3] }); expect(result.errors).toEqual({}); expect(result.answers[0]?.optionIds).toEqual([1, 3]);
  });
  it("requires integer Likert and rating scores within the configured range", () => {
    const q = question({ ...newQuestion("LIKERT"), id: 10 });
    for (const value of ["0", "6", "2.5"]) expect(buildAnswers([q], { "0": value }).errors["0"]).toBeDefined();
    expect(buildAnswers([q], { "0": "5" }).answers[0]?.number).toBe(5);
    expect(buildAnswers([question({ type: "RATING", minValue: 2, maxValue: 8 })], { "0": "9" }).errors["0"]).toBeDefined();
  });
  it("clearing optional choices removes the answer rather than sending an empty selection", () => {
    expect(buildAnswers([question({ type: "SINGLE_CHOICE" })], { "0": "" }).answers).toEqual([]);
  });
});
