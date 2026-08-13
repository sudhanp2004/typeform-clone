import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-neutral-800 disabled:bg-neutral-300",
  secondary: "bg-white text-ink border border-line hover:border-ink disabled:opacity-50",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-paper-soft disabled:opacity-50",
  danger: "bg-white text-danger border border-danger/30 hover:bg-danger/5 disabled:opacity-50",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
