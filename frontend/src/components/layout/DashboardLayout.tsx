import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
