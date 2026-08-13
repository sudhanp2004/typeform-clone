export interface ThemeFont {
  key: string;
  label: string;
  family: string;
}

// A curated set rather than arbitrary Google Fonts: each is loaded at build time via
// next/font/google in app/layout.tsx (see THEME_FONT_VARIABLES there), so choosing one
// here never triggers a runtime font fetch or a flash of unstyled text.
export const THEME_FONTS: ThemeFont[] = [
  { key: "inter", label: "Inter", family: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" },
  { key: "poppins", label: "Poppins", family: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif" },
  { key: "lora", label: "Lora", family: "var(--font-lora), ui-serif, Georgia, serif" },
  { key: "playfair_display", label: "Playfair Display", family: "var(--font-playfair-display), ui-serif, Georgia, serif" },
  { key: "jetbrains_mono", label: "JetBrains Mono", family: "var(--font-jetbrains-mono), ui-monospace, monospace" },
];

export function resolveFontFamily(key: string | undefined): string {
  return THEME_FONTS.find((f) => f.key === key)?.family ?? THEME_FONTS[0].family;
}
