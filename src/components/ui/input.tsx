import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-surface px-4 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
