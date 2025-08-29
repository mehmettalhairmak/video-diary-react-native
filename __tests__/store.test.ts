import { useVideoStore } from "@/src/store/useVideoStore";

// Access the store without React by using getState and setState

describe("useVideoStore", () => {
  beforeEach(() => {
    useVideoStore.getState().clearAll();
  });

  it("upserts and lists items", () => {
    const item = {
      id: "1",
      uri: "file://video.mp4",
      name: "n",
      description: "",
      createdAt: Date.now(),
      duration: 5,
      thumbUri: "file://t.jpg",
    };
    useVideoStore.getState().upsert(item);
    expect(useVideoStore.getState().items).toHaveLength(1);
  });

  it("updateMeta updates name and description", () => {
    const item = {
      id: "1",
      uri: "file://video.mp4",
      name: "n",
      description: "",
      createdAt: Date.now(),
      duration: 5,
      thumbUri: "file://t.jpg",
    };
    useVideoStore.getState().upsert(item);
    useVideoStore.getState().updateMeta("1", { name: "x", description: "y" });
    const updated = useVideoStore.getState().items.find((i) => i.id === "1");
    expect(updated?.name).toBe("x");
    expect(updated?.description).toBe("y");
  });

  it("remove deletes item", () => {
    const item = {
      id: "1",
      uri: "file://video.mp4",
      name: "n",
      description: "",
      createdAt: Date.now(),
      duration: 5,
      thumbUri: "file://t.jpg",
    };
    useVideoStore.getState().upsert(item);
    useVideoStore.getState().remove("1");
    expect(useVideoStore.getState().items).toHaveLength(0);
  });
});
