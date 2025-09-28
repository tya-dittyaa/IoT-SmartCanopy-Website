import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Settings } from "lucide-react";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[75vh]">
        <div className="text-center space-y-12 max-w-2xl mx-auto px-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="text-3xl">🌿</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Smart Canopy Dashboard
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Monitor and control your IoT canopy system
            </p>
          </div>

          {/* Quick Guide */}
          <div className="bg-muted/30 rounded-xl p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Quick Start</h2>
            </div>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">1</span>
                </div>
                <p className="text-left">
                  Select your device from the sidebar to connect
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">2</span>
                </div>
                <p className="text-left">
                  Navigate to <strong>Live Monitoring</strong> for sensor data
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-primary">3</span>
                </div>
                <p className="text-left">
                  Use <strong>Device Control</strong> to manage your canopy
                </p>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="text-xs text-muted-foreground">
            Use the sidebar navigation to get started
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
