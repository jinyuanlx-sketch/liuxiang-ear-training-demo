"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasSupabaseEnv()) {
      setMessage("当前是本地原型模式：配置 Supabase 后即可启用真实登录。");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm text-muted">邮箱</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          placeholder="student@liuxiang.example"
          className="h-12 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none transition placeholder:text-muted/60 focus:border-brass/70"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm text-muted">密码</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          placeholder="输入密码"
          className="h-12 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none transition placeholder:text-muted/60 focus:border-brass/70"
        />
      </label>

      {message ? (
        <div className="rounded-md border border-brass/25 bg-brass/10 px-3 py-2 text-sm text-brass">
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        icon={<LogIn className="h-4 w-4" />}
        disabled={isLoading}
      >
        {isLoading ? "登录中" : "登录"}
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
          学生演示
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/teacher")}>
          老师演示
        </Button>
      </div>
    </form>
  );
}
