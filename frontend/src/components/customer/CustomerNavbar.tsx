"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  Heart,
  LogOut,
  MapPin,
  Menu,
  Package,
  ShoppingBasket,
  Store,
  UserRound,
  X,
} from "lucide-react";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import {
  useCart,
} from "@/context/CartContext";
import {
  Bell,
  // your existing icons...
} from "lucide-react";

export default function CustomerNavbar() {
  const pathname = usePathname();
  const {
    cartCount,
  } = useCart();
  const {
    user,
    logout,
  } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const links = [
    {
      label: "Marketplace",
      href: "/marketplace",
      icon: ShoppingBasket,
    },
    {
      label: "Farmers",
      href: "/farmers",
      icon: Store,
    },
    {
      label: "Markets",
      href: "/markets",
      icon: MapPin,
    },
  ];

  const isActive = (
    href: string
  ) => {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}

        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#166534] text-white">
            <ShoppingBasket size={19} />
          </div>

          <span className="text-xl font-bold text-[#166534]">
            MarketLink
          </span>
        </Link>


        {/* DESKTOP NAV */}

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(
            ({
              label,
              href,
              icon: Icon,
            }) => (
              <Link
                key={href}
                href={href}
                className={`
                  flex
                  items-center
                  gap-2
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  font-medium
                  transition

                  ${isActive(
                  href
                )
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : "text-[#6B7280] hover:bg-[#FAFAF7] hover:text-[#166534]"
                  }
                `}
              >
                <Icon
                  size={16}
                />

                {label}
              </Link>
            )
          )}
        </nav>


        {/* RIGHT */}

        <div className="hidden items-center gap-2 md:flex">

          {user?.role ===
            "customer" && (
              <>
                <Link
                  href="/favorites"
                  title="Favorites"
                  className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#DCFCE7] hover:text-[#166534]"
                >
                  <Heart
                    size={20}
                  />
                </Link>

                <Link
                  href="/notifications"
                  title="Notifications"
                  className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#DCFCE7] hover:text-[#166534]"
                >
                  <Bell
                    size={20}
                  />
                </Link>

                <Link
                  href="/orders"
                  title="Orders"
                  className="rounded-lg p-2 text-[#6B7280] transition hover:bg-[#DCFCE7] hover:text-[#166534]"
                >
                  <Package
                    size={20}
                  />
                </Link>

                <Link
                  href="/cart"
                  title="Cart"
                  className="relative rounded-lg p-2 text-[#6B7280] transition hover:bg-[#DCFCE7] hover:text-[#166534]"
                >
                  <ShoppingBasket
                    size={20}
                  />

                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-white">
                      {cartCount > 99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}


          {!user ? (
            <>
              <Link
                href="/login"
                className="px-3 py-2 text-sm font-medium text-[#166534]"
              >
                Sign In
              </Link>

              <Link
                href="/register/customer"
                className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14532D]"
              >
                Join MarketLink
              </Link>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-[#E5E7EB] pl-4">

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]">
                <UserRound
                  size={17}
                />
              </div>

              <span className="max-w-28 truncate text-sm font-medium text-[#1F2937]">
                {user.name}
              </span>

              <button
                onClick={
                  logout
                }
                title="Logout"
                className="rounded-lg p-2 text-[#6B7280] transition hover:bg-red-50 hover:text-[#DC2626]"
              >
                <LogOut
                  size={18}
                />
              </button>
            </div>
          )}

        </div>


        {/* MOBILE BUTTON */}

        <button
          onClick={() =>
            setMobileOpen(
              !mobileOpen
            )
          }
          className="rounded-lg p-2 text-[#1F2937] md:hidden"
        >
          {mobileOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </div>


      {/* MOBILE MENU */}

      {mobileOpen && (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4 md:hidden">

          <div className="space-y-1">
            {links.map(
              ({
                label,
                href,
                icon: Icon,
              }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#1F2937] hover:bg-[#DCFCE7]"
                >
                  <Icon
                    size={18}
                  />

                  {label}
                </Link>
              )
            )}
          </div>

          <div className="my-3 border-t border-[#E5E7EB]" />

          {user?.role ===
            "customer" && (
              <>
                <Link
                  href="/favorites"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm"
                >
                  <Heart
                    size={18}
                  />

                  Favorites
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm"
                >
                  <Package
                    size={18}
                  />

                  My Orders
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm"
                >
                  <ShoppingBasket
                    size={18}
                  />

                  Cart
                </Link>
              </>
            )}

          {!user ? (
            <Link
              href="/login"
              className="mt-3 block rounded-lg bg-[#166534] px-4 py-3 text-center text-sm font-medium text-white"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-[#DC2626]"
            >
              <LogOut
                size={17}
              />

              Logout
            </button>
          )}

        </div>
      )}
    </header>
  );
}