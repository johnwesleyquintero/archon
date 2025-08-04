"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SocialSignInButtons() {
  return (
    <div className="space-y-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-full">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={true}
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
              disabled={true}
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
