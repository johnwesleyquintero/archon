"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Save, Paperclip, ImageIcon, X, BrainCircuit, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/file-upload";
import { uploadFile } from "@/lib/blob";
import { analyzeJournalEntry } from "@/app/journal/actions";
import { Modal } from "@/components/ui/modal";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalEntrySchema } from "@/lib/validators";
import type { z } from "zod";
import type { Database } from "@/lib/supabase/types";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
import { useTasks } from "@/hooks/use-tasks";
import { useGoals } from "@/hooks/use-goals";

const TipTapEditor = dynamic(
  () => import("./quill-editor").then((mod) => mod.TipTapEditor),
  {
    ssr: false, // This component uses client-side hooks, so disable SSR
    loading: () => (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    ),
  },
);

type TipTapEditorRef = import("./quill-editor").TipTapEditorRef; // Re-export the type for local use

type Attachment = {
  url: string;
  filename: string;
  type: "image" | "document";
};

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalUpdate = Database["public"]["Tables"]["journal_entries"]["Update"];

interface JournalEditorProps {
  entry: JournalEntry | null;
  onSaveEntry: () => void;
  hasUnsavedChanges: boolean;
  updateEntry: (
    id: string,
    patch: JournalUpdate,
  ) => Promise<JournalEntry | null>;
  isMutating?: boolean;
}

type JournalFormValues = z.infer<typeof journalEntrySchema>;

export function JournalEditorWithAttachments({
  entry,
  onSaveEntry,
  hasUnsavedChanges,
  updateEntry,
  isMutating = false,
}: JournalEditorProps) {
  const editorRef = useRef<TipTapEditorRef>(null);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const handleAnalyze = async () => {
    if (!entry?.content) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeJournalEntry(entry.content);
      if (result && typeof result === "object" && "error" in result) {
        console.error("Analysis failed:", result.error);
        // Optionally, show a toast notification to the user
      } else {
        setAnalysisResult(result);
        setIsAnalysisModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to analyze entry:", error);
      // You might want to show a toast notification here
    } finally {
      setIsAnalyzing(false);
    }
  };

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      attachments: [],
      tags: [],
      associated_tasks: [],
      associated_goals: [],
    },
    mode: "onBlur",
  });

  // Helper function to convert a URL string to an Attachment object
  const createAttachmentFromUrl = (url: string): Attachment => {
    const fileExtension = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    const type: "image" | "document" = ["jpeg", "jpg", "gif", "png"].includes(
      fileExtension,
    )
      ? "image"
      : "document";
    return {
      url,
      filename: url.substring(url.lastIndexOf("/") + 1),
      type,
    };
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!entry) return { success: false };

      try {
        const result = await uploadFile(file, `journal/${entry.id}`);

        if (result.success) {
          const fileType: "image" | "document" = file.type.startsWith("image/")
            ? "image"
            : "document";

          const currentAttachments = form.getValues("attachments") || [];
          const newAttachment: Attachment = {
            url: result.url,
            filename: file.name,
            type: fileType,
          };
          const updatedAttachments: Attachment[] = [
            ...(currentAttachments || []),
            newAttachment,
          ];
          form.setValue("attachments", updatedAttachments, {
            shouldDirty: true,
            shouldValidate: true,
          });

          await updateEntry(entry.id, {
            attachments: updatedAttachments.map((att: Attachment) => att.url),
          });

          // Insert image directly into TipTap editor if it's an image
          if (fileType === "image" && editorRef.current?.commands) {
            editorRef.current.commands.insertContent(
              `<img src="${result.url}" alt="${newAttachment.filename}" />`,
            );
          } else if (editorRef.current?.commands) {
            // For other file types, insert a link
            editorRef.current.commands.insertContent(
              `<a href="${newAttachment.url}" target="_blank" rel="noopener noreferrer">${newAttachment.filename}</a>`,
            );
          }

          return { url: result.url, success: true };
        }

        return { success: false };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Error uploading file:", error);
        return {
          success: false,
          error: new Error(errorMessage),
        };
      }
    },
    [entry, form, updateEntry, editorRef],
  );

  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        content: entry.content || "",
        attachments: Array.isArray(entry.attachments)
          ? entry.attachments
              .filter((att): att is string => typeof att === "string")
              .map(createAttachmentFromUrl)
          : [],
        tags: entry.tags || [],
        associated_tasks: entry.associated_tasks || [],
        associated_goals: entry.associated_goals || [],
      });
    } else {
      form.reset({
        title: "",
        content: "",
        attachments: [],
        tags: [],
      });
    }
  }, [entry, form]);

  const handleQuillChange = (newContent: string) => {
    form.setValue("content", newContent, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeAttachment = (url: string) => {
    if (!entry) return;

    const currentAttachments = form.getValues("attachments") || [];
    const updatedAttachments = currentAttachments.filter(
      (attachment: Attachment) => attachment.url !== url,
    );
    form.setValue("attachments", updatedAttachments, {
      shouldDirty: true,
      shouldValidate: true,
    });
    void updateEntry(entry.id, {
      attachments: updatedAttachments.map((att: Attachment) => att.url),
    });

    // In a real app, you might want to also delete the file from blob storage
    // await deleteFile(url);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() !== "") {
      const newTags = [...(form.getValues("tags") || []), tagInput.trim()];
      form.setValue("tags", newTags, {
        shouldDirty: true,
        shouldValidate: true,
      });
      if (entry) {
        void updateEntry(entry.id, { tags: newTags });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = (form.getValues("tags") || []).filter(
      (tag) => tag !== tagToRemove,
    );
    form.setValue("tags", newTags, { shouldDirty: true, shouldValidate: true });
    if (entry) {
      void updateEntry(entry.id, { tags: newTags });
    }
  };

  if (!entry) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-sm font-medium">
            Select an entry to start writing
          </p>
          <p className="text-xs mt-1">
            Choose from your journal entries or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Entry title..."
                        className="text-lg font-semibold border-0 px-0 shadow-none focus-visible:ring-0 placeholder:text-slate-400"
                        disabled={isMutating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs text-slate-500 mt-1">
                {entry && formatDate(entry.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isMutating && (
                <span className="text-xs text-slate-500 flex items-center">
                  <Spinner size="sm" className="mr-1" /> Saving...
                </span>
              )}
              <Button
                onClick={onSaveEntry}
                size="sm"
                disabled={!hasUnsavedChanges || isMutating}
                className={cn(
                  "transition-all duration-200",
                  hasUnsavedChanges
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed",
                )}
              >
                <Save className="h-4 w-4 mr-1" />
                {hasUnsavedChanges ? "Save" : "Saved"}
              </Button>
              <Button
                onClick={() => {
                  void handleAnalyze();
                }}
                size="sm"
                variant="outline"
                disabled={isAnalyzing || isMutating || !entry?.content}
              >
                {isAnalyzing ? (
                  <Spinner size="sm" className="mr-1" />
                ) : (
                  <BrainCircuit className="h-4 w-4 mr-1" />
                )}
                Analyze
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-500" />
            <div className="flex flex-wrap gap-1">
              {(form.watch("tags") || []).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag..."
              className="h-8 w-40"
            />
          </div>

          <AssociatedTasksField form={form} />
          <AssociatedGoalsField form={form} />

          {/* Toolbar for TipTap */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editorRef.current?.commands?.toggleBold()}
              className={cn(
                "h-8 w-8 p-0",
                editorRef.current?.editor?.isActive("bold") && "bg-slate-100",
              )}
              disabled={isMutating}
            >
              <span className="font-bold">B</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editorRef.current?.commands?.toggleItalic()}
              className={cn(
                "h-8 w-8 p-0",
                editorRef.current?.editor?.isActive("italic") && "bg-slate-100",
              )}
              disabled={isMutating}
            >
              <span className="italic">I</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editorRef.current?.commands?.toggleStrike()}
              className={cn(
                "h-8 w-8 p-0",
                editorRef.current?.editor?.isActive("strike") && "bg-slate-100",
              )}
              disabled={isMutating}
            >
              <span className="line-through">S</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editorRef.current?.commands?.toggleBulletList()}
              className={cn(
                "h-8 w-8 p-0",
                editorRef.current?.editor?.isActive("bulletList") &&
                  "bg-slate-100",
              )}
              disabled={isMutating}
            >
              <span className="text-sm">UL</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editorRef.current?.commands?.toggleOrderedList()}
              className={cn(
                "h-8 w-8 p-0",
                editorRef.current?.editor?.isActive("orderedList") &&
                  "bg-slate-100",
              )}
              disabled={isMutating}
            >
              <span className="text-sm">OL</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
              className={cn(
                "h-8 w-8 p-0",
                showAttachmentUpload && "bg-slate-100",
              )}
              disabled={isMutating}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <span className="text-xs text-slate-500">
              Rich text editing enabled
            </span>
          </div>

          {/* Attachment Upload */}
          {showAttachmentUpload && ( // Controlled by Paperclip button
            <div className="pt-2">
              <FileUpload
                onUpload={handleFileUpload}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                buttonText={isMutating ? "Uploading..." : "Select File"}
                disabled={isMutating}
              />
            </div>
          )}

          {/* Attachments Preview */}
          {(form.watch("attachments") ?? []).length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-slate-700 mb-2">
                Attachments ({form.watch("attachments")?.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {form.watch("attachments")?.map((attachment: unknown) => {
                  if (
                    !attachment ||
                    typeof attachment !== "object" ||
                    !("url" in attachment) ||
                    typeof attachment.url !== "string"
                  )
                    return null;

                  const typedAttachment = attachment as Attachment;

                  return (
                    <div
                      key={typedAttachment.url}
                      className="group relative border border-slate-200 rounded-md p-1 hover:border-slate-300"
                    >
                      {typedAttachment.type === "image" ? (
                        <div className="relative w-16 h-16">
                          <Image
                            src={typedAttachment.url || "/placeholder.png"}
                            alt={typedAttachment.filename || "attachment"}
                            fill
                            className="object-cover rounded"
                            onClick={() => {
                              if (editorRef.current?.commands) {
                                editorRef.current.commands.insertContent(
                                  `<img src="${typedAttachment.url}" alt="${typedAttachment.filename}" />`,
                                );
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (editorRef.current?.commands) {
                                  editorRef.current.commands.insertContent(
                                    `<img src="${typedAttachment.url}" alt="${typedAttachment.filename}" />`,
                                  );
                                }
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white"
                              disabled={isMutating}
                            >
                              <ImageIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Non-image attachment preview
                        <div className="w-16 h-16 bg-slate-100 rounded flex flex-col items-center justify-center p-1 text-center">
                          <Paperclip className="h-6 w-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-500 truncate w-full">
                            {typedAttachment.filename}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void removeAttachment(typedAttachment.url)
                        }
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-white border border-slate-200 rounded-full opacity-0 group-hover:opacity-100"
                        disabled={isMutating}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 p-4 flex flex-col">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex-1 flex flex-col">
                <FormControl>
                  <TipTapEditor
                    ref={editorRef}
                    value={field.value || ""}
                    onChange={handleQuillChange}
                    placeholder="Start writing your thoughts..."
                    className="flex-1 flex flex-col"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{form.watch("content")?.length || 0} characters</span>
            <span>
              Last updated:{" "}
              {entry.updated_at
                ? new Date(entry.updated_at).toLocaleTimeString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        title="Journal Entry Analysis"
      >
        {isAnalyzing && <Spinner />}
        {analysisResult && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{analysisResult}</p>
          </div>
        )}
      </Modal>
    </Form>
  );
}

interface AssociatedTasksFieldProps {
  form: UseFormReturn<JournalFormValues>;
}

function AssociatedTasksField({ form }: AssociatedTasksFieldProps) {
  const { tasks } = useTasks();

  const taskOptions = (tasks || []).map(
    (task: { id: string; title: string }) => ({
      label: task.title,
      value: task.id,
    }),
  );

  return (
    <FormField
      control={form.control}
      name="associated_tasks"
      render={({ field }) => (
        <FormItem>
          <MultiSelect
            options={taskOptions}
            selected={field.value || []}
            onChange={field.onChange}
            placeholder="Select associated tasks..."
            emptyIndicator="No tasks found."
            disabled={form.formState.isSubmitting}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface AssociatedGoalsFieldProps {
  form: UseFormReturn<JournalFormValues>;
}

function AssociatedGoalsField({ form }: AssociatedGoalsFieldProps) {
  const { goals } = useGoals();

  const goalOptions = (goals || []).map(
    (goal: { id: string; title: string }) => ({
      label: goal.title,
      value: goal.id,
    }),
  );

  return (
    <FormField
      control={form.control}
      name="associated_goals"
      render={({ field }) => (
        <FormItem>
          <MultiSelect
            options={goalOptions}
            selected={field.value || []}
            onChange={field.onChange}
            placeholder="Select associated goals..."
            emptyIndicator="No goals found."
            disabled={form.formState.isSubmitting}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
