"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  BarChart3,
  CheckCircle2,
  RefreshCcw,
  ShoppingBag,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";

import api from "@/lib/api";

// ======================================================
// TYPES
// ======================================================

type OrderStatus =
  | "placed"
  | "accepted"
  | "ready"
  | "completed"
  | "cancelled"
  | "declined";

interface OrderStatusStat {
  _id: OrderStatus;
  count: number;
}

interface ActiveFarmer {
  _id: string;
  totalOrders: number;
  completedOrders: number;
  stallName: string;
}

interface ReportData {
  orderStatusStats: OrderStatusStat[];
  totalRevenue: number;
  averageOrderValue: number;
  activeFarmers: ActiveFarmer[];
}

// ======================================================
// PAGE
// ======================================================

export default function AdminReportsPage() {
  const [report, setReport] =
    useState<ReportData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ====================================================
  // LOAD REPORT
  // ====================================================

  const loadReport =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/reports"
          );

        const data =
          response.data.reports;

        setReport(data);
      } catch (error: any) {
        console.error(
          "Report loading error:",
          error
        );

        setError(
          error?.response?.data
            ?.message ||
            "Unable to load reports."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-[#E5E7EB]"
            />
          ))}
        </div>

        <div className="mt-7 h-72 animate-pulse rounded-2xl bg-[#E5E7EB]" />

        <div className="mt-7 h-72 animate-pulse rounded-2xl bg-[#E5E7EB]" />
      </div>
    );
  }

  // ====================================================
  // FALLBACK DATA
  // ====================================================

  const data: ReportData =
    report || {
      orderStatusStats: [],
      totalRevenue: 0,
      averageOrderValue: 0,
      activeFarmers: [],
    };

  // ====================================================
  // STATUS HELPER
  // ====================================================

  const getStatusCount = (
    status: OrderStatus
  ) => {
    return (
      data.orderStatusStats.find(
        (item) =>
          item._id === status
      )?.count || 0
    );
  };

  const placed =
    getStatusCount("placed");

  const accepted =
    getStatusCount("accepted");

  const ready =
    getStatusCount("ready");

  const completed =
    getStatusCount("completed");

  const cancelled =
    getStatusCount("cancelled");

  const declined =
    getStatusCount("declined");

  // ====================================================
  // TOTAL ORDERS
  // ====================================================

  const totalOrders =
    data.orderStatusStats.reduce(
      (total, item) =>
        total + item.count,
      0
    );

  const completionRate =
    totalOrders > 0
      ? Math.round(
          (completed /
            totalOrders) *
            100
        )
      : 0;

  // ====================================================
  // UI
  // ====================================================

  return (
    <div>
      {/* =============================================
          HEADER
      ============================================== */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Analytics
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Reports
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Platform order,
              revenue and farmer
              activity overview.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReport}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
          >
            <RefreshCcw
              size={16}
            />

            Refresh
          </button>
        </div>
      </header>

      {/* =============================================
          CONTENT
      ============================================== */}

      <div className="space-y-7 p-5 sm:p-8 lg:p-10">

        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {/* =========================================
            MAIN STATS
        ========================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportCard
            title="Total Orders"
            value={totalOrders}
            icon={
              <ShoppingBag
                size={21}
              />
            }
          />

          <ReportCard
            title="Completed Orders"
            value={completed}
            icon={
              <CheckCircle2
                size={21}
              />
            }
          />

          <ReportCard
            title="Total Revenue"
            value={`PKR ${Number(
              data.totalRevenue ||
                0
            ).toLocaleString()}`}
            icon={
              <Wallet
                size={21}
              />
            }
          />

          <ReportCard
            title="Average Order Value"
            value={`PKR ${Number(
              data.averageOrderValue ||
                0
            ).toLocaleString()}`}
            icon={
              <TrendingUp
                size={21}
              />
            }
          />
        </div>

        {/* =========================================
            SECONDARY STATS
        ========================================== */}

        <div className="grid gap-4 sm:grid-cols-2">
          <ReportCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={
              <TrendingUp
                size={21}
              />
            }
          />

          <ReportCard
            title="Active Farmers"
            value={
              data.activeFarmers
                .length
            }
            icon={
              <Store
                size={21}
              />
            }
          />
        </div>

        {/* =========================================
            ORDER BREAKDOWN
        ========================================== */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
              <BarChart3
                size={19}
              />
            </div>

            <div>
              <h2 className="font-semibold text-[#1F2937]">
                Order Breakdown
              </h2>

              <p className="text-sm text-[#6B7280]">
                Current order
                lifecycle across
                MarketLink.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatusBox
              label="Placed"
              value={placed}
            />

            <StatusBox
              label="Accepted"
              value={accepted}
            />

            <StatusBox
              label="Ready"
              value={ready}
            />

            <StatusBox
              label="Completed"
              value={completed}
            />

            <StatusBox
              label="Cancelled"
              value={cancelled}
            />

            <StatusBox
              label="Declined"
              value={declined}
            />
          </div>
        </section>

        {/* =========================================
            ACTIVE FARMERS
        ========================================== */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
              <Store
                size={19}
              />
            </div>

            <div>
              <h2 className="font-semibold text-[#1F2937]">
                Most Active
                Farmers
              </h2>

              <p className="text-sm text-[#6B7280]">
                Farmers with the
                highest order
                activity.
              </p>
            </div>
          </div>

          {!data.activeFarmers
            .length ? (
            <div className="mt-6 rounded-xl bg-[#FAFAF7] py-12 text-center text-sm text-[#6B7280]">
              No farmer activity
              available yet.
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-[#E5E7EB]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead className="bg-[#FAFAF7] text-left text-xs uppercase tracking-wide text-[#6B7280]">
                    <tr>
                      <th className="px-5 py-4">
                        #
                      </th>

                      <th className="px-5 py-4">
                        Farmer
                      </th>

                      <th className="px-5 py-4">
                        Total Orders
                      </th>

                      <th className="px-5 py-4">
                        Completed
                        Orders
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E5E7EB]">
                    {data.activeFarmers.map(
                      (
                        farmer,
                        index
                      ) => (
                        <tr
                          key={
                            farmer._id
                          }
                          className="transition hover:bg-[#FAFAF7]"
                        >
                          <td className="px-5 py-4 font-semibold text-[#166534]">
                            {index +
                              1}
                          </td>

                          <td className="px-5 py-4 font-medium text-[#1F2937]">
                            {
                              farmer.stallName
                            }
                          </td>

                          <td className="px-5 py-4 text-[#6B7280]">
                            {
                              farmer.totalOrders
                            }
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-semibold text-[#166534]">
                              {
                                farmer.completedOrders
                              }
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* =========================================
            REVENUE NOTE
        ========================================== */}

        <div className="rounded-2xl border border-green-200 bg-[#F0FDF4] p-5">
          <div className="flex gap-3">
            <Wallet
              size={19}
              className="mt-0.5 shrink-0 text-[#166534]"
            />

            <p className="text-sm leading-6 text-[#166534]">
              Revenue represents
              the value of completed
              preorders. MarketLink
              does not process
              payments online;
              customers pay farmers
              directly at pickup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// REPORT CARD
// ======================================================

function ReportCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#6B7280]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#1F2937]">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// STATUS BOX
// ======================================================

function StatusBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#F3F4F6] bg-[#FAFAF7] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#1F2937]">
        {value}
      </p>
    </div>
  );
}