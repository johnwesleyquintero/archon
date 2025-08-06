"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormFeedback } from "@/hooks/use-form-feedback";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: () => void;
};

export function SubmitButton({
  children,
  pendingText,
  successMessage,
  errorMessage,
  onSuccess,
  onError,
  ...props
}: Props) {
  const { pending } = useFormStatus();
  const { showSuccessToast, showErrorToast } = useFormFeedback();

  React.useEffect(() => {
    if (!pending) {
      // Form submission has completed
      if (successMessage) {
        showSuccessToast(successMessage);
        onSuccess?.();
      } else if (errorMessage) {
        showErrorToast(errorMessage);
        onError?.();
      }
    }
  }, [
    pending,
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    showSuccessToast,
    showErrorToast,
  ]);

  return (
    <Button {...props} type="submit" disabled={pending || props.disabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
