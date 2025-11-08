// ✅ app/dashboard/(overview)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SideNav from "@/app/ui/dashboard/sidenav";
import SessionProvider from "../../ui/components/session-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12 bg-gray-50">
        {children}
      </div>
    </div>
  );
}
