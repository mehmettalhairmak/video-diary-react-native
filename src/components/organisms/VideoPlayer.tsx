import { VideoView, useVideoPlayer } from "expo-video";
import React from "react";
import { View } from "react-native";

export type VideoPlayerProps = {
  uri: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  className,
  autoPlay = false,
  loop = false,
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = loop;
    if (autoPlay) player.play();
  });

  return (
    <View className={className}>
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};
