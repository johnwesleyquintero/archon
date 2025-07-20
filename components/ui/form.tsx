"use client"

import * as React from "react"
import {
  FormProvider as RHFProvider,
  Controller,
  useFormContext,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form"

import { cn } from "@/lib/utils"

/* ---------- Provider ------------------------------------------------------ */

export const FormProvider = RHFProvider

/* ---------- FormField helper (shadcn-style) ------------------------------ */

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: keyof TFieldValues & string
  render: (methods: UseFormReturn<TFieldValues>) => React.ReactNode
}

export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  render,
}: FormFieldProps<TFieldValues>) {
  const methods = useFormContext<TFieldValues>()
  return <Controller control={methods.control} name={name} render={(ctx) => render({ ...methods, ...ctx })} />
}

/* ---------- Decorative wrappers ------------------------------------------ */

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />
}

export function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative", className)} {...props} />
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="text-xs text-destructive">{children}</p>
}

const Form = <TFieldValues extends FieldValues = FieldValues, TContext = object, TTransformedValues = TFieldValues>(
  props: React.ComponentProps<typeof RHFProvider<TFieldValues, TContext, TTransformedValues>>,
) => {
  return <RHFProvider {...props} />
}

type FormFieldContext<
  TFieldValues extends FieldValues = FieldValues,
  TName extends keyof TFieldValues & string = keyof TFieldValues & string,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContext>({} as FormFieldContext)

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField()

    return (
      <p ref={ref} id={formDescriptionId} className={cn("text-[0.8rem] text-muted-foreground", className)} {...props} />
    )
  },
)
FormDescription.displayName = "FormDescription"

export { useFormField, Form, FormDescription }
