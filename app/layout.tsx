import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "thoughtstream",
  description: "Raw thoughts. Nothing else.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body className="bg-[#0a0a0a] text-[#e0e0e0] font-[family-name:var(--font-mono)] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
