import { useTrimVideo } from "@/src/queries/useTrimVideo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-trim-video", () => ({
  trimVideo: jest.fn(async () => {
    throw new Error("trim failed");
  }),
}));

function Provider({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 0 }, mutations: { retry: 0 } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useTrimVideo (error)", () => {
  it("propagates errors", async () => {
    const { result } = renderHook(() => useTrimVideo(), { wrapper: Provider });
    await expect(
      result.current.mutateAsync({ uri: "file://in.mp4", start: 0, end: 5 })
    ).rejects.toThrow("trim failed");
  });
});
