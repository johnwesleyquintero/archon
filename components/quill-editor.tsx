import {
  forwardRef,
  useRef,
  useImperativeHandle,
  type ForwardRefRenderFunction,
} from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import type ReactQuill from "react-quill";
import type { StringMap } from "quill";
import type { QuillEditorRef } from "@/types/quill";

const ReactQuillComponent = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    const QuillComponent = ({
      forwardedRef,
      ...props
    }: {
      forwardedRef: React.Ref<ReactQuill>;
      [key: string]: unknown;
    }) => <RQ ref={forwardedRef} {...props} />;
    QuillComponent.displayName = "QuillComponent";
    return QuillComponent;
  },
  { ssr: false },
);

interface QuillEditorProps {
  theme: string;
  value: string;
  onChange: (newContent: string) => void;
  modules: StringMap;
  formats: string[];
  placeholder: string;
  className: string;
}

const QuillEditorBase: ForwardRefRenderFunction<
  QuillEditorRef,
  QuillEditorProps
> = (props, ref) => {
  const quillRef = useRef<ReactQuill | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => {
        const editor = quillRef.current?.getEditor();
        if (!editor) throw new Error("Editor not initialized");
        return editor;
      },
      getSelection: () => {
        return quillRef.current?.getEditor()?.getSelection() || null;
      },
      setSelection: (index: number, length: number) => {
        const editor = quillRef.current?.getEditor();
        if (editor) editor.setSelection(index, length);
      },
      insertEmbed: (
        index: number,
        type: string,
        value: string | { src: string },
      ) => {
        const editor = quillRef.current?.getEditor();
        if (editor) editor.insertEmbed(index, type, value);
      },
      insertText: (index: number, text: string) => {
        const editor = quillRef.current?.getEditor();
        if (editor) editor.insertText(index, text);
      },
      getLength: () => {
        return quillRef.current?.getEditor()?.getLength() || 0;
      },
    }),
    [quillRef],
  );

  return (
    <div className={props.className}>
      <ReactQuillComponent
        forwardedRef={quillRef}
        theme={props.theme}
        value={props.value}
        onChange={props.onChange}
        modules={props.modules}
        formats={props.formats}
        placeholder={props.placeholder}
      />
    </div>
  );
};

export const QuillEditor = forwardRef(QuillEditorBase);
QuillEditor.displayName = "QuillEditor";
