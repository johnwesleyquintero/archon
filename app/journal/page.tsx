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
import { Input } from "@/components/ui/input"; // Import Input component
import { SearchIcon } from "lucide-react"; // Import SearchIcon
import { JournalTagFilter } from "@/components/journal-tag-filter"; // Will create this component

interface JournalPageProps {
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
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search journal entries..."
                    className="pl-9 pr-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    defaultValue={search}
                    onChange={(e) => {
                      const newSearchParams = new URLSearchParams(
                        window.location.search,
                      );
                      if (e.target.value) {
                        newSearchParams.set("search", e.target.value);
                      } else {
                        newSearchParams.delete("search");
                      }
                      redirect(`/journal?${newSearchParams.toString()}`);
                    }}
                  />
                </div>
                <JournalTagFilter currentTags={tags} />
              </div>
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
