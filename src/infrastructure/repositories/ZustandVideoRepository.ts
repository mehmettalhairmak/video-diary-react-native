import { VideoRepository } from "@/src/domain/repositories/VideoRepository";
import { useVideoStore } from "@store/useVideoStore";
import { VideoItem } from "@types";

export class ZustandVideoRepository implements VideoRepository {
  async list(): Promise<VideoItem[]> {
    return useVideoStore.getState().items;
  }
  async getById(id: string): Promise<VideoItem | undefined> {
    return useVideoStore.getState().items.find((i) => i.id === id);
  }
  async upsert(item: VideoItem): Promise<void> {
    useVideoStore.getState().upsert(item);
  }
  async updateMeta(
    id: string,
    data: Pick<VideoItem, "name" | "description">
  ): Promise<void> {
    useVideoStore.getState().updateMeta(id, data);
  }
  async remove(id: string): Promise<void> {
    useVideoStore.getState().remove(id);
  }
  async clearAll(): Promise<void> {
    useVideoStore.getState().clearAll();
  }
}
