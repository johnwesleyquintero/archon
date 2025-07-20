"use client";

import * as React from "react";
import { OTPInput, type OTPInputProps } from "input-otp";
import { Minus } from "lucide-react";

import { cn } from "@/lib/utils";

// Define a type for OTPInput that includes the static Slot component
interface CustomOTPInput
  extends React.ForwardRefExoticComponent<
    OTPInputProps & React.RefAttributes<HTMLInputElement>
  > {
  Slot: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<"div"> & { index: number }
  >;
}

// Cast OTPInput to the custom type
const TypedOTPInput = OTPInput as CustomOTPInput;

const InputOTP = React.forwardRef<
  React.ElementRef<typeof TypedOTPInput>,
  OTPInputProps
>(({ className, containerClassName, ...props }, ref) => (
  <TypedOTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  disabled?: boolean;
}

const InputOTPSlot = ({ index, className, ...props }: InputOTPSlotProps) => (
  <TypedOTPInput.Slot
    index={index}
    className={cn(
      "relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
      "focus:z-10 focus:border-primary focus:ring-offset-background",
      className,
    )}
    {...props}
  />
);
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
