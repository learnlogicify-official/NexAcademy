"use client";

import { AdminHeader } from "../../components/admin/AdminHeader";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import { useState } from "react";
import { useMobile } from "../../hooks/use-mobile";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMobile();

  // Add mobile overlay when sidebar is open
  const mobileOverlay = isMobile && sidebarOpen && (
    <div
      className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
      onClick={() => setSidebarOpen(false)}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOverlay}
      {/* Sidebar */}
      <AdminSidebar
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 