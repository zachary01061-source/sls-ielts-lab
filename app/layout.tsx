import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLS 学习平台",
  description: "育木成林，爱国荣校。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
