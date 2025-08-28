import { VideoPlayer } from '@components/VideoPlayer';
import { useVideoStore } from '@store/useVideoStore';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function VideoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useVideoStore((s) => s.items.find((i) => i.id === id));

  if (!item) return <Text>Not found</Text>;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: item.name }} />
      <VideoPlayer uri={item.uri} className="w-full h-64 bg-black" autoPlay />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-xl font-bold mb-2">{item.name}</Text>
        {item.description ? (
          <Text className="text-base text-gray-700">{item.description}</Text>
        ) : (
          <Text className="text-base text-gray-400">No description</Text>
        )}
        <Link href={{ pathname: '/videos/edit/[id]', params: { id: item.id } }} asChild>
          <Text className="text-blue-600 mt-6">Edit details</Text>
        </Link>
      </ScrollView>
    </View>
  );
}
