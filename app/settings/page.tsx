import { AccountSettings } from "@/components/account-settings";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <AccountSettings />
      </div>
    </DashboardLayout>
  );
}
