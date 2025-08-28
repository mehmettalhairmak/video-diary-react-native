# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## VideoDiary

React Native (Expo) Video Diary implementing: crop 5s segments, metadata, persistent list. Tech: Expo Router, Zustand + AsyncStorage, TanStack Query, expo-trim-video, NativeWind, expo-video.

Quick start:

1. Install deps (already in package.json). 2. Start dev server.

Run:

```sh
npm start
```

Notes:
- iOS/Android require dev build for expo-trim-video. Use: `npx expo run:ios` or `npx expo run:android` after installing pods/gradle.
- Web is unsupported for trimming.

In the output, you'll find options to open the app in a


You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
