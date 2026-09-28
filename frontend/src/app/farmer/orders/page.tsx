"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  PackageCheck,
  RefreshCcw,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";

import api from "@/lib/api";

import FarmerApprovalNotice from "@/components/farmer/FarmerApprovalNotice";

import {
  Order,
  OrderStatus,
} from "@/types/order";


type FilterStatus =
  | "all"
  | OrderStatus;


const FILTERS: {
  label: string;
  value: FilterStatus;
}[] = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Placed",
    value: "placed",
  },
  {
    label: "Accepted",
    value: "accepted",
  },
  {
    label: "Ready",
    value: "ready",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Declined",
    value: "declined",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];


export default function FarmerOrdersPage() {
  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    status,
    setStatus,
  ] =
    useState<FilterStatus>(
      "all"
    );

  const [
    search,
    setSearch,
  ] = useState("");


  // ================================================
  // LOAD
  // ================================================

  const loadOrders =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/orders/farmer"
          );

        const raw =
          response.data.orders ||
          response.data.data ||
          response.data ||
          [];

        setOrders(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response
            ?.data?.message ||
            "Unable to load preorders."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadOrders();
  }, [loadOrders]);


  // ================================================
  // FILTER
  // ================================================

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const statusMatch =
            status === "all" ||
            order.status ===
              status;

          const customerName =
            typeof order.customer ===
            "string"
              ? ""
              : order.customer
                  ?.name || "";

          const marketName =
            order.market?.name ||
            "";

          const productNames =
            order.items
              .map(
                (item) =>
                  item.name
              )
              .join(" ");

          const searchText =
            `${order._id} ${customerName} ${marketName} ${productNames}`.toLowerCase();

          const searchMatch =
            !query ||
            searchText.includes(
              query
            );

          return (
            statusMatch &&
            searchMatch
          );
        }
      );
    }, [
      orders,
      status,
      search,
    ]);


  // ================================================
  // COUNTS
  // ================================================

  const counts =
    useMemo(() => {
      return {
        total:
          orders.length,

        placed:
          orders.filter(
            (order) =>
              order.status ===
              "placed"
          ).length,

        accepted:
          orders.filter(
            (order) =>
              order.status ===
              "accepted"
          ).length,

        ready:
          orders.filter(
            (order) =>
              order.status ===
              "ready"
          ).length,

        completed:
          orders.filter(
            (order) =>
              order.status ===
              "completed"
          ).length,
      };
    }, [orders]);


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Preorders
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Order Management
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Review incoming
              preorders and prepare
              them for customer
              pickup.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadOrders
            }
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#166534] transition hover:bg-[#DCFCE7] disabled:opacity-50"
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


      <div className="space-y-7 p-5 sm:p-8 lg:p-10">
        <FarmerApprovalNotice />


        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Orders"
            value={counts.total}
            icon={
              <ShoppingBag size={20} />
            }
          />

          <StatCard
            label="New"
            value={counts.placed}
            icon={
              <Clock3 size={20} />
            }
          />

          <StatCard
            label="Accepted"
            value={
              counts.accepted
            }
            icon={
              <CheckCircle2
                size={20}
              />
            }
          />

          <StatCard
            label="Ready"
            value={counts.ready}
            icon={
              <PackageCheck
                size={20}
              />
            }
          />

          <StatCard
            label="Completed"
            value={
              counts.completed
            }
            icon={
              <CheckCircle2
                size={20}
              />
            }
          />
        </div>


        {/* FILTERS */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center rounded-xl border border-[#E5E7EB] px-4">
              <Search
                size={18}
                className="shrink-0 text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search customer, product, market or order ID..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>


            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map(
                (filter) => {
                  const active =
                    status ===
                    filter.value;

                  return (
                    <button
                      key={
                        filter.value
                      }
                      type="button"
                      onClick={() =>
                        setStatus(
                          filter.value
                        )
                      }
                      className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[#166534] bg-[#DCFCE7] text-[#166534]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#86EFAC]"
                      }`}
                    >
                      {
                        filter.label
                      }

                      {filter.value !==
                        "all" && (
                        <span className="ml-2 opacity-70">
                          {
                            orders.filter(
                              (
                                order
                              ) =>
                                order.status ===
                                filter.value
                            ).length
                          }
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </section>


        {/* ORDERS */}

        {loading ? (
          <OrdersLoading />
        ) : filteredOrders.length ===
          0 ? (
          <section className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
            <ShoppingBag
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
              {orders.length ===
              0
                ? "No preorders yet"
                : "No matching orders"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              {orders.length ===
              0
                ? "Customer preorders will appear here when they reserve products from your stall."
                : "Try changing the selected status or search."}
            </p>
          </section>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(
              (order) => (
                <OrderCard
                  key={
                    order._id
                  }
                  order={
                    order
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ======================================================
// ORDER CARD
// ======================================================

function OrderCard({
  order,
}: {
  order: Order;
}) {
  const customerName =
    typeof order.customer ===
    "string"
      ? "Customer"
      : order.customer?.name ||
        "Customer";

  const itemCount =
    order.items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white transition hover:border-[#BBF7D0]">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge
              status={
                order.status
              }
            />

            <span className="text-xs text-[#9CA3AF]">
              #
              {order._id.slice(
                -8
              )}
            </span>
          </div>


          <h2 className="mt-3 text-lg font-semibold text-[#1F2937]">
            {customerName}
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}{" "}
            • PKR{" "}
            {order.totalAmount.toLocaleString()}
          </p>


          <div className="mt-4 grid gap-2 text-sm text-[#6B7280] sm:grid-cols-2 lg:grid-cols-3">
            <span>
              <strong className="font-medium text-[#1F2937]">
                Market:
              </strong>{" "}
              {order.market
                ?.name ||
                "—"}
            </span>

            <span>
              <strong className="font-medium text-[#1F2937]">
                Pickup:
              </strong>{" "}
              {formatDate(
                order.pickupDate
              )}
            </span>

            <span>
              <strong className="font-medium text-[#1F2937]">
                Time:
              </strong>{" "}
              {
                order
                  .pickupSlot
                  .startTime
              }{" "}
              –{" "}
              {
                order
                  .pickupSlot
                  .endTime
              }
            </span>
          </div>
        </div>


        <Link
          href={`/farmer/orders/${order._id}`}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#166534] px-4 py-2.5 text-sm font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
        >
          View Order

          <ChevronRight
            size={16}
          />
        </Link>
      </div>
    </article>
  );
}


// ======================================================
// STATUS
// ======================================================

function StatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles: Record<
    OrderStatus,
    string
  > = {
    placed:
      "bg-amber-100 text-amber-800",

    accepted:
      "bg-blue-100 text-blue-700",

    ready:
      "bg-[#DCFCE7] text-[#166534]",

    completed:
      "bg-[#166534] text-white",

    cancelled:
      "bg-gray-100 text-[#6B7280]",

    declined:
      "bg-red-100 text-[#DC2626]",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}


// ======================================================
// STAT
// ======================================================

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[#6B7280]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#1F2937]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>
      </div>
    </div>
  );
}


// ======================================================
// DATE
// ======================================================

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


// ======================================================
// LOADING
// ======================================================

function OrdersLoading() {
  return (
    <div className="space-y-4">
      {Array.from({
        length: 5,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl bg-[#E5E7EB]"
          />
        )
      )}
    </div>
  );
}