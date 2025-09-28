import { IoTDashboardSidebar } from "@/components/dashboard/sidebar";
import { DeviceStatusMonitor } from "@/components/monitoring/device-status-monitor";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function IoTDashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DeviceStatusMonitor>
      <SidebarProvider>
        <IoTDashboardSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                IoT Smart Canopy Dashboard
              </h1>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DeviceStatusMonitor>
  );
}
