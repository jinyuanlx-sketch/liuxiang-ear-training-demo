"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Ear, Home, Mic2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoModeBanner } from "@/components/layout/demo-mode-banner";

const navItems = [
  { href: "/dashboard", label: "首页", icon: Home },
  { href: "/sight-singing", label: "视唱", icon: Mic2 },
  { href: "/ear-training", label: "练耳", icon: Ear },
  { href: "/theory", label: "乐理", icon: BookOpen },
  { href: "/profile", label: "我的", icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-svh pb-24">
      <header className="sticky top-0 z-30 border-b border-ivory/10 bg-ink-950/80 backdrop-blur-xl">
        <DemoModeBanner />
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="min-w-0">
            <div className="font-serif text-lg font-semibold text-ivory">流响音乐</div>
            <div className="text-xs text-muted">视唱练耳训练系统</div>
          </Link>
          <Link
            href="/teacher"
            className="rounded-md border border-ivory/10 px-3 py-2 text-xs text-muted transition hover:bg-ivory/10 hover:text-ivory"
          >
            老师端
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/10 bg-ink-950/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-5xl grid-cols-5 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-xs transition",
                  isActive ? "bg-ivory/10 text-ivory" : "text-muted hover:bg-ivory/10"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
