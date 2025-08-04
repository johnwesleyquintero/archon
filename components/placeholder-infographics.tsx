"use client";

import { EmptyState } from "@/components/empty-state";

export function PlaceholderInfographics({
  title = "Feature Coming Soon",
  description = "This component is currently under development and will be available in a future update.",
}: PlaceholderInfographicsProps) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <EmptyState title={title} description={description} />
    </div>
  );
}

export interface PlaceholderInfographicsProps extends Record<string, unknown> {
  title?: string;
  description?: string;
}
