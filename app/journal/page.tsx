import { AppSidebar } from "@/components/app-sidebar";
import { JournalInterface } from "@/components/journal-interface";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createSupabaseServerClient } from "@/lib/supabase/server-auth";
import { getJournalEntries } from "@/lib/database/journal";
import {
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "@/app/journal/actions";

async function getServerUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user:", error.message);
    return null;
  }

  return user;
}

export default async function JournalPage() {
  const user = await getServerUser();
  const journalEntries = await getJournalEntries(user?.id || "");

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
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
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
                addEntry={addJournalEntry}
                updateEntry={updateJournalEntry}
                deleteEntry={deleteJournalEntry}
                userId={user?.id || ""}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
