import { useToast } from "@/components/ui/use-toast";

interface FormFeedbackOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useFormFeedback() {
  const { toast } = useToast();

  const showSuccessToast = (message?: string) => {
    toast({
      title: "Success!",
      description: message || "Operation completed successfully.",
      variant: "success",
    });
  };

  const showErrorToast = (message?: string) => {
    toast({
      title: "Error!",
      description: message || "An unexpected error occurred.",
      variant: "destructive",
    });
  };

  return {
    showSuccessToast,
    showErrorToast,
  };
}
