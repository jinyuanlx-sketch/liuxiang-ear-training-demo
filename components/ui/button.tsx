import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-brass/60 bg-brass text-ink-950 hover:bg-[#d7b56f] disabled:bg-brass/40",
  secondary:
    "border-ivory/10 bg-ivory/10 text-ivory hover:bg-ivory/20 disabled:text-muted",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-ivory/10 hover:text-ivory",
  danger:
    "border-red-300/30 bg-red-400/10 text-red-100 hover:bg-red-400/20 disabled:text-red-100/50"
};

export function Button({
  className,
  variant = "secondary",
  icon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
