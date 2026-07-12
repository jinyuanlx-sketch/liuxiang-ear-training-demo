import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "流响音乐 · 视唱练耳训练系统",
    short_name: "流响音乐",
    description: "面向音乐艺考学生的视唱练耳训练与老师诊断系统。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#07080b",
    theme_color: "#07080b",
    lang: "zh-CN",
    categories: ["education", "music"],
    icons: [
      {
        src: "/brand/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/brand/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
