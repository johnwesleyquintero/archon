import {
  forwardRef,
  useRef,
  useImperativeHandle,
  type ForwardRefRenderFunction,
} from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import type { StringMap, Quill as QuillType } from "quill";
import type { QuillEditorRef } from "@/types/quill";
import type { Component } from "react";

// Define an interface for the ReactQuill component instance
interface IReactQuill extends Component {
  getEditor(): QuillType;
}

// Define the props for the dynamically imported component
interface DynamicQuillComponentProps {
  forwardedRef: React.Ref<IReactQuill | null>;
  theme: string;
  value: string;
  onChange: (newContent: string) => void;
  modules: StringMap;
  formats: string[];
  placeholder: string;
  className: string;
}

const ReactQuillComponent = dynamic<DynamicQuillComponentProps>( // Specify the props type here
  async () => {
    const { default: RQ } = await import("react-quill");
    const QuillComponent = ({
      forwardedRef,
      ...props
    }: DynamicQuillComponentProps) => <RQ ref={forwardedRef} {...props} />;
    QuillComponent.displayName = "QuillComponent";
    return QuillComponent; // No cast needed here
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
  const quillRef = useRef<IReactQuill | null>(null); // Use IReactQuill directly

  useImperativeHandle(
    ref,
    () => ({
      getEditor: (): QuillType => {
        if (!quillRef.current) throw new Error("Editor not initialized");
        return quillRef.current.getEditor();
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
        className={props.className} // Add className prop
      />
    </div>
  );
};

export const QuillEditor = forwardRef(QuillEditorBase);
QuillEditor.displayName = "QuillEditor";
