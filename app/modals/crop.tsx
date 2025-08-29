import { MetadataForm } from "@components/MetadataForm";
import TrimTimeline from "@components/TrimTimeline";
import { useTrimVideo } from "@queries/useTrimVideo";
import { useVideoStore } from "@store/useVideoStore";
import { uid } from "@utils/ids";
import { clamp } from "@utils/time";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

export default function CropModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [picked, setPicked] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const fixedLength = 5; // seconds
  const [start, setStart] = useState(0);
  const end = useMemo(
    () => clamp(start + fixedLength, 0, duration),
    [start, duration]
  );
  const [meta, setMeta] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [saving, setSaving] = useState(false);
  const [thumbsLoading, setThumbsLoading] = useState(true);
  const [previewSize, setPreviewSize] = useState({ w: 0, h: 0 });

  const upsert = useVideoStore((s) => s.upsert);
  const { mutateAsync, isPending } = useTrimVideo();

  // Player for preview and duration
  const player = useVideoPlayer(picked, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (player?.duration && player.duration > 0) {
        setDuration(player.duration);
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, [player]);

  // Track keyboard to avoid covering the footer button
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (e: any) => {
      const kh = e?.endCoordinates?.height ?? 0;
      // subtract safe area bottom so we only pad for the overlapped area
      setKeyboardHeight(Math.max(0, kh - (insets?.bottom || 0)));
    };
    const onHide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(showEvent as any, onShow);
    const subHide = Keyboard.addListener(hideEvent as any, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [insets?.bottom]);

  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    });
    if (!res.canceled) {
      setPicked(res.assets[0].uri);
      setStep(2);
    }
  };

  const onTrim = async () => {
    if (!picked) return;
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
    });
    const parsed = schema.safeParse(meta);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path[0] === "name");
      setErrors({ name: issue?.message });
      setStep(3);
      return;
    }
    try {
      setSaving(true);
      const { uri } = await mutateAsync({ uri: picked, start, end });
      // Move to app documents for persistence if desired
      const id = uid();
      const dest = FileSystem.documentDirectory + `clips/${id}.mp4`;
      await FileSystem.makeDirectoryAsync(
        FileSystem.documentDirectory + "clips",
        { intermediates: true }
      ).catch(() => {});
      await FileSystem.copyAsync({ from: uri, to: dest });

      // Generate and persist a thumbnail for the trimmed clip
      let thumbUri: string | undefined = undefined;
      try {
        const { uri: tmpThumb } = await VideoThumbnails.getThumbnailAsync(
          dest,
          { time: 0 }
        );
        const thumbsDir = FileSystem.documentDirectory + "thumbs";
        await FileSystem.makeDirectoryAsync(thumbsDir, {
          intermediates: true,
        }).catch(() => {});
        const finalThumb = `${thumbsDir}/${id}.jpg`;
        await FileSystem.copyAsync({ from: tmpThumb, to: finalThumb });
        thumbUri = finalThumb;
      } catch (e) {
        // best-effort; keep going without a thumbnail
      }

      upsert({
        id,
        uri: dest,
        name: meta.name || "Untitled",
        description: meta.description,
        createdAt: Date.now(),
        duration: fixedLength,
        thumbUri,
      });
      router.back();
    } catch (e: any) {
      Alert.alert("Trim error", e?.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ presentation: "modal", title: "New Clip" }} />
      {step === 1 && (
        <View className="flex-1 items-center justify-center p-6">
          <Pressable
            onPress={pickVideo}
            className="bg-blue-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Select a video</Text>
          </Pressable>
        </View>
      )}
      {step === 2 && picked && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text className="text-lg font-semibold mb-2">
            Choose a 5s segment
          </Text>
          <View
            className="w-full h-56 bg-black mb-4 rounded-md overflow-hidden"
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setPreviewSize({ w: width, h: height });
            }}
          >
            {thumbsLoading ? (
              <View className="flex-1 items-center justify-center">
                <Skeleton
                  width={
                    previewSize.w ||
                    Math.max(1, Dimensions.get("window").width - 32)
                  }
                  height={previewSize.h || 224}
                  radius={2}
                  colorMode="light"
                />
              </View>
            ) : (
              <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </View>
          <TrimTimeline
            uri={picked}
            duration={duration}
            fixedLength={fixedLength}
            start={start}
            onThumbsLoadingChange={setThumbsLoading}
            onChangeStart={(s) => {
              const clamped = clamp(s, 0, Math.max(0, duration - fixedLength));
              setStart(clamped);
              // live seek on change for smoother UX
              try {
                if (player) player.currentTime = clamped;
              } catch {}
            }}
            onScrubStart={() => {
              try {
                player?.pause?.();
              } catch {}
            }}
            onScrubEnd={(s) => {
              try {
                if (player) player.currentTime = s;
                player?.play?.();
              } catch {}
            }}
          />
          <View className="mt-3 flex-row items-center justify-end">
            {thumbsLoading ? (
              <View className="flex-row items-center gap-2">
                <Skeleton width={44} height={28} radius={6} colorMode="light" />
                <Skeleton width={44} height={28} radius={6} colorMode="light" />
                <Skeleton width={44} height={28} radius={6} colorMode="light" />
                <Skeleton width={44} height={28} radius={6} colorMode="light" />
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Pressable
                  onPress={() => {
                    const next = clamp(
                      start - 0.5,
                      0,
                      Math.max(0, duration - fixedLength)
                    );
                    setStart(next);
                    try {
                      if (player) player.currentTime = next;
                    } catch {}
                  }}
                  className="px-2 py-1 rounded border border-gray-300"
                >
                  <Text className="text-xs">-0.5s</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const next = clamp(
                      start - 0.1,
                      0,
                      Math.max(0, duration - fixedLength)
                    );
                    setStart(next);
                    try {
                      if (player) player.currentTime = next;
                    } catch {}
                  }}
                  className="px-2 py-1 rounded border border-gray-300"
                >
                  <Text className="text-xs">-0.1s</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const next = clamp(
                      start + 0.1,
                      0,
                      Math.max(0, duration - fixedLength)
                    );
                    setStart(next);
                    try {
                      if (player) player.currentTime = next;
                    } catch {}
                  }}
                  className="px-2 py-1 rounded border border-gray-300"
                >
                  <Text className="text-xs">+0.1s</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const next = clamp(
                      start + 0.5,
                      0,
                      Math.max(0, duration - fixedLength)
                    );
                    setStart(next);
                    try {
                      if (player) player.currentTime = next;
                    } catch {}
                  }}
                  className="px-2 py-1 rounded border border-gray-300"
                >
                  <Text className="text-xs">+0.5s</Text>
                </Pressable>
              </View>
            )}
          </View>
          {thumbsLoading ? (
            <View className="mt-6 self-end">
              <Skeleton width={120} height={40} radius={8} colorMode="light" />
            </View>
          ) : (
            <Pressable
              onPress={() => setStep(3)}
              className="mt-6 bg-blue-600 px-6 py-3 rounded-md self-end"
            >
              <Text className="text-white font-semibold">Next</Text>
            </Pressable>
          )}
        </ScrollView>
      )}
      {step === 3 && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 32 + keyboardHeight,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            // extra inset for iOS so the bottom is always reachable
            contentInset={{ bottom: keyboardHeight }}
          >
            <Text className="text-lg font-semibold mb-2">Add details</Text>
            <MetadataForm
              name={meta.name}
              description={meta.description}
              onChange={(d) => {
                setMeta(d);
                setErrors({});
              }}
              errorName={errors.name}
            />
            <Pressable
              disabled={isPending || saving}
              onPress={onTrim}
              className="mt-6 bg-green-600 px-6 py-3 rounded-md self-end opacity-100"
            >
              <Text className="text-white font-semibold">Save clip</Text>
            </Pressable>
          </ScrollView>
          {(isPending || saving) && (
            <View
              pointerEvents="auto"
              className="absolute inset-0 bg-white/70 items-center justify-center"
              style={{ zIndex: 50 }}
            >
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="mt-2 text-gray-800 font-semibold">Saving…</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
