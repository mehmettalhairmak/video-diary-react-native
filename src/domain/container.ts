import { ZustandVideoRepository } from "@/src/infrastructure/repositories/ZustandVideoRepository";
import { VideoRepository } from "./repositories/VideoRepository";

/**
 * Minimal DI container for swapping repository implementations (e.g., tests).
 */

class ContainerImpl {
  private _videoRepo: VideoRepository | null = null;

  get videoRepo(): VideoRepository {
    if (!this._videoRepo) this._videoRepo = new ZustandVideoRepository();
    return this._videoRepo;
  }

  setVideoRepository(repo: VideoRepository) {
    this._videoRepo = repo;
  }
}

export const Container = new ContainerImpl();
