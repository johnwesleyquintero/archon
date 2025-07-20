"use client";

import { useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { goalSchema } from "@/lib/validators";
import type { z } from "zod";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: z.infer<typeof goalSchema>) => Promise<void>;
  isSaving: boolean;
}

type GoalFormValues = z.infer<typeof goalSchema>;

export function CreateGoalModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: CreateGoalModalProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      target_date: undefined,
      status: "pending",
      attachments: [],
    },
    mode: "onBlur", // Enable real-time validation on blur
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(); // Reset form when modal opens
    }
  }, [isOpen, form]);

  const handleSave = form.handleSubmit(async (data) => {
    await onSave(data);
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Goal"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleSave()}
            disabled={!form.formState.isValid || isSaving}
            className="bg-slate-900 hover:bg-slate-800"
          >
            {isSaving ? (
              <span className="flex items-center">
                <Spinner className="mr-2 h-4 w-4" /> Saving...
              </span>
            ) : (
              "Save Goal"
            )}
          </Button>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={void handleSave} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Goal Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your goal title"
                    className="h-10"
                    disabled={isSaving}
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your goal in detail..."
                    className="min-h-[100px] resize-none"
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-slate-500">
                  Optional: Add more details about your goal and how you plan to
                  achieve it.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isSaving}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date?.toISOString(), {
                          shouldValidate: true,
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
