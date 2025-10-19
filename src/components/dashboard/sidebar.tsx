import { Activity, Home, Radio, Zap } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import DeviceSelector from "@/components/dashboard/device-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useWs } from "@/contexts/ws-context";

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Live Data", url: "/dashboard/live", icon: Activity },
  { title: "Device Control", url: "/dashboard/control", icon: Zap },
];

export function IoTDashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { selectedDeviceId, deviceStatuses, connectToDevice, disconnectFromDevice, wsStatus } = useWs();
  const selectedDeviceStatus = selectedDeviceId ? deviceStatuses?.[selectedDeviceId] : undefined;
  
  
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Smart Canopy</span>
            <span className="truncate text-xs text-muted-foreground">
              IoT Dashboard
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>

        <SidebarGroup>
          <SidebarGroupLabel>Device</SidebarGroupLabel>
          <SidebarGroupContent>
            <DeviceSelector />

            <div className="mt-3">
              {!selectedDeviceStatus?.isConnected ? (
                <button
                  onClick={() => connectToDevice()}
                  disabled={!selectedDeviceId}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white ${!selectedDeviceId ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"}`}
                >
                  Connect
                </button>
              ) : (
                <button
                  onClick={() => disconnectFromDevice()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Disconnect
                </button>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2">
              <div className={`flex items-center gap-2 px-2 py-2 rounded-md ${wsStatus.isConnected ? "bg-green-500/10" : wsStatus.isConnecting ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                <Radio className={`h-4 w-4 ${wsStatus.isConnected ? "text-green-500" : wsStatus.isConnecting ? "text-yellow-500" : "text-red-500"}`} />
                <span className="text-sm">WebSocket Connection</span>
              </div>

              <div className={`flex flex-col gap-1 px-2 py-2 rounded-md ${selectedDeviceStatus?.isConnected ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <div className="flex items-center gap-2">
                  <Radio className={`h-4 w-4 ${selectedDeviceStatus?.isConnected ? "text-green-500" : "text-red-500"}`} />
                  <span className="text-sm">Device Connection</span>
                </div>
                <div className="text-[11px] text-muted-foreground ml-6 lowercase">Last Seen: {selectedDeviceStatus?.lastSeen ? new Date(selectedDeviceStatus.lastSeen).toLocaleTimeString() : "not seen"}</div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
