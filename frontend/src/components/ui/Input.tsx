import clsx from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full resize-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
