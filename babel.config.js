module.exports = function (api) {
  const isTest =
    process.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID;
  api.cache(() => (isTest ? "test" : "prod"));
  return {
    presets: [
      [
        "babel-preset-expo",
        { jsxImportSource: isTest ? "react" : "nativewind" },
      ],
      // NativeWind's babel plugin injects CSS interop which breaks Jest's mock factory scoping.
      // Exclude it in test environment.
      ...(!isTest ? ["nativewind/babel"] : []),
    ],
  // Reanimated plugin must be last and is not needed in tests
  plugins: [...(!isTest ? ["react-native-reanimated/plugin"] : [])],
  };
};
