"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  disabled?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  disabled,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
      <PlusCircle className="h-12 w-12 mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          disabled={disabled}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
