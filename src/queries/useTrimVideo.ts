import { useMutation } from "@tanstack/react-query";
import { trimVideo } from "expo-trim-video";
import { qk } from "./keys";

/**
 * Trim a video from start..end seconds.
 * Returns: { uri } of a temporary file produced by native module.
 */
export type TrimArgs = { uri: string; start: number; end: number };

export function useTrimVideo() {
  return useMutation({
    mutationKey: qk.trimVideo,
    mutationFn: async ({ uri, start, end }: TrimArgs) => {
      const res = await trimVideo({ uri, start, end });
      return res;
    },
  });
}
