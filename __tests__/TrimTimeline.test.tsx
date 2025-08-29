import TrimTimeline from "@/src/components/organisms/TrimTimeline";
import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

describe("TrimTimeline", () => {
  it("shows correct start and end labels for given start/fixed/duration", async () => {
    render(
      <TrimTimeline
        uri="file://video.mp4"
        duration={10}
        fixedLength={5}
        start={3}
        onChangeStart={() => {}}
        onThumbsLoadingChange={() => {}}
      />
    );

    // Wait until loading finishes and labels appear
    await waitFor(() => expect(screen.getByText("00:03.000")).toBeTruthy());
    expect(screen.getByText("00:08.000")).toBeTruthy();
  });
});
