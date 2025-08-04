import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import React from "react";

interface DashboardCriticalErrorProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function DashboardCriticalError({
  title,
  description,
  onRetry,
}: DashboardCriticalErrorProps) {
  return (
    <div className="flex items-center justify-center h-full p-4">
      <Alert variant="destructive" className="max-w-md w-full">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {description}
          {onRetry && (
            <div className="mt-4">
              <Button onClick={onRetry}>Retry</Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
