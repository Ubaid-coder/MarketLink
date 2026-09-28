"use client";

import {
  ReactNode,
  useState,
} from "react";

import { Menu } from "lucide-react";

import RoleGuard from "@/components/shared/RoleGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen bg-[#FAFAF7]">
        <AdminSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() =>
            setMobileOpen(false)
          }
        />

        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#E5E7EB] bg-white px-4 lg:hidden">
          <button
            onClick={() =>
              setMobileOpen(true)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB]"
          >
            <Menu size={20} />
          </button>

          <div className="ml-3">
            <p className="font-bold text-[#166534]">
              MarketLink
            </p>

            <p className="text-xs text-[#6B7280]">
              Admin Portal
            </p>
          </div>
        </header>

        <main className="min-h-screen lg:ml-[270px]">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}