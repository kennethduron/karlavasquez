import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "min-h-11 w-full rounded-md border border-[#d5dae1] bg-white px-3 py-2 text-base text-[#031b36] placeholder:text-[#6b7280] focus:border-[#b77a16] disabled:cursor-not-allowed disabled:bg-[#f3f4f6] sm:text-sm",
        className,
      )}
      {...props}
    />
  );
});
