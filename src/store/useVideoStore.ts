/**
 * Persisted video list store.
 * - Items stored in AsyncStorage under key `video-diary-items`.
 * - Public API mirrors repository operations (upsert/updateMeta/remove/clearAll).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VideoItem } from "@types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface VideoState {
  items: VideoItem[];
  _hydrated?: boolean;
  upsert: (item: VideoItem) => void;
  updateMeta: (
    id: string,
    data: Pick<VideoItem, "name" | "description">
  ) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      items: [],
      _hydrated: false,
      upsert: (item) =>
        set((s) => {
          const idx = s.items.findIndex((i) => i.id === item.id);
          if (idx === -1) return { items: [item, ...s.items] };
          const next = [...s.items];
          next[idx] = item;
          return { items: next };
        }),
      updateMeta: (id, data) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: "video-diary-items",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
        }
      },
    }
  )
);
