import { VideoListItem } from "@components/VideoListItem";
import { Ionicons } from "@expo/vector-icons";
import { useVideoStore } from "@store/useVideoStore";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const items = useVideoStore((s) => s.items);
  const sorted = useMemo(() => [...items].sort((a, b) => b.createdAt - a.createdAt), [items]);
  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          title: "Video Diary",
          headerRight: () => (
            <Pressable onPress={() => router.push({ pathname: "/modals/crop" })} className="px-2 py-1">
              <Ionicons name="add" size={24} color="#2563eb" />
            </Pressable>
          ),
        }}
      />
      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingBottom: 100, flexGrow: sorted.length === 0 ? 1 : 0 }}
        renderItem={({ item }) => (
          <VideoListItem
            item={item}
            onPress={() => router.push({ pathname: "/videos/[id]", params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-lg font-semibold mb-2">Henüz bir klip yok</Text>
            <Text className="text-center text-gray-500 mb-4">
              Galeriden bir video seç, 5 saniyelik bir bölüm kırp ve burada görünsün.
            </Text>
            <Pressable onPress={() => router.push({ pathname: "/modals/crop" })} className="bg-blue-600 px-5 py-3 rounded-full">
              <Text className="text-white font-semibold">Yeni klip oluştur</Text>
            </Pressable>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: 16 }} />}
      />
      <Pressable
        onPress={() => router.push({ pathname: "/modals/crop" })}
        className="absolute right-5 bottom-8 bg-blue-600 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        accessibilityLabel="Yeni klip"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}
