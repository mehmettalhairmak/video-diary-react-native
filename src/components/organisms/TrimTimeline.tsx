import * as Haptics from "expo-haptics";
import * as VideoThumbnails from "expo-video-thumbnails";
import { Skeleton } from "moti/skeleton";
import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Dimensions, Image, LayoutChangeEvent, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

type Props = {
  uri: string;
  duration: number; // seconds
  fixedLength: number; // seconds
  start: number; // seconds
  onChangeStart: (s: number) => void;
  height?: number;
  frameCount?: number;
  onScrubStart?: () => void;
  onScrubEnd?: (s: number) => void;
  onThumbsLoadingChange?: (loading: boolean) => void;
};

export const TrimTimeline: React.FC<Props> = ({
  uri,
  duration,
  fixedLength,
  start,
  onChangeStart,
  height = 84,
  frameCount = 12,
  onScrubStart,
  onScrubEnd,
  onThumbsLoadingChange,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [count, setCount] = useState(() =>
    Math.max(6, Math.min(24, Math.round(frameCount)))
  );
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  // Use a fallback width so things render even if onLayout hasn't run yet (e.g., inside ScrollView)
  const fallbackWidth = useMemo(
    () => Math.max(1, Dimensions.get("window").width - 32),
    []
  );

  const widthUsed = containerWidth > 0 ? containerWidth : fallbackWidth;

  const pxPerSec = useMemo(
    () => (duration > 0 && widthUsed > 0 ? widthUsed / duration : 0),
    [duration, widthUsed]
  );

  const selectionWidth = useMemo(
    () => Math.max(0, Math.min(widthUsed, fixedLength * pxPerSec)),
    [fixedLength, pxPerSec, widthUsed]
  );

  const maxX = useMemo(
    () => Math.max(0, widthUsed - selectionWidth),
    [widthUsed, selectionWidth]
  );

  // Reanimated shared value for selection left X
  const x = useSharedValue(0);
  const pxPerSecSV = useSharedValue(0);
  const maxXSV = useSharedValue(0);
  const widthSV = useSharedValue(0);
  const selectionWidthSV = useSharedValue(0);

  useEffect(() => {
    // Reflect external start changes
    if (pxPerSec > 0) x.value = Math.max(0, Math.min(maxX, start * pxPerSec));
  }, [start, pxPerSec, maxX, x]);

  // Notify parent when thumbnail loading state changes
  useEffect(() => {
    onThumbsLoadingChange?.(loading);
  }, [loading, onThumbsLoadingChange]);

  // keep shared values in sync for worklets
  useEffect(() => {
    pxPerSecSV.value = pxPerSec;
  }, [pxPerSec]);
  useEffect(() => {
    maxXSV.value = maxX;
  }, [maxX]);
  useEffect(() => {
    widthSV.value = widthUsed;
  }, [widthUsed]);
  useEffect(() => {
    selectionWidthSV.value = selectionWidth;
  }, [selectionWidth]);

  useLayoutEffect(() => {
    let cancelled = false;
    // Generate a small set of thumbnails across the duration
    const gen = async () => {
      try {
        setLoading(true);
        const c = Math.max(4, Math.min(32, count));
        const times = Array.from(
          { length: c },
          (_, i) => ((i + 0.5) / c) * duration
        );
        const results: string[] = [];
        for (const t of times) {
          const ms = Math.max(0, Math.round(t * 1000)); // Int64 (ms) expected by native
          const { uri: thumbUri } = await VideoThumbnails.getThumbnailAsync(
            uri,
            {
              time: ms,
              quality: 0.4,
            }
          );
          if (cancelled) return;

          results.push(thumbUri);
        }
        if (!cancelled) {
          setThumbs(results);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to generate thumbnails", e);
          setThumbs([]);
          setLoading(false);
        }
      }
    };
    gen();
    return () => {
      cancelled = true;
    };
  }, [uri, duration, count]);

  const jsHaptic = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
  };

  // Pinch to change frame density
  const base = useSharedValue(1);
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      base.value = e.scale;
    })
    .onEnd(() => {
      const scale = Math.max(0.5, Math.min(2, base.value));
      const next = Math.round(Math.max(6, Math.min(32, frameCount * scale)));
      runOnJS(setCount)(next);
      runOnJS(jsHaptic)();
      base.value = 1;
    });

  // Drag to move the fixed-length selection
  const dragStart = useSharedValue(0);
  const pan = Gesture.Pan()
    .onBegin(() => {
      dragStart.value = x.value;
      if (onScrubStart) runOnJS(onScrubStart)();
    })
    .onUpdate((e) => {
      const next = Math.max(
        0,
        Math.min(maxXSV.value, dragStart.value + e.translationX)
      );
      x.value = next;
      if (pxPerSecSV.value > 0 && onChangeStart) {
        runOnJS(onChangeStart)(next / pxPerSecSV.value);
      }
    })
    .onEnd(() => {
      if (onScrubEnd && pxPerSecSV.value > 0) {
        runOnJS(onScrubEnd)(x.value / pxPerSecSV.value);
      }
      runOnJS(jsHaptic)();
    });

  const composedGesture = Gesture.Simultaneous(pinch, pan);

  const formatTime = (sec: number) => {
    const s = Math.max(0, sec || 0);
    const minutes = Math.floor(s / 60);
    const seconds = Math.floor(s % 60);
    const millis = Math.round((s - Math.floor(s)) * 1000);
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    const mmm = String(millis).padStart(3, "0");
    return `${mm}:${ss}.${mmm}`;
  };

  const leftShadeStyle = useAnimatedStyle(() => ({
    width: x.value,
  }));
  const rightShadeStyle = useAnimatedStyle(() => ({
    left: x.value + selectionWidthSV.value,
    width: Math.max(0, widthSV.value - (x.value + selectionWidthSV.value)),
  }));

  const timelineHeight = Math.max(36, height - 24); // leave space for labels
  const itemWidth = count > 0 ? widthUsed / count : 0;
  const selectionEnd = Math.min(duration, start + fixedLength);

  return (
    <GestureDetector gesture={composedGesture}>
      <View onLayout={onLayout} className="w-full">
        {loading ? (
          <Skeleton.Group show>
            <View>
              {/* Top scale marks skeleton */}
              <View className="mb-1 flex-row justify-between">
                <Skeleton width={64} height={14} radius={4} colorMode="light" />
                <Skeleton width={64} height={14} radius={4} colorMode="light" />
              </View>

              {/* Timeline strip skeleton */}
              <View className="mt-[100px]">
                <Skeleton
                  width={widthUsed}
                  height={timelineHeight}
                  radius={8}
                  colorMode="light"
                />
              </View>

              {/* Bottom labels skeleton */}
              <View
                style={{ width: widthUsed }}
                className="flex-row justify-between mt-1.5"
              >
                <Skeleton width={64} height={14} radius={4} colorMode="light" />
                <Skeleton width={64} height={14} radius={4} colorMode="light" />
              </View>
            </View>
          </Skeleton.Group>
        ) : (
          <>
            {/* Top scale marks */}
            <View
              style={{ width: widthUsed }}
              className="flex-row justify-between"
            >
              <Text className="text-[10px] text-gray-400">{formatTime(0)}</Text>
              <Text className="text-[10px] text-gray-400">
                {formatTime(duration)}
              </Text>
            </View>

            {/* Timeline strip */}
            <View
              style={{ height: timelineHeight }}
              className="relative w-full overflow-hidden mt-[100px] mb-2.5 rounded-md bg-black/20"
              pointerEvents="box-none"
            >
              {/* Thumbnails */}
              <View className="absolute inset-0" pointerEvents="none">
                <View
                  style={{
                    width: widthUsed,
                    height: timelineHeight,
                  }}
                  className="flex-row"
                >
                  {thumbs.length > 0
                    ? thumbs.map((u, i) => (
                        <Image
                          key={`${u}-${i}`}
                          source={{ uri: u }}
                          style={{
                            width: itemWidth,
                            height: timelineHeight,
                          }}
                          resizeMode="cover"
                        />
                      ))
                    : Array.from({ length: count }).map((_, i) => (
                        <View
                          key={`ph-${i}`}
                          style={{ width: itemWidth, height: timelineHeight }}
                          className="bg-gray-800"
                        />
                      ))}
                </View>
              </View>

              {/* Shaded regions */}
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    borderRightColor: "orange",
                    borderRightWidth: 4,
                  },
                  leftShadeStyle,
                ]}
              />
              <Animated.View
                pointerEvents="none"
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    borderLeftColor: "orange",
                    borderLeftWidth: 4,
                  },
                  rightShadeStyle,
                ]}
              />
            </View>

            {/* Bottom labels: selection start/end */}
            <View
              style={{
                width: widthUsed,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text className="text-[11px] text-gray-300">
                {formatTime(start)}
              </Text>
              <Text className="text-[11px] text-gray-300">
                {formatTime(Math.min(duration, start + fixedLength))}
              </Text>
            </View>
          </>
        )}
      </View>
    </GestureDetector>
  );
};

export default TrimTimeline;
