import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminNavigation from "@/components/AdminNavigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import UserManagement from "@/components/admin/UserManagement";
import LogMonitoring from "@/components/admin/LogMonitoring";
import PaymentSubscription from "@/components/admin/PaymentSubscription";
import ContentManagement from "@/components/admin/ContentManagement";
import MLPerformance from "@/components/admin/MLPerformance";
import AnomalyDetection from "@/components/admin/AnomalyDetection";
import AdminOverview from "@/components/admin/AdminOverview";

const AdminDashboard = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("overview");

  // ✅ 주소 경로에 따라 섹션 상태 자동 설정
  useEffect(() => {
    const path = location.pathname;

    if (path === "/admin/logs") setActiveSection("logs");
    else if (path === "/admin/users") setActiveSection("users");
    else if (path === "/admin/payments") setActiveSection("payments");
    else if (path === "/admin/content") setActiveSection("content");
    else if (path === "/admin/anomaly") setActiveSection("anomaly");
    else setActiveSection("overview");
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <UserManagement />;
      case "logs":
        return <LogMonitoring />;
      case "payments":
        return <PaymentSubscription />;
      case "content":
        return <ContentManagement />;
      case "ml":
        return <MLPerformance />;
      case "anomaly":
        return <AnomalyDetection />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <AdminNavigation />
      
      <div className="flex max-w-7xl mx-auto px-6 py-10 gap-8">
        <AdminSidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
        />
        
        <main className="flex-1 animate-fade-in">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
