import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "disabled";
  className?: string;
}) {
  const tones = {
    neutral: "border-ivory/10 bg-ivory/10 text-ivory",
    success: "border-jade/30 bg-jade/10 text-jade",
    warning: "border-brass/30 bg-brass/10 text-brass",
    disabled: "border-muted/20 bg-muted/10 text-muted"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
