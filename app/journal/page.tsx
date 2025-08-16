import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { JournalInterface } from "@/components/journal-interface";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getJournalEntries } from "@/lib/database/journal";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface JournalPageProps {
  params: Record<string, string | string[] | undefined>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function JournalPage({ searchParams }: JournalPageProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const tags = Array.isArray(searchParams.tags)
    ? searchParams.tags
    : typeof searchParams.tags === "string"
      ? [searchParams.tags]
      : undefined;

  const journalEntries = await getJournalEntries(user.id, { search, tags });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Journal</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-4">
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-bold text-slate-900">Journal</h1>
              <JournalInterface
                initialJournalEntries={journalEntries}
                userId={user.id}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
