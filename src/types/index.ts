export type VideoItem = {
  id: string;
  uri: string; // trimmed video file uri
  name: string;
  description?: string;
  createdAt: number; // epoch ms
  duration: number; // seconds
  thumbUri?: string; // optional generated thumbnail
};
