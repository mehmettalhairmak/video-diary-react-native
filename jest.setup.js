require("@testing-library/jest-native/extend-expect");
const { setImmediate: _setImmediate } = require("timers");

// Silence noisy logs during tests
jest.spyOn(global.console, "error").mockImplementation(() => {});
jest.spyOn(global.console, "warn").mockImplementation(() => {});

// Polyfills
if (!global.setImmediate) {
  global.setImmediate = _setImmediate;
}

// Mock native modules we use
jest.mock("expo-video-thumbnails", () => ({
  getThumbnailAsync: jest.fn(async () => ({ uri: "file://thumb.jpg" })),
}));

jest.mock("expo-trim-video", () => ({
  trimVideo: jest.fn(async ({ uri }) => ({ uri })),
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///",
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async () => {}),
  deleteAsync: jest.fn(async () => {}),
}));

// Controllable mock for expo-video
(() => {
  const state = { duration: 10 };
  jest.mock("expo-video", () => ({
    useVideoPlayer: () => ({
      duration: state.duration,
      pause: jest.fn(),
      play: jest.fn(),
      currentTime: 0,
    }),
    VideoView: () => null,
  }));
  // Expose setter to tests
  global.__setExpoVideoDuration = (d) => {
    state.duration = d;
  };
})();

// Controllable mock for expo-image-picker
(() => {
  const picker = { canceled: true, assets: [{ uri: "file://in.mp4" }] };
  jest.mock("expo-image-picker", () => ({
    getMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
    requestMediaLibraryPermissionsAsync: jest.fn(async () => ({
      granted: true,
    })),
    launchImageLibraryAsync: jest.fn(async () => ({ ...picker })),
    MediaTypeOptions: { Videos: "Videos" },
  }));
  global.__setImagePickerResult = (res) => {
    picker.canceled = !!res.canceled;
    picker.assets = res.assets || picker.assets;
  };
})();

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Reanimated mock (inline to avoid ESM import issues)
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  // Patch missing pieces used in our code/moti
  Reanimated.default = {
    ...Reanimated,
    // make sure default has createAnimatedComponent
    createAnimatedComponent: (Component) => Component,
  };
  Reanimated.createAnimatedComponent = (Component) => Component;
  Reanimated.default.call = () => {};
  Reanimated.runOnJS = (fn) => fn;
  Reanimated.useDerivedValue = (compute) => ({
    value: typeof compute === "function" ? compute() : compute,
  });
  Reanimated.useAnimatedProps = () => ({});
  // Ensure createAnimatedComponent exists on default
  Reanimated.default.createAnimatedComponent =
    Reanimated.default.createAnimatedComponent || ((Component) => Component);
  // Provide Animated.View for JSX usage
  try {
    const { View, Image } = require("react-native");
    Reanimated.default.View = View;
    Reanimated.default.Image = Image;
  } catch {}
  return Reanimated;
});

// Simplify moti/skeleton to avoid deep reanimated integration in tests
jest.mock("moti/skeleton", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Skeleton = ({ children, width, height, radius }) =>
    React.createElement(
      View,
      {
        style: {
          width: width ?? 0,
          height: height ?? 0,
          borderRadius: radius ?? 0,
        },
      },
      children ?? null
    );
  Skeleton.Group = ({ children }) =>
    React.createElement(React.Fragment, null, children);
  return { Skeleton };
});

// Gesture handler
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  return {
    GestureHandlerRootView: ({ children }) =>
      React.createElement("View", null, children),
    Gesture: {
      Pan: () => {
        const api = {};
        api.onBegin = () => api;
        api.onUpdate = () => api;
        api.onEnd = () => api;
        return api;
      },
      Pinch: () => {
        const api = {};
        api.onUpdate = () => api;
        api.onEnd = () => api;
        return api;
      },
      Simultaneous: (...args) => args,
    },
    GestureDetector: ({ children }) => children,
  };
});

// Haptics
jest.mock("expo-haptics", () => ({ selectionAsync: jest.fn(async () => {}) }));

// Nativewind className shim for tests
jest.mock("nativewind", () => ({ styled: (c) => c }));

// Safe area context
jest.mock("react-native-safe-area-context", () => {
  return {
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }) => children,
  };
});
