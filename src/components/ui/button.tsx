import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[#06264a] text-white hover:bg-[#0a3869]",
        variant === "secondary" &&
          "border border-[#b77a16] bg-white text-[#06264a] hover:bg-[#f7ead0]",
        variant === "ghost" &&
          "bg-transparent text-[#06264a] hover:bg-[#f3f4f6]",
        variant === "danger" && "bg-[#b42318] text-white hover:bg-[#8f1c14]",
        className,
      )}
      {...props}
    />
  );
}
