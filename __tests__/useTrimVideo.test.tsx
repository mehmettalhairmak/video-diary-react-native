import { useTrimVideo } from "@/src/queries/useTrimVideo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

function Provider({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: 0 },
      mutations: { retry: 0 },
    },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useTrimVideo", () => {
  it("calls expo-trim-video and returns uri", async () => {
    const { result } = renderHook(() => useTrimVideo(), { wrapper: Provider });
    const p = result.current.mutateAsync({
      uri: "file://in.mp4",
      start: 0,
      end: 5,
    });
    await expect(p).resolves.toEqual({ uri: "file://in.mp4" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
