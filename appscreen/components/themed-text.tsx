// Themed Text Component

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ThemedTextProps {
  children: React.ReactNode;
  style?: any;
  lightColor?: string;
  darkColor?: string;
}

export function ThemedText({
  children,
  style,
  lightColor,
  darkColor,
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = lightColor ?? darkColor ?? Colors[colorScheme ?? 'light'].text;

  return (
    <Text style={[{ color }, style]}>
      {children}
    </Text>
  );
}
