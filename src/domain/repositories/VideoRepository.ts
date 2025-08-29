import { VideoItem } from "@types";

export interface VideoRepository {
  list(): Promise<VideoItem[]>;
  getById(id: string): Promise<VideoItem | undefined>;
  upsert(item: VideoItem): Promise<void>;
  updateMeta(
    id: string,
    data: Pick<VideoItem, "name" | "description">
  ): Promise<void>;
  remove(id: string): Promise<void>;
  clearAll(): Promise<void>;
}
