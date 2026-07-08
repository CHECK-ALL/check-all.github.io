import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "🎮 Game Picker — UMB & AGS",
  description: "Выбираем во что поиграть вместе",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
