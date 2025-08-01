"use client";

import {
  forwardRef,
  useImperativeHandle,
  type ForwardRefRenderFunction,
} from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link"; // Common extension for rich text
import Placeholder from "@tiptap/extension-placeholder"; // For placeholder text
import { cn } from "@/lib/utils"; // Assuming this utility for tailwind-merge

// Define a ref interface for the TipTap editor, exposing common methods
export interface TipTapEditorRef {
  getHTML: () => string;
  getText: () => string;
  isEmpty: () => boolean;
  focus: () => void;
  commands: Editor["commands"];
  editor: Editor | null; // Expose the full editor instance
}

interface TipTapEditorProps {
  value: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

const TipTapEditorBase: ForwardRefRenderFunction<
  TipTapEditorRef,
  TipTapEditorProps
> = (props, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: props.placeholder || "Write something...",
      }),
    ],
    content: props.value,
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose dark:prose-invert max-w-none focus:outline-none",
          props.className,
        ),
      },
    },
    editable: props.editable !== false, // Default to true if not explicitly false
  });

  // Store the editor instance in a ref for imperative access
  useImperativeHandle(
    ref,
    () => ({
      getHTML: () => editor?.getHTML() || "",
      getText: () => editor?.getText() || "",
      isEmpty: () => editor?.isEmpty || true,
      focus: () => editor?.commands.focus(),
      commands: editor?.commands,
      editor: editor, // Expose the full editor instance
    }),
    [editor],
  );

  // Update editor content when value prop changes, but only if it's different
  // Update editor content when value prop changes, but only if it's different
  // This prevents infinite loops and ensures external changes are reflected
  if (editor && editor.getHTML() !== props.value && !editor.isFocused) {
    editor.commands.setContent(props.value, { emitUpdate: false }); // false to prevent dispatching update event
  }

  return <EditorContent editor={editor} />;
};

export const TipTapEditor = forwardRef(TipTapEditorBase);
TipTapEditor.displayName = "TipTapEditor";
