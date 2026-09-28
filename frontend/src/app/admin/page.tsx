"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  ClipboardCheck,
  MapPinned,
  RefreshCcw,
  ShoppingBag,
  Tractor,
  Users,
} from "lucide-react";

import api from "@/lib/api";

interface DashboardData {
  totalFarmers: number;
  totalCustomers: number;
  totalMarkets: number;
  totalOrders: number;
  pendingFarmers: number;
}

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<DashboardData>({
      totalFarmers: 0,
      totalCustomers: 0,
      totalMarkets: 0,
      totalOrders: 0,
      pendingFarmers: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/dashboard"
          );

        const raw =
          response.data.dashboard ||
          response.data.data ||
          response.data;

        setData({
          totalFarmers:
            raw.totalFarmers ?? 0,

          totalCustomers:
            raw.totalCustomers ?? 0,

          totalMarkets:
            raw.totalMarkets ?? 0,

          totalOrders:
            raw.totalOrders ?? 0,

          pendingFarmers:
            raw.pendingFarmers ?? 0,
        });
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Dashboard
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Overview of the MarketLink
              platform and management tasks.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
          >
            <RefreshCcw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </header>

      <div className="space-y-8 p-5 sm:p-8 lg:p-10">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {/* MAIN STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            title="Farmers"
            value={data.totalFarmers}
            icon={<Tractor size={22} />}
            loading={loading}
          />

          <DashboardCard
            title="Customers"
            value={data.totalCustomers}
            icon={<Users size={22} />}
            loading={loading}
          />

          <DashboardCard
            title="Markets"
            value={data.totalMarkets}
            icon={<MapPinned size={22} />}
            loading={loading}
          />

          <DashboardCard
            title="Orders"
            value={data.totalOrders}
            icon={<ShoppingBag size={22} />}
            loading={loading}
          />
        </div>

        {/* PENDING APPROVAL */}

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ClipboardCheck
                  size={22}
                />
              </div>

              <div>
                <h2 className="font-semibold text-amber-900">
                  Farmer Approvals
                </h2>

                <p className="mt-1 text-sm text-amber-800">
                  {loading
                    ? "Loading..."
                    : `${data.pendingFarmers} farmer account${
                        data.pendingFarmers ===
                        1
                          ? ""
                          : "s"
                      } waiting for approval.`}
                </p>
              </div>
            </div>

            <Link
              href="/admin/farmers"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white hover:bg-[#14532D]"
            >
              Review Farmers
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* QUICK MANAGEMENT */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#1F2937]">
              Platform Management
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              Access the main administration
              areas.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <QuickLink
              href="/admin/farmers"
              title="Manage Farmers"
              description="Approve, review or suspend farmer accounts."
            />

            <QuickLink
              href="/admin/customers"
              title="Manage Customers"
              description="Review and activate or deactivate customer accounts."
            />

            <QuickLink
              href="/admin/markets"
              title="Manage Markets"
              description="Create and maintain farmers-market locations."
            />

            <QuickLink
              href="/admin/categories"
              title="Categories"
              description="Manage product categories used across MarketLink."
            />

            <QuickLink
              href="/admin/products"
              title="Product Moderation"
              description="Review and moderate products published by farmers."
            />

            <QuickLink
              href="/admin/reports"
              title="Reports"
              description="View platform orders, revenue and activity reports."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">
            {title}
          </p>

          {loading ? (
            <div className="mt-3 h-8 w-16 animate-pulse rounded bg-[#E5E7EB]" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-[#1F2937]">
              {value.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#E5E7EB] bg-white p-5 transition hover:border-[#86EFAC]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[#1F2937]">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#6B7280]">
            {description}
          </p>
        </div>

        <ArrowRight
          size={18}
          className="mt-1 shrink-0 text-[#166534] transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}