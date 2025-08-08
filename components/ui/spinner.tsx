import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };
  return (
    <Loader2
      className={cn(
        "animate-spin text-slate-500",
        sizeClasses[size],
        className,
      )}
      role="status" // Add ARIA role
      aria-label="Loading..." // Add ARIA label
    />
  );
}
