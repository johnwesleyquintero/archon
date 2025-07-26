import type { RangeStatic, Quill as QuillType } from "quill";
declare module "react-quill";

export interface QuillEditorRef {
  getEditor(): QuillType;
  getSelection(): RangeStatic | null;
  setSelection(index: number, length: number): void;
  insertEmbed(
    index: number,
    type: string,
    value: string | { src: string },
  ): void;
  insertText(index: number, text: string): void;
  getLength(): number;
}
