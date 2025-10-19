import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Leaf, Settings } from "lucide-react";

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[75vh]">
        <div className="text-center space-y-12 max-w-2xl mx-auto px-6">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Smart Canopy Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Monitor and control your IoT canopy system
            </p>
          </div>

          {/* Quick Guide */}
          <div className="bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Start
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    1
                  </span>
                </div>
                <p className="text-left">
                  Select your device from the sidebar to connect
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    2
                  </span>
                </div>
                <p className="text-left">
                  Navigate to{" "}
                  <strong className="text-gray-900 dark:text-white">
                    Live Monitoring
                  </strong>{" "}
                  for real-time sensor data, or go to{" "}
                  <strong className="text-gray-900 dark:text-white">
                    Graph Monitoring
                  </strong>{" "}
                  to view historical trends.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    3
                  </span>
                </div>
                <p className="text-left">
                  Use{" "}
                  <strong className="text-gray-900 dark:text-white">
                    Device Control
                  </strong>{" "}
                  to manage your canopy
                </p>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Use the sidebar navigation to get started
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
