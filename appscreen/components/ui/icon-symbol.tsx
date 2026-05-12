import { Ionicons } from "@expo/vector-icons";
import React from "react";

interface IconSymbolProps {
  size: number;
  name: string;
  color: string;
}

export default function IconSymbol({ size, name, color }: IconSymbolProps) {
  // Map SF Symbol names to Ionicons names
  const getIconName = (sfName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      "house.fill": "home",
      "gearshape.fill": "settings",
      "paperplane.fill": "send",
      "wrench.fill": "build",
    };
    return iconMap[sfName] || ("home" as keyof typeof Ionicons.glyphMap);
  };

  return <Ionicons size={size} name={getIconName(name)} color={color} />;
}
