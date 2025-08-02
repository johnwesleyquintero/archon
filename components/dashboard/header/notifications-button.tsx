import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NotificationsButton() {
  return (
    <Button size="icon" variant="ghost" className="relative">
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notifications</span>
      <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
        3
      </span>
    </Button>
  );
}
