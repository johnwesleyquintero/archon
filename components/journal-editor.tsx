// This file is now deprecated and replaced by journal-editor-with-attachments.tsx
// Keeping it here for reference if needed, but it's not actively used.
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Bold, Italic, List, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalEditorProps {
  entry: JournalEntry | null;
  onUpdateEntry: (entryId: string, updates: Partial<JournalEntry>) => void;
  onSaveEntry: () => void;
  hasUnsavedChanges: boolean;
}

export function JournalEditor({
  entry,
  onUpdateEntry,
  onSaveEntry,
  hasUnsavedChanges,
}: JournalEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setContent(entry.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [entry]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (entry) {
      onUpdateEntry(entry.id, { title: newTitle });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (entry) {
      onUpdateEntry(entry.id, { content: newContent });
    }
  };

  const insertMarkdown = (before: string, after = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    handleContentChange(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleBold = () => insertMarkdown("**", "**");
  const handleItalic = () => insertMarkdown("*", "*");
  const handleBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const newContent =
      content.substring(0, lineStart) + "- " + content.substring(lineStart);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2);
    }, 0);
  };

  const formatDate = (date: Date) => {
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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Entry title..."
              className="text-lg font-semibold border-0 px-0 shadow-none focus-visible:ring-0 placeholder:text-slate-400"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formatDate(entry.createdAt)}
            </p>
          </div>
          <Button
            onClick={onSaveEntry}
            size="sm"
            disabled={!hasUnsavedChanges}
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

        {/* Toolbar */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBold}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulletList}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <span className="text-xs text-slate-500">
            Use **bold**, *italic*, and - for lists
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start writing your thoughts..."
          className="w-full h-full resize-none border-0 shadow-none focus-visible:ring-0 text-base leading-relaxed placeholder:text-slate-400"
          style={{
            fontFamily: "ui-serif, Georgia, Cambria, serif",
            fontSize: "16px",
            lineHeight: "1.7",
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{content.length} characters</span>
          <span>Last updated: {entry.updatedAt.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
