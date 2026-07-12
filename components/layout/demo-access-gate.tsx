"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCESS_STORAGE_KEY = "liuxiang.demo_access_password.v1";

function isAccessEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
}

function getAccessPassword() {
  return process.env.NEXT_PUBLIC_DEMO_ACCESS_PASSWORD?.trim() ?? "";
}

export function DemoAccessGate({ children }: { children: React.ReactNode }) {
  const password = getAccessPassword();
  const enabled = isAccessEnabled() && password.length > 0;
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [granted, setGranted] = useState(!enabled);
  const helperText = useMemo(() => {
    if (!enabled) {
      return null;
    }

    return "这个功能只是内部测试门禁，不是正式用户登录系统。";
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setGranted(true);
      return;
    }

    setGranted(window.localStorage.getItem(ACCESS_STORAGE_KEY) === password);
  }, [enabled, password]);

  if (!enabled || granted) {
    return <>{children}</>;
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (inputValue.trim() !== password) {
      setError("访问密码不正确。");
      return;
    }

    window.localStorage.setItem(ACCESS_STORAGE_KEY, password);
    setGranted(true);
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-8">
      <section className="liuxiang-panel w-full max-w-md rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-brass/25 bg-brass/10 text-brass">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ivory">流响音乐 · 内部测试版</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              当前系统仅用于内部产品体验测试，请输入访问密码继续。
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-3" onSubmit={submitPassword}>
          <label className="block space-y-2">
            <span className="text-sm text-muted">访问密码</span>
            <input
              type="password"
              value={inputValue}
              onChange={(event) => {
                setInputValue(event.target.value);
                setError(null);
              }}
              className="h-12 w-full rounded-md border border-ivory/10 bg-ink-950/70 px-3 text-sm text-ivory outline-none placeholder:text-muted/60 focus:border-brass/70"
              placeholder="请输入内部测试密码"
            />
          </label>

          {error ? (
            <div className="rounded-md border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <Button type="submit" variant="primary" className="w-full">
            进入 Demo
          </Button>
        </form>

        {helperText ? (
          <p className="mt-4 rounded-md border border-ivory/10 bg-ivory/5 p-3 text-xs leading-5 text-muted">
            {helperText}
          </p>
        ) : null}
      </section>
    </main>
  );
}
