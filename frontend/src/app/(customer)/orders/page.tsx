"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Link from "next/link";

import {
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShoppingBasket,
  Store,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Order,
  OrderStatus,
} from "@/types/order";


export default function OrdersPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const {
    user,
    loading:
    authLoading,
  } = useAuth();

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


  const created =
    searchParams.get(
      "created"
    ) === "true";


  // ====================================================
  // AUTH
  // ====================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/orders"
      );

      return;
    }

    if (
      user.role !==
      "customer"
    ) {
      router.replace("/");
    }
  }, [
    user,
    authLoading,
    router,
  ]);


  // ====================================================
  // LOAD ORDERS
  // ====================================================

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      user.role !==
      "customer"
    ) {
      return;
    }

    const loadOrders =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/orders/mine"
            );

          setOrders(
            response.data.orders ||
            []
          );
        } catch (error) {
          console.error(
            error
          );

          setError(
            "Unable to load your orders."
          );
        } finally {
          setLoading(false);
        }
      };

    loadOrders();
  }, [
    user,
    authLoading,
  ]);


  if (
    authLoading ||
    loading
  ) {
    return (
      <OrdersLoading />
    );
  }


  if (
    !user ||
    user.role !==
    "customer"
  ) {
    return null;
  }


  return (
    <div>

      {/* HEADER */}

      <section className="border-b border-[#E5E7EB] bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Your preorders
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
            My Orders
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Track your market
            pickups and previous
            orders.
          </p>

        </div>

      </section>


      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

        {/* SUCCESS */}

        {created && (
          <div className="mb-7 flex items-start gap-3 rounded-xl border border-green-200 bg-[#F0FDF4] p-4">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-[#166534]"
            />

            <div>

              <p className="font-medium text-[#166534]">
                Preorder placed successfully
              </p>

              <p className="mt-1 text-sm text-[#6B7280]">
                Your preorder has
                been sent to the
                farmer.
              </p>

            </div>

          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!error &&
          orders.length ===
          0 && (
            <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white py-16 text-center">

              <ShoppingBasket
                size={42}
                className="mx-auto text-[#166534]"
              />

              <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
                No preorders yet
              </h2>

              <p className="mt-2 text-sm text-[#6B7280]">
                Your market
                preorders will
                appear here.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-flex rounded-xl bg-[#166534] px-6 py-3 font-medium text-white"
              >
                Browse Marketplace
              </Link>

            </div>
          )}


        {/* ORDERS */}

        <div className="space-y-6">

          {orders.map(
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

      </section>

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
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">

      {/* TOP */}

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E7EB] bg-[#FAFAF7] px-6 py-4">

        <div>

          <p className="text-xs uppercase tracking-wide text-[#6B7280]">
            Order #
            {order._id.slice(
              -8
            )}
          </p>

          <p className="mt-1 text-sm text-[#6B7280]">
            {new Date(
              order.createdAt
            ).toLocaleDateString()}
          </p>

        </div>


        <OrderStatusBadge
          status={
            order.status
          }
        />

      </div>


      <div className="p-6">

        {/* FARMER */}

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
            <Store
              size={19}
            />
          </div>

          <div>

            <p className="text-xs text-[#6B7280]">
              Farmer
            </p>

            <p className="font-semibold text-[#1F2937]">
              {order.farmer
                ?.stallName ||
                "Farmer"}
            </p>

          </div>

        </div>


        {/* ITEMS */}

        <div className="mt-6 space-y-3 border-y border-[#E5E7EB] py-5">

          {order.items.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  index
                }
                className="flex justify-between gap-4 text-sm"
              >

                <span className="text-[#1F2937]">
                  {item.name}{" "}
                  <span className="text-[#6B7280]">
                    ×{" "}
                    {
                      item.quantity
                    }
                  </span>
                </span>

                <span className="font-medium text-[#1F2937]">
                  PKR{" "}
                  {item.subtotal.toLocaleString()}
                </span>

              </div>
            )
          )}

        </div>


        {/* PICKUP */}

        <div className="mt-5 grid gap-4 sm:grid-cols-3">

          <div className="flex items-start gap-2">

            <MapPin
              size={17}
              className="mt-0.5 shrink-0 text-[#166534]"
            />

            <div>
              <p className="text-xs text-[#6B7280]">
                Market
              </p>

              <p className="mt-1 text-sm font-medium text-[#1F2937]">
                {order.market
                  ?.name ||
                  "Market"}
              </p>
            </div>

          </div>


          <div className="flex items-start gap-2">

            <CalendarDays
              size={17}
              className="mt-0.5 shrink-0 text-[#166534]"
            />

            <div>
              <p className="text-xs text-[#6B7280]">
                Pickup Date
              </p>

              <p className="mt-1 text-sm font-medium text-[#1F2937]">
                {new Date(
                  order.pickupDate
                ).toLocaleDateString()}
              </p>
            </div>

          </div>


          <div className="flex items-start gap-2">

            <Clock
              size={17}
              className="mt-0.5 shrink-0 text-[#166534]"
            />

            <div>
              <p className="text-xs text-[#6B7280]">
                Pickup Time
              </p>

              <p className="mt-1 text-sm font-medium text-[#1F2937]">
                {
                  order.pickupSlot
                    .startTime
                }{" "}
                –{" "}
                {
                  order.pickupSlot
                    .endTime
                }
              </p>
            </div>

          </div>

        </div>


        {/* TOTAL */}

        <div className="mt-6 flex items-center justify-between border-t border-[#E5E7EB] pt-5">

          <div>

            <p className="text-xs text-[#6B7280]">
              Payment
            </p>

            <p className="mt-1 text-sm font-medium text-[#166534]">
              Pay at pickup
            </p>

          </div>


          <div className="text-right">

            <p className="text-xs text-[#6B7280]">
              Total
            </p>

            <p className="mt-1 text-xl font-bold text-[#166534]">
              PKR{" "}
              {order.totalAmount.toLocaleString()}
            </p>

          </div>

        </div>

      </div>


    </article>
  );
}


// ======================================================
// STATUS BADGE
// ======================================================

function OrderStatusBadge({
  status,
}: {
  status: OrderStatus;
}) {
  const styles:
    Record<
      OrderStatus,
      string
    > = {
    placed:
      "bg-[#FEF3C7] text-[#92400E]",

    accepted:
      "bg-blue-100 text-blue-700",

    ready:
      "bg-[#DCFCE7] text-[#166534]",

    completed:
      "bg-[#166534] text-white",

    cancelled:
      "bg-gray-100 text-gray-600",

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
// LOADING
// ======================================================

function OrdersLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="h-10 w-48 animate-pulse rounded bg-[#E5E7EB]" />

      <div className="mt-10 space-y-6">

        {Array.from({
          length: 3,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl bg-[#E5E7EB]"
            />
          )
        )}

      </div>

    </div>
  );
}

