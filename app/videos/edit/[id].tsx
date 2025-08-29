import { MetadataForm } from "@components";
import { useVideoStore } from "@store/useVideoStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function EditVideo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useVideoStore((s) => s.items.find((i) => i.id === id));
  const updateMeta = useVideoStore((s) => s.updateMeta);
  const router = useRouter();
  const [form, setForm] = useState({
    name: item?.name ?? "",
    description: item?.description ?? "",
  });

  if (!item) return <Text>Not found</Text>;

  const onSave = () => {
    if (!form.name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }
    updateMeta(item.id, {
      name: form.name.trim(),
      description: form.description,
    });
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ title: "Edit details" }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        contentContainerStyle={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        enabled={true}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Platform.OS === "android" ? 100 : 32,
          }}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
          showsVerticalScrollIndicator={true}
        >
          <MetadataForm
            name={form.name}
            description={form.description}
            onChange={setForm}
          />
          <Pressable
            onPress={onSave}
            className="mt-6 bg-blue-600 px-6 py-3 rounded-md self-end"
          >
            <Text className="text-white font-semibold">Save</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
