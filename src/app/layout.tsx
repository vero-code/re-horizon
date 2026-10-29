import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Re:Horizon | Cultural Sanctuary Agent",
  description:
    "Sensory decompression and cross-domain cultural restoration agent for individuals in spatial or convalescent isolation, powered by Qloo Taste Graph v2 and Google Gemini.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950 font-sans text-base text-zinc-100">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}