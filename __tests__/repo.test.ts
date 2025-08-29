import { ZustandVideoRepository } from "@/src/infrastructure/repositories/ZustandVideoRepository";

const repo = new ZustandVideoRepository();

describe("ZustandVideoRepository", () => {
  it("upserts and retrieves", async () => {
    await repo.clearAll();
    const item = {
      id: "1",
      uri: "file://video.mp4",
      name: "n",
      description: "",
      createdAt: Date.now(),
      duration: 5,
      thumbUri: "file://t.jpg",
    };
    await repo.upsert(item);
    const all = await repo.list();
    expect(all).toHaveLength(1);
    const got = await repo.getById("1");
    expect(got?.id).toBe("1");
  });
});
