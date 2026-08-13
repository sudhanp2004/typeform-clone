import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const playfairDisplay = Playfair_Display({ variable: "--font-playfair-display", subsets: ["latin"], weight: ["400", "700"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

const THEME_FONT_VARIABLES = [
  inter.variable,
  lora.variable,
  poppins.variable,
  playfairDisplay.variable,
  jetbrainsMono.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Typeform Clone",
  description: "A conversational form builder — build forms, share a link, collect responses.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${THEME_FONT_VARIABLES} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
