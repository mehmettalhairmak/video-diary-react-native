import { VideoPlayer } from "@/src/components/organisms/VideoPlayer";
import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("expo-video", () => ({
  useVideoPlayer: () => ({
    duration: 0,
    pause: jest.fn(),
    play: jest.fn(),
    currentTime: 0,
  }),
  VideoView: () => null,
}));

describe("VideoPlayer", () => {
  it("renders without crashing with default props", () => {
    render(<VideoPlayer uri={"" as any} />);
  });
});
