import { metadataSchema } from "@/src/validation/metadata";

describe("metadataSchema", () => {
  it("accepts valid", () => {
    const res = metadataSchema.safeParse({ name: "A", description: "B" });
    expect(res.success).toBe(true);
  });
  it("rejects empty name", () => {
    const res = metadataSchema.safeParse({ name: "", description: "" });
    expect(res.success).toBe(false);
  });
});
