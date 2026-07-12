"use client";

import { hasSupabaseEnv } from "@/lib/supabase/client";

export function DemoModeBanner() {
  if (hasSupabaseEnv()) {
    return null;
  }

  return (
    <div className="border-b border-brass/20 bg-brass/10 px-4 py-2 text-center text-xs text-brass">
      Demo 模式 / 内部测试版：当前使用本地 mock data，仅用于产品体验测试。配置 Supabase 环境变量后可切换真实数据。
    </div>
  );
}
