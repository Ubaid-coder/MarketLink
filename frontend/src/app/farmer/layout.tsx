"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Menu,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import FarmerSidebar from "@/components/farmer/FarmerSidebar";


export default function FarmerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router =
    useRouter();

  const {
    user,
    loading,
  } = useAuth();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);


  // ================================================
  // ROLE PROTECTION
  // ================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/farmer"
      );

      return;
    }

    if (
      user.role !== "farmer"
    ) {
      if (
        user.role === "admin"
      ) {
        router.replace(
          "/admin"
        );

        return;
      }

      router.replace("/");
    }
  }, [
    user,
    loading,
    router,
  ]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DCFCE7] border-t-[#166534]" />

          <p className="mt-4 text-sm text-[#6B7280]">
            Loading farmer dashboard...
          </p>

        </div>

      </div>
    );
  }


  if (
    !user ||
    user.role !== "farmer"
  ) {
    return null;
  }


  return (
    <div className="min-h-screen bg-[#FAFAF7]">

      {/* SIDEBAR */}

      <FarmerSidebar
        open={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />


      {/* MAIN */}

      <div className="lg:pl-64">

        {/* MOBILE HEADER */}

        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#E5E7EB] bg-white px-4 lg:hidden">

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="rounded-lg p-2 text-[#1F2937] transition hover:bg-[#F3F4F6]"
          >
            <Menu
              size={22}
            />
          </button>


          <div className="ml-3">

            <p className="font-bold text-[#166534]">
              MarketLink
            </p>

            <p className="text-[11px] text-[#6B7280]">
              Farmer Portal
            </p>

          </div>

        </header>


        <main className="min-h-screen">

          {children}

        </main>

      </div>

    </div>
  );
}