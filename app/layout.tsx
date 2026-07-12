import type { Metadata, Viewport } from "next";
import { DemoAccessGate } from "@/components/layout/demo-access-gate";
import "./globals.css";

export const metadata: Metadata = {
  title: "流响音乐 · 视唱练耳训练系统",
  description: "面向音乐艺考学生的视唱练耳训练、自动反馈与老师诊断系统。",
  applicationName: "流响音乐",
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/app-icon.svg",
    apple: "/brand/app-icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "流响音乐",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07080b"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <DemoAccessGate>{children}</DemoAccessGate>
      </body>
    </html>
  );
}
