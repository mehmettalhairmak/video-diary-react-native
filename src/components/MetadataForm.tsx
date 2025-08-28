import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

export type MetadataFormProps = {
  name: string;
  description: string;
  onChange: (data: { name: string; description: string }) => void;
  errorName?: string;
  errorDescription?: string;
  disabled?: boolean;
  maxNameLength?: number;
  maxDescriptionLength?: number;
};

export const MetadataForm: React.FC<MetadataFormProps> = ({
  name,
  description,
  onChange,
  errorName,
  errorDescription,
  disabled,
  maxNameLength = 60,
  maxDescriptionLength = 280,
}) => {
  const [focus, setFocus] = useState<"name" | "desc" | null>(null);

  const nameCountColor = useMemo(() => {
    const ratio = name.length / maxNameLength;
    return ratio > 0.9
      ? "text-red-500"
      : ratio > 0.75
        ? "text-amber-500"
        : "text-gray-400";
  }, [name, maxNameLength]);

  const descCountColor = useMemo(() => {
    const ratio = description.length / maxDescriptionLength;
    return ratio > 0.9
      ? "text-red-500"
      : ratio > 0.75
        ? "text-amber-500"
        : "text-gray-400";
  }, [description, maxDescriptionLength]);

  return (
    <View className="rounded-2xl border-gray-100 bg-white shadow-sm p-4">
      {/* Name */}
      <View className="mb-3">
        <Text className="text-sm font-medium text-gray-700 mb-2">Name</Text>
        <View
          className={`flex-row items-center border rounded-md px-3  ${
            focus === "name"
              ? "border-blue-500 bg-white"
              : errorName
                ? "border-red-500 bg-white"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <Ionicons
            name="pricetag-outline"
            size={18}
            color={
              errorName ? "#ef4444" : focus === "name" ? "#3b82f6" : "#9ca3af"
            }
            style={{ marginRight: 8, paddingLeft: 3 }}
          />
          <TextInput
            className="flex-1 py-3"
            placeholder="Give it a name"
            placeholderTextColor="#9ca3af"
            value={name}
            maxLength={maxNameLength}
            onFocus={() => setFocus("name")}
            onBlur={() =>
              setFocus((f: "name" | "desc" | null) => (f === "name" ? null : f))
            }
            editable={!disabled}
            returnKeyType="next"
            onChangeText={(t) => onChange({ name: t, description })}
          />
        </View>
        <View className="mt-1 flex-row items-center justify-between">
          {errorName ? (
            <Text className="text-xs text-red-600">{errorName}</Text>
          ) : (
            <View />
          )}
          <Text className={`text-[10px] ${nameCountColor}`}>
            {name.length}/{maxNameLength}
          </Text>
        </View>
      </View>

      {/* Description */}
      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Description
        </Text>
        <View
          className={`flex-row items-start border rounded-md px-3 ${
            focus === "desc"
              ? "border-blue-500 bg-white"
              : errorDescription
                ? "border-red-500 bg-white"
                : "border-gray-200 bg-gray-50"
          }`}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={
              errorDescription
                ? "#ef4444"
                : focus === "desc"
                  ? "#3b82f6"
                  : "#9ca3af"
            }
            style={{ marginRight: 8, marginTop: 12, paddingLeft: 3 }}
          />
          <TextInput
            className="flex-1 py-3"
            placeholder="Describe this clip"
            placeholderTextColor="#9ca3af"
            value={description}
            maxLength={maxDescriptionLength}
            onFocus={() => setFocus("desc")}
            onBlur={() =>
              setFocus((f: "name" | "desc" | null) => (f === "desc" ? null : f))
            }
            editable={!disabled}
            onChangeText={(t) => onChange({ name, description: t })}
            multiline
            textAlignVertical="top"
            returnKeyType="done"
            style={{ minHeight: 250, height: 250 }}
          />
        </View>
        <View className="mt-1 flex-row items-center justify-between">
          {errorDescription ? (
            <Text className="text-xs text-red-600">{errorDescription}</Text>
          ) : (
            <Text className="text-xs text-gray-400">Optional</Text>
          )}
          <Text className={`text-[10px] ${descCountColor}`}>
            {description.length}/{maxDescriptionLength}
          </Text>
        </View>
      </View>
    </View>
  );
};
