"use client";

import {
  ReactNode,
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  UserRole,
} from "@/types/auth";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({
  children,
  allowedRoles,
}: RoleGuardProps) {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (
      !allowedRoles.includes(
        user.role
      )
    ) {
      if (
        user.role === "admin"
      ) {
        router.replace(
          "/admin"
        );

        return;
      }

      if (
        user.role === "farmer"
      ) {
        router.replace(
          "/farmer"
        );

        return;
      }

      router.replace("/");
    }
  }, [
    user,
    loading,
    router,
    allowedRoles,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DCFCE7] border-t-[#166534]" />

          <p className="mt-4 text-sm text-[#6B7280]">
            Loading MarketLink...
          </p>
        </div>
      </div>
    );
  }

  if (
    !user ||
    !allowedRoles.includes(
      user.role
    )
  ) {
    return null;
  }

  return children;
}