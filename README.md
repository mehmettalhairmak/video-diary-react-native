# Video Diary – React Native (Expo) 🚀

A simple, performant, and scalable Video Diary app. Users can:

- Import a video from the device
- Select a 5-second segment with a scrubber (crop)
- Add name and description
- Save and view cropped videos later

Built with modern React Native practices and a clean architecture mindset.

## ✨ Features

- Main Screen: Persistent list of cropped videos with thumbnails; tap to open details
- Crop Modal (3-step flow):
  1. Select a video from gallery
  2. Choose a 5-second segment using a timeline scrubber and proceed
  3. Fill metadata and save (cropping happens via a mutation)
- Details Page: Minimal player with name and description
- Edit Page (optional): Update name/description of a saved clip

## 🧰 Tech Stack

- Framework: Expo + Expo Router
- State: Zustand + AsyncStorage (persisted store)
- Async/Server: TanStack Query (mutations for cropping)
- Media: expo-trim-video (core cropping), expo-video (playback), expo-video-thumbnails
- UI: NativeWind (Tailwind-in-RN), Safe Area, minimal design
- Validation: Zod (metadata form)
- Animations: React Native Reanimated (used in TrimTimeline), Haptics
- Language/Build: TypeScript, Metro, Babel

## 📁 Project Structure

```
app/                     # Expo Router routes (index, details, crop modal, edit)
src/
  components/            # UI building blocks
    molecules/           # MetadataForm, etc.
    organisms/           # TrimTimeline, VideoPlayer, etc.
  constants/             # Constants (e.g., fixed clip length)
  domain/                # Container & abstractions (repositories)
  infrastructure/        # Repository implementations (Zustand)
  lib/                   # Query Client, misc libs
  queries/               # React Query hooks
  services/              # File/thumbnail persistence helpers
  store/                 # Zustand store (persisted)
  types/                 # Shared types
  utils/                 # Helpers (ids/time)
  validation/            # Zod schemas
```

Notable decisions:

- Trim UI is an isolated `TrimTimeline` with thumbnails, pinch-to-density and drag gestures (mocked in tests)
- Repo pattern (`domain` + `infrastructure`) over direct store coupling
- Persisted list via Zustand + AsyncStorage for simplicity and speed

## 🚀 Getting Started

1. Install deps

```sh
npm install
```

2. Create a dev build (required for expo-trim-video)

```sh
# iOS
npx expo run:ios

# Android
npx expo run:android
```

3. Start the Metro bundler

```sh
npm start
```

Notes:

- Cropping is not supported on web – use a native dev build.
- On iOS, ensure pods are installed by running the `run:ios` command above.

## 🔧 Native builds and expo prebuild

You usually don’t need to run `expo prebuild` manually: `npx expo run:ios|android` will prebuild when required. Run it yourself when:

- You add a new native module (any package that isn’t pure JS or uses a config plugin)
- You change native config in `app.json`/`app.config.ts` (e.g., permissions, icons, plugins)
- You upgrade the Expo SDK or make large native changes and want to regenerate `ios/` and `android/`

Common commands:

```sh
# Generate native projects for both platforms (if needed)
npx expo prebuild

# Platform-specific
npx expo prebuild -p ios
npx expo prebuild -p android

# Clean regenerate native projects (fixes many mismatch issues)
npx expo prebuild --clean

# Then run a dev build
npx expo run:ios
npx expo run:android
```

Notes:

- `run:ios`/`run:android` will also install CocoaPods as needed; only run `cd ios && pod install` if you build directly via Xcode.
- Prebuild overwrites files under `ios/` and `android/`. Prefer config plugins; avoid manual edits unless you intend to maintain a custom native fork.

## 🧪 Testing

- Runner: Jest (jest-expo preset)
- UI: React Native Testing Library
- Mocks: Native modules (expo-video, expo-trim-video, thumbnails, reanimated, gesture-handler, safe area, AsyncStorage)
- Coverage thresholds (enforced):
  - statements ≥ 70%, branches ≥ 55%, functions ≥ 65%, lines ≥ 75%

Run tests:

```sh
npm test
```

Highlights:

- Behavior tests for Crop modal flow and timeline labels
- Hook and service tests (trim mutation, file ops)
- Store/repository unit tests

## 🧭 User Flow

1. From the main screen, tap + to open the Crop modal
2. Select a video (Step 1)
3. Choose a fixed 5s segment using the timeline (Step 2) and tap Next
4. Add name/description and Save (Step 3)
5. The cropped clip is persisted and appears in the main list; tap to view details

## ⚙️ Implementation Details

- Cropping: `useTrimVideo` mutation wraps `expo-trim-video` for async reliability
- Persistence: Clips and thumbs copied into app document directories
- Thumbnails: Generated with `expo-video-thumbnails` and stored for fast list rendering
- Validation: Zod schema ensures required name before saving
- Styling: NativeWind `className` for concise styles

## 📈 Scalability & Performance

- Separation of concerns (domain/infrastructure/services) for easy swaps (e.g., SQLite instead of AsyncStorage)
- React Query for background work and retry control
- Thumbnails and fixed-length cropping keep UI responsive and predictable

## 💡 Optional Enhancements

- Replace AsyncStorage with Expo SQLite for structured queries and large lists
- Add richer animations with Reanimated (transitions, scroll effects)
- Add delete/rename actions on list items
- Wire up CI to run tests and coverage checks on PRs

## 🛠️ Troubleshooting

- Trimming doesn’t run on web: use native dev builds (`npx expo run:ios|android`).
- iOS Pods/Android Gradle: `run:ios`/`run:android` handles build setup.
- Jest fails on reanimated/moti: the project includes robust test mocks; if customizing, ensure `react-native-reanimated` is allowed in `transformIgnorePatterns` and `moti/skeleton` is neutralized in tests.
- Watchman recrawl warnings on macOS: you can reset watches if needed:

```sh
watchman watch-del "$(pwd)"; watchman watch-project "$(pwd)"
```
