import { Activity, Heart, Home, Radio, Zap } from "lucide-react";
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
import { useMqtt } from "@/contexts/mqtt-context";

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Live Data", url: "/dashboard/live", icon: Activity },
  { title: "Device Control", url: "/dashboard/control", icon: Zap },
];

export function IoTDashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { selectedDeviceId, deviceStatuses, mqttStatus } = useMqtt();

  const selectedDeviceStatus = selectedDeviceId
    ? deviceStatuses[selectedDeviceId]
    : null;

  const isMQTTConnected = mqttStatus.isConnected;

  const isDeviceHeartbeatActive =
    isMQTTConnected && selectedDeviceStatus?.lastHeartbeat
      ? Date.now() - selectedDeviceStatus.lastHeartbeat < 30000
      : false;

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
          </SidebarGroupContent>
        </SidebarGroup>

        {selectedDeviceId && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Status</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2">
                  <div
                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-300 ${
                      isMQTTConnected
                        ? "bg-green-500/10"
                        : mqttStatus.isConnecting
                        ? "bg-yellow-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative">
                        <Radio
                          className={`h-4 w-4 ${
                            isMQTTConnected
                              ? "text-green-500"
                              : mqttStatus.isConnecting
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        />
                      </div>
                      <span className="text-sm">MQTT Connection</span>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-300 ${
                      isDeviceHeartbeatActive
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="relative">
                        <Heart
                          className={`h-4 w-4 ${
                            isDeviceHeartbeatActive
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        />
                      </div>
                      <span className="text-sm">Device Heartbeat</span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home />
                    <span>Landing Page</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
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
