import "@testing-library/jest-native/extend-expect";
import { setImmediate } from "timers";

// Silence noisy logs during tests
jest.spyOn(global.console, "error").mockImplementation(() => {});
jest.spyOn(global.console, "warn").mockImplementation(() => {});

// Polyfills
if (!global.setImmediate) {
  // @ts-ignore
  global.setImmediate = setImmediate as any;
}

// Mock native modules we use
jest.mock("expo-video-thumbnails", () => ({
  getThumbnailAsync: jest.fn(async (_uri: string, _opts?: any) => ({
    uri: "file://thumb.jpg",
  })),
}));

jest.mock("expo-trim-video", () => ({
  trimVideo: jest.fn(async ({ uri }: { uri: string }) => ({ uri })),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///",
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async () => {}),
  deleteAsync: jest.fn(async () => {}),
}));

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Reanimated mock
jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

// Gesture handler
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  return {
    GestureHandlerRootView: ({ children }: any) =>
      React.createElement("View", null, children),
    Gesture: {
      Pan: () => ({ onBegin: () => {}, onUpdate: () => {}, onEnd: () => {} }),
      Pinch: () => ({ onUpdate: () => {}, onEnd: () => {} }),
      Simultaneous: (...args: any[]) => args,
    },
    GestureDetector: ({ children }: any) => children,
  };
});

// Haptics
jest.mock("expo-haptics", () => ({ selectionAsync: jest.fn(async () => {}) }));

// Nativewind className shim for tests
jest.mock("nativewind", () => ({ styled: (c: any) => c }));
