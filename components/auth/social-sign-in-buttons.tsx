"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialSignInButtonsProps {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SocialSignInButtons({
  isLoading,
  setIsLoading: _setIsLoading, // Renamed to _setIsLoading to satisfy ESLint's no-unused-vars rule
}: SocialSignInButtonsProps) {
  return (
    <div className="space-y-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Continue with GitHub
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming soon</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Continue with Google
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Coming soon</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
