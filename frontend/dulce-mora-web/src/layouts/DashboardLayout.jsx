import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/DashboardSidebar";
import "../styles/dashboard/dashboard.css";

function DashboardLayout() {
  return (
    <div className="dashboard-page">
      <DashboardSidebar />

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;