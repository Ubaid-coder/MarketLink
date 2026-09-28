"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tractor,
  MapPinned,
  Tags,
  PackageSearch,
  MessageSquareWarning,
  BarChart3,
  Megaphone,
  LogOut,
  Leaf,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";



interface Props {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Farmers",
    href: "/admin/farmers",
    icon: Tractor,
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Markets",
    href: "/admin/markets",
    icon: MapPinned,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: Tags,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: PackageSearch,
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: MessageSquareWarning,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: Megaphone,
  },
];

export default function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const active = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const content = (
    <div className="flex h-full flex-col bg-[#14532D] text-white">
      {/* BRAND */}

      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
        <Link
          href="/admin"
          onClick={onMobileClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#166534]">
            <Leaf size={21} />
          </div>

          <div>
            <p className="text-lg font-bold">
              MarketLink
            </p>

            <p className="text-xs text-green-200">
              Admin Portal
            </p>
          </div>
        </Link>

        <button
          onClick={onMobileClose}
          className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* ADMIN */}

      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-sm font-semibold">
          {user?.name || "Administrator"}
        </p>

        <p className="mt-1 truncate text-xs text-green-200">
          {user?.email}
        </p>

        <span className="mt-3 inline-flex rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-[#166534]">
          Administrator
        </span>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-green-300">
          Platform Management
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const selected = active(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${selected
                    ? "bg-white text-[#166534]"
                    : "text-green-100 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* LOGOUT */}

      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 hover:bg-white/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] lg:block">
        {content}
      </aside>

      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform lg:hidden ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
          }`}
      >
        {content}
      </aside>
    </>
  );
}