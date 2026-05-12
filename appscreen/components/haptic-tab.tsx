import * as Haptics from "expo-haptics";
import React from "react";
import { GestureResponderEvent, TouchableOpacity } from "react-native";

interface HapticTabProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  [key: string]: any;
}

export default function HapticTab(props: HapticTabProps) {
  const { children, onPress, ...restProps } = props;

  return (
    <TouchableOpacity
      {...restProps}
      onPress={(event: GestureResponderEvent) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) {
          onPress(event);
        }
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
