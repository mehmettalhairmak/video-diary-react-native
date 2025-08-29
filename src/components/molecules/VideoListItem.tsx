import { VideoItem } from "@types";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

export const VideoListItem = ({
  item,
  onPress,
}: {
  item: VideoItem;
  onPress: () => void;
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 p-3 border-b border-gray-200"
    >
      {item.thumbUri ? (
        <Image
          source={{ uri: item.thumbUri }}
          className="w-20 h-12 rounded bg-gray-100"
          resizeMode="contain"
        />
      ) : (
        <View className="w-20 h-12 bg-gray-200 rounded" />
      )}
      <View className="flex-1">
        <Text className="text-base font-semibold" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-xs text-gray-500" numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <Text className="text-xs text-gray-500">
        {Math.round(item.duration)}s
      </Text>
    </Pressable>
  );
};
