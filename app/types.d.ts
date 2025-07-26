import { PageProps as NextPageProps } from "next";

export type PageProps = NextPageProps & {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};
