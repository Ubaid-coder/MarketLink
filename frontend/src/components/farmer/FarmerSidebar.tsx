"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Star,
  UserRound,
  LogOut,
  Leaf,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";


interface FarmerSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}


const navigation = [
  {
    label: "Dashboard",
    href: "/farmer",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/farmer/products",
    icon: Package,
  },
  {
    label: "Preorders",
    href: "/farmer/orders",
    icon: ShoppingBag,
  },
  {
    label: "Markets & Pickup",
    href: "/farmer/markets",
    icon: Store,
  },
  {
    label: "Reviews",
    href: "/farmer/reviews",
    icon: Star,
  },
  {
    label: "Profile",
    href: "/farmer/profile",
    icon: UserRound,
  },
];


export default function FarmerSidebar({
  mobileOpen = false,
  onMobileClose,
}: FarmerSidebarProps) {
  const pathname = usePathname();

  const {
    user,
    farmerProfile,
    logout,
  } = useAuth();


  const isActive = (
    href: string
  ) => {
    if (href === "/farmer") {
      return pathname === "/farmer";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };


  const approvalStatus =
    farmerProfile?.approvalStatus;


  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#14532D] text-white">

      {/* ============================================
          BRAND
      ============================================= */}

      <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">

        <Link
          href="/farmer"
          className="flex items-center gap-3"
          onClick={
            onMobileClose
          }
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#166534]">
            <Leaf size={21} />
          </div>

          <div>
            <p className="text-lg font-bold leading-tight">
              MarketLink
            </p>

            <p className="text-xs text-green-200">
              Farmer Portal
            </p>
          </div>
        </Link>


        <button
          type="button"
          onClick={
            onMobileClose
          }
          className="rounded-lg p-2 text-green-100 hover:bg-white/10 lg:hidden"
        >
          <X size={20} />
        </button>

      </div>


      {/* ============================================
          FARMER
      ============================================= */}

      <div className="border-b border-white/10 px-5 py-5">

        <p className="truncate text-sm font-semibold">
          {farmerProfile
            ?.stallName ||
            user?.name ||
            "Farmer"}
        </p>

        <p className="mt-1 truncate text-xs text-green-200">
          {user?.email}
        </p>


        {approvalStatus && (
          <span
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
              approvalStatus ===
              "approved"
                ? "bg-green-100 text-[#166534]"
                : approvalStatus ===
                  "pending"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-[#DC2626]"
            }`}
          >
            {approvalStatus}
          </span>
        )}

      </div>


      {/* ============================================
          NAVIGATION
      ============================================= */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-green-300">
          Farmer Management
        </p>


        <div className="space-y-1">

          {navigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  onClick={
                    onMobileClose
                  }
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-[#166534] shadow-sm"
                      : "text-green-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                  />

                  {item.label}
                </Link>
              );
            }
          )}

        </div>

      </nav>


      {/* ============================================
          LOGOUT
      ============================================= */}

      <div className="border-t border-white/10 p-4">

        <button
          type="button"
          onClick={() =>
            logout()
          }
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-green-100 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />

          Logout
        </button>

      </div>

    </div>
  );


  return (
    <>
      {/* DESKTOP */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] lg:block">
        {sidebarContent}
      </aside>


      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={
            onMobileClose
          }
        />
      )}


      {/* MOBILE SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-200 lg:hidden ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}