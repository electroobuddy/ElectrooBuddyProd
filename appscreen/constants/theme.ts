type ColorScheme = "light" | "dark";

interface ColorTheme {
  tint: string;
  background: string;
  text: string;
}

export const Colors: Record<ColorScheme, ColorTheme> = {
  light: {
    tint: "#2563eb",
    background: "#ffffff",
    text: "#000000",
  },
  dark: {
    tint: "#60a5fa",
    background: "#0f0f1a",
    text: "#ffffff",
  },
};
