import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { Button, ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CopyButtonProps extends ButtonProps {
  value: string;
  copyLabel?: string;
  copiedLabel?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  copyLabel = "Copy",
  copiedLabel = "Copied!",
  className,
  variant = "ghost",
  size = "sm",
  ...props
}) => {
  const [hasCopied, setHasCopied] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setHasCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The content has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleCopy}
      className={className}
      variant={variant}
      size={size}
      {...props}
    >
      {hasCopied ? (
        <CheckIcon className="mr-2 h-4 w-4" />
      ) : (
        <CopyIcon className="mr-2 h-4 w-4" />
      )}
      {hasCopied ? copiedLabel : copyLabel}
    </Button>
  );
};