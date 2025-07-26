import { forwardRef, type ForwardRefRenderFunction } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import type ReactQuill from "react-quill";
import type { StringMap } from "quill";

const ReactQuillComponent = dynamic(
  // @ts-expect-error - Quill is a dynamic import
  async () => {
    const { default: RQ } = await import("react-quill");
    return ({
      forwardedRef,
      ...props
    }: {
      forwardedRef: React.Ref<ReactQuill>;
      [key: string]: unknown;
    }) => <RQ ref={forwardedRef} {...props} />;
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
  ReactQuill,
  QuillEditorProps
> = (props, ref) => {
  return (
    <div className={props.className}>
      <ReactQuillComponent
        forwardedRef={ref}
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
