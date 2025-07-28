import { Layout } from "react-grid-layout";

export type PageProps = {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

export interface WidgetLayout extends Layout {
  isVisible: boolean;
}
