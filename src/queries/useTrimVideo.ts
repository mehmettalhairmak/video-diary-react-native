import { useMutation } from "@tanstack/react-query";
import { trimVideo } from "expo-trim-video";
import { qk } from "./keys";

export type TrimArgs = { uri: string; start: number; end: number };

export function useTrimVideo() {
  return useMutation({
    mutationKey: qk.trimVideo,
    mutationFn: async ({ uri, start, end }: TrimArgs) => {
      const res = await trimVideo({ uri, start, end });
      return res; // { uri }
    },
  });
}
