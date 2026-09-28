"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Banknote,
  Boxes,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import FarmerApprovalNotice from "@/components/farmer/FarmerApprovalNotice";


// ======================================================
// TYPES
// ======================================================

interface BestSeller {
  productId?: string;
  name: string;
  quantitySold: number;
  revenue?: number;
}


interface DashboardStats {
  totalProducts: number;
  totalOrders: number;

  placedOrders: number;
  acceptedOrders: number;
  readyOrders: number;
  completedOrders: number;

  totalRevenue: number;

  bestSellingProducts:
    BestSeller[];
}


// ======================================================
// DEFAULT
// ======================================================

const initialStats:
  DashboardStats = {
  totalProducts: 0,

  totalOrders: 0,

  placedOrders: 0,

  acceptedOrders: 0,

  readyOrders: 0,

  completedOrders: 0,

  totalRevenue: 0,

  bestSellingProducts: [],
};


// ======================================================
// PAGE
// ======================================================

export default function FarmerDashboardPage() {
  const {
    user,
    farmerProfile,
  } = useAuth();

  const [
    stats,
    setStats,
  ] =
    useState<DashboardStats>(
      initialStats
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ================================================
  // LOAD DASHBOARD
  // ================================================

  useEffect(() => {
    const loadDashboard =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/farmers/dashboard"
            );


          /*
           * Normalize response here.
           *
           * That way our components do not care
           * whether backend calls it placed,
           * placedOrders or pendingOrders.
           */

          const data =
            response.data
              .dashboard ||
            response.data
              .stats ||
            response.data;


          setStats({
            totalProducts:
              data.totalProducts ??
              0,

            totalOrders:
              data.totalOrders ??
              0,

            placedOrders:
              data.placedOrders ??
              data.placed ??
              data.pendingOrders ??
              data.pending ??
              0,

            acceptedOrders:
              data.acceptedOrders ??
              data.accepted ??
              0,

            readyOrders:
              data.readyOrders ??
              data.ready ??
              0,

            completedOrders:
              data.completedOrders ??
              data.completed ??
              0,

            totalRevenue:
              data.totalRevenue ??
              data.revenue ??
              0,

            bestSellingProducts:
              data.bestSellingProducts ??
              data.bestSellers ??
              [],
          });
        } catch (error: any) {
          console.error(
            "Farmer dashboard error:",
            error
          );

          setError(
            error?.response
              ?.data?.message ||
              "Unable to load dashboard statistics."
          );
        } finally {
          setLoading(false);
        }
      };


    loadDashboard();
  }, []);


  return (
    <div>

      {/* =============================================
          HEADER
      ============================================== */}

      <header className="border-b border-[#E5E7EB] bg-white">

        <div className="px-5 py-7 sm:px-8 lg:px-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Farmer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
            Welcome back,{" "}
            {farmerProfile
              ?.contactPerson ||
              user?.name ||
              "Farmer"}
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Manage your MarketLink
            stall, inventory and
            customer preorders.
          </p>

        </div>

      </header>


      <div className="space-y-8 p-5 sm:p-8 lg:p-10">

        {/* APPROVAL */}

        <FarmerApprovalNotice />


        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* =========================================
            STATS
        ========================================== */}

        {loading ? (
          <StatsLoading />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Products"
              value={
                stats.totalProducts
              }
              icon={
                <Boxes
                  size={21}
                />
              }
              description="Current inventory"
            />

            <StatCard
              title="Total Orders"
              value={
                stats.totalOrders
              }
              icon={
                <ShoppingBag
                  size={21}
                />
              }
              description="All preorders"
            />

            <StatCard
              title="Ready for Pickup"
              value={
                stats.readyOrders
              }
              icon={
                <PackageCheck
                  size={21}
                />
              }
              description="Waiting for customers"
            />

            <StatCard
              title="Completed Revenue"
              value={`PKR ${stats.totalRevenue.toLocaleString()}`}
              icon={
                <Banknote
                  size={21}
                />
              }
              description="Completed orders"
            />

          </div>
        )}


        {/* =========================================
            ORDER PIPELINE
        ========================================== */}

        <section>

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                Preorders
              </p>

              <h2 className="mt-1 text-xl font-bold text-[#1F2937]">
                Order Pipeline
              </h2>

            </div>


            <Link
              href="/farmer/orders"
              className="flex items-center gap-2 text-sm font-semibold text-[#166534] hover:underline"
            >
              Manage Orders

              <ArrowRight
                size={16}
              />
            </Link>

          </div>


          {loading ? (
            <div className="mt-5 h-36 animate-pulse rounded-2xl bg-[#E5E7EB]" />
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <PipelineCard
                title="Placed"
                value={
                  stats.placedOrders
                }
                icon={
                  <Clock3
                    size={18}
                  />
                }
                className="bg-[#FFFBEB] text-[#92400E]"
              />

              <PipelineCard
                title="Accepted"
                value={
                  stats.acceptedOrders
                }
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
                className="bg-blue-50 text-blue-700"
              />

              <PipelineCard
                title="Ready"
                value={
                  stats.readyOrders
                }
                icon={
                  <PackageCheck
                    size={18}
                  />
                }
                className="bg-[#F0FDF4] text-[#166534]"
              />

              <PipelineCard
                title="Completed"
                value={
                  stats.completedOrders
                }
                icon={
                  <TrendingUp
                    size={18}
                  />
                }
                className="bg-[#DCFCE7] text-[#14532D]"
              />

            </div>
          )}

        </section>


        {/* =========================================
            LOWER GRID
        ========================================== */}

        <div className="grid gap-7 xl:grid-cols-[1fr_360px]">


          {/* BEST SELLERS */}

          <section className="rounded-2xl border border-[#E5E7EB] bg-white">

            <div className="border-b border-[#E5E7EB] px-6 py-5">

              <h2 className="font-semibold text-[#1F2937]">
                Best Selling Products
              </h2>

              <p className="mt-1 text-sm text-[#6B7280]">
                Your most ordered
                products from
                completed orders.
              </p>

            </div>


            {loading ? (
              <div className="space-y-4 p-6">

                {Array.from({
                  length: 3,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-14 animate-pulse rounded-xl bg-[#E5E7EB]"
                    />
                  )
                )}

              </div>
            ) : stats
                .bestSellingProducts
                .length === 0 ? (
              <div className="px-6 py-14 text-center">

                <TrendingUp
                  size={32}
                  className="mx-auto text-[#166534]"
                />

                <p className="mt-4 font-medium text-[#1F2937]">
                  No sales data yet
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  Best sellers will
                  appear after
                  completed orders.
                </p>

              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">

                {stats.bestSellingProducts.map(
                  (
                    product,
                    index
                  ) => (
                    <div
                      key={
                        product.productId ||
                        `${product.name}-${index}`
                      }
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCFCE7] text-sm font-bold text-[#166534]">
                          {index +
                            1}
                        </div>

                        <div>

                          <p className="font-medium text-[#1F2937]">
                            {
                              product.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-[#6B7280]">
                            {
                              product.quantitySold
                            }{" "}
                            units sold
                          </p>

                        </div>

                      </div>


                      {product.revenue !==
                        undefined && (
                        <span className="text-sm font-semibold text-[#166534]">
                          PKR{" "}
                          {product.revenue.toLocaleString()}
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

          </section>


          {/* QUICK ACTIONS */}

          <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

            <h2 className="font-semibold text-[#1F2937]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              Common farmer tasks.
            </p>


            <div className="mt-6 space-y-3">

              <QuickAction
                href="/farmer/products"
                icon={
                  <Boxes
                    size={18}
                  />
                }
                title="Manage Products"
                description="Update stock and products"
              />

              <QuickAction
                href="/farmer/orders"
                icon={
                  <ShoppingBag
                    size={18}
                  />
                }
                title="Manage Orders"
                description="Process customer preorders"
              />

              <QuickAction
                href="/farmer/markets"
                icon={
                  <Store
                    size={18}
                  />
                }
                title="Market Schedule"
                description="Manage pickup locations"
              />

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// STAT CARD
// ======================================================

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value:
    | string
    | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-[#6B7280]">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#1F2937]">
            {value}
          </p>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>

      </div>


      <p className="mt-3 text-xs text-[#9CA3AF]">
        {description}
      </p>

    </article>
  );
}


// ======================================================
// PIPELINE CARD
// ======================================================

function PipelineCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${className}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold text-[#1F2937]">
        {value}
      </p>

      <p className="mt-1 text-sm text-[#6B7280]">
        {title}
      </p>

    </article>
  );
}


// ======================================================
// QUICK ACTION
// ======================================================

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] p-4 transition hover:border-[#86EFAC] hover:bg-[#F0FDF4]"
    >

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#166534]">
        {icon}
      </div>


      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-[#1F2937]">
          {title}
        </p>

        <p className="mt-0.5 truncate text-xs text-[#6B7280]">
          {description}
        </p>

      </div>


      <ArrowRight
        size={16}
        className="shrink-0 text-[#9CA3AF]"
      />

    </Link>
  );
}


// ======================================================
// LOADING
// ======================================================

function StatsLoading() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

      {Array.from({
        length: 4,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-[#E5E7EB]"
          />
        )
      )}

    </div>
  );
}