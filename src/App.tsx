import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import DashboardLayout from "./components/dashboard/dashboard-layout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import DeviceControl from "./pages/dashboard/DeviceControl";
import LiveMonitoring from "./pages/dashboard/LiveMonitoring";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route
          path="/dashboard/live"
          element={
            <DashboardLayout>
              <LiveMonitoring />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard/control"
          element={
            <DashboardLayout>
              <DeviceControl />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
