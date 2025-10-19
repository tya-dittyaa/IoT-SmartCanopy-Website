import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import LoadingSpinner from "./components/ui/loading-spinner";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const DashboardLayout = lazy(
  () => import("./components/dashboard/dashboard-layout")
);
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const DeviceControl = lazy(() => import("./pages/dashboard/DeviceControl"));
const LiveMonitoring = lazy(() => import("./pages/dashboard/LiveMonitoring"));
const GraphMonitoring = lazy(() => import("./pages/dashboard/GraphMonitoring"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense
              fallback={<LoadingSpinner size="lg" text="Loading Home..." />}
            >
              <Home />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense
              fallback={
                <LoadingSpinner size="lg" text="Loading Dashboard..." />
              }
            >
              <DashboardHome />
            </Suspense>
          }
        />
        <Route
          path="/dashboard/live"
          element={
            <Suspense
              fallback={
                <LoadingSpinner size="lg" text="Loading Live Monitoring..." />
              }
            >
              <DashboardLayout>
                <LiveMonitoring />
              </DashboardLayout>
            </Suspense>
          }
        />
        <Route
          path="/dashboard/control"
          element={
            <Suspense
              fallback={
                <LoadingSpinner size="lg" text="Loading Device Control..." />
              }
            >
              <DashboardLayout>
                <DeviceControl />
              </DashboardLayout>
            </Suspense>
          }
        />
        <Route
          path="/dashboard/graphs"
          element={
            <Suspense
              fallback={<LoadingSpinner size="lg" text="Loading Graphs..." />}
            >
              <DashboardLayout>
                <GraphMonitoring />
              </DashboardLayout>
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
