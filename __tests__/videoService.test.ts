import {
  generateAndPersistThumb,
  persistClip,
} from "@/src/services/videoService";
import * as FileSystem from "expo-file-system";

jest.mock("expo-video-thumbnails", () => ({
  getThumbnailAsync: jest.fn(async () => ({ uri: "file://tmp-thumb.jpg" })),
}));

describe("videoService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persistClip copies temp file and deletes source", async () => {
    const dest = await persistClip("file://tmp-in.mp4", "abc");
    expect(FileSystem.copyAsync).toHaveBeenCalled();
    expect(FileSystem.deleteAsync).toHaveBeenCalled();
    expect(dest).toContain("abc.mp4");
  });

  it("generateAndPersistThumb creates a file", async () => {
    const uri = await generateAndPersistThumb("file://video.mp4", "xyz");
    expect(uri).toContain("xyz.jpg");
    expect(FileSystem.copyAsync).toHaveBeenCalled();
  });
});
