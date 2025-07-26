"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Save, Paperclip, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/file-upload";
import { uploadFile } from "@/lib/blob";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalEntrySchema } from "@/lib/validators";
import type { z } from "zod";
import type { Database } from "@/lib/supabase/types";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/use-debounce";
import { useJournal } from "@/hooks/use-journal"; // Import useJournal hook
import { QuillEditor } from "./quill-editor";
import type { QuillEditorRef } from "@/types/quill";

type Attachment = {
  url: string;
  filename: string;
  type: "image" | "document";
};

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];

interface JournalEditorProps {
  entry: JournalEntry | null;
  onSaveEntry: () => void;
  hasUnsavedChanges: boolean;
}

type JournalFormValues = z.infer<typeof journalEntrySchema>;

export function JournalEditorWithAttachments({
  entry,
  onSaveEntry,
  hasUnsavedChanges,
}: JournalEditorProps) {
  const quillRef = useRef<QuillEditorRef>(null);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false); // Keep for paperclip button
  const { updateEntry, isMutating } = useJournal(); // Use useJournal hook

  const debouncedOnUpdateEntryContent = useDebounce(
    useCallback(
      (entryId: string, content: string) => {
        void updateEntry(entryId, { content: content }); // Save HTML content directly
      },
      [updateEntry],
    ),
    500, // Debounce delay of 500ms
  );

  const debouncedOnUpdateEntryTitle = useDebounce(
    useCallback(
      (entryId: string, title: string) => {
        void updateEntry(entryId, { title });
      },
      [updateEntry],
    ),
    500, // Debounce delay of 500ms
  );

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      title: "",
      content: "",
      attachments: [],
    },
    mode: "onBlur", // Enable real-time validation on blur
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
            ...currentAttachments,
            newAttachment,
          ];
          form.setValue("attachments", updatedAttachments, {
            shouldDirty: true,
            shouldValidate: true,
          });

          await updateEntry(entry.id, {
            attachments: updatedAttachments.map((att) => att.url),
          });

          // Insert image directly into Quill editor if it's an image
          if (fileType === "image" && quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = quillRef.current.getSelection();
            if (range) {
              editor.insertEmbed(range.index, "image", result.url);
            } else {
              editor.insertEmbed(editor.getLength(), "image", result.url);
            }
          } else if (quillRef.current) {
            // For other file types, insert a link
            const editor = quillRef.current.getEditor();
            const range = quillRef.current.getSelection();
            const linkText = newAttachment.filename;
            const linkUrl = newAttachment.url;
            if (range) {
              editor.insertText(range.index, linkText, { link: linkUrl });
              quillRef.current.setSelection(range.index + linkText.length, 0);
            } else {
              editor.insertText(editor.getLength(), linkText, {
                link: linkUrl,
              });
            }
          }

          return { url: result.url, success: true };
        }

        return { success: false };
      } catch (error: unknown) {
        console.error("Error uploading file:", error);
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    },
    [entry, form, updateEntry, quillRef],
  ); // Add dependencies for useCallback

  // Custom image handler for Quill (triggered by Quill's image button)
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    };
  }, [handleFileUpload]);

  // Quill modules for toolbar and formatting options
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler, // Use custom image handler
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler],
  );

  // Quill formats
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  useEffect(() => {
    if (entry) {
      form.reset({
        title: entry.title,
        content: entry.content || "", // Set HTML content directly
        attachments: Array.isArray(entry.attachments)
          ? entry.attachments
              .filter((att): att is string => typeof att === "string")
              .map(createAttachmentFromUrl)
          : [],
      });
    } else {
      form.reset({
        title: "",
        content: "",
        attachments: [],
      });
    }
  }, [entry, form]);

  const handleQuillChange = (newContent: string) => {
    form.setValue("content", newContent, {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (entry) {
      void debouncedOnUpdateEntryContent(entry.id, newContent);
    }
  };

  const removeAttachment = (url: string) => {
    if (!entry) return;

    const currentAttachments = form.getValues("attachments") || [];
    const updatedAttachments = currentAttachments.filter(
      (attachment) => attachment.url !== url,
    );
    form.setValue("attachments", updatedAttachments, {
      shouldDirty: true,
      shouldValidate: true,
    });
    void updateEntry(entry.id, {
      attachments: updatedAttachments.map((att) => att.url),
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
                        onChange={(e) => {
                          field.onChange(e);
                          if (entry) {
                            void debouncedOnUpdateEntryTitle(
                              entry.id,
                              e.target.value,
                            );
                          }
                        }}
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
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1">
            {/* Quill's toolbar will be rendered here */}
            {/* The custom image handler will be triggered by Quill's image button */}
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
                {form.watch("attachments")?.map((attachment: Attachment) => {
                  if (!attachment || !attachment.url) return null;
                  return (
                    <div
                      key={attachment.url}
                      className="group relative border border-slate-200 rounded-md p-1 hover:border-slate-300"
                    >
                      {attachment.type === "image" ? (
                        <div className="relative w-16 h-16">
                          <Image
                            src={attachment.url || "/placeholder.png"}
                            alt={attachment.filename || "attachment"}
                            fill
                            className="object-cover rounded"
                            onClick={() => {
                              if (quillRef.current) {
                                const editor = quillRef.current.getEditor();
                                const range = quillRef.current.getSelection();
                                if (range) {
                                  editor.insertEmbed(
                                    range.index,
                                    "image",
                                    attachment.url,
                                  );
                                } else {
                                  editor.insertEmbed(
                                    editor.getLength(),
                                    "image",
                                    attachment.url,
                                  );
                                }
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded flex items-center justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (quillRef.current) {
                                  const editor = quillRef.current.getEditor();
                                  const range = quillRef.current.getSelection();
                                  if (range) {
                                    editor.insertEmbed(
                                      range.index,
                                      "image",
                                      attachment.url,
                                    );
                                  } else {
                                    editor.insertEmbed(
                                      editor.getLength(),
                                      "image",
                                      attachment.url,
                                    );
                                  }
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
                            {attachment.filename}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void removeAttachment(attachment.url)}
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
                  <QuillEditor
                    ref={quillRef}
                    theme="snow"
                    value={field.value || ""}
                    onChange={handleQuillChange}
                    modules={modules}
                    formats={formats}
                    placeholder="Start writing your thoughts..."
                    className="flex-1 flex flex-col quill-editor-container"
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
    </Form>
  );
}
