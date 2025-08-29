import { clamp } from "@/src/utils/time";

describe("clamp", () => {
  it("returns min when below", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("returns max when above", () => {
    expect(clamp(20, 0, 10)).toBe(10);
  });
  it("returns value when within", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});
