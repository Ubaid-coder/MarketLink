"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCcw,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Order,
  OrderStatus,
} from "@/types/order";


export default function FarmerOrderDetailsPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const id =
    params.id as string;

  const {
    farmerProfile,
  } = useAuth();

  const [
    order,
    setOrder,
  ] =
    useState<Order | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    declineOpen,
    setDeclineOpen,
  ] = useState(false);

  const [
    declineReason,
    setDeclineReason,
  ] = useState("");


  const approved =
    farmerProfile
      ?.approvalStatus ===
    "approved";


  // ================================================
  // LOAD
  // ================================================

  const loadOrder =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * We currently don't have:
         *
         * GET /orders/farmer/:id
         *
         * so use the existing farmer
         * orders endpoint and find this
         * order.
         */
        const response =
          await api.get(
            "/orders/farmer"
          );

        const raw =
          response.data.orders ||
          response.data.data ||
          response.data ||
          [];

        const orders: Order[] =
          Array.isArray(raw)
            ? raw
            : [];

        const found =
          orders.find(
            (item) =>
              item._id === id
          );

        if (!found) {
          setOrder(null);

          setError(
            "Order not found."
          );

          return;
        }

        setOrder(found);
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response
            ?.data?.message ||
            "Unable to load this order."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);


  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [
    id,
    loadOrder,
  ]);


  // ================================================
  // UPDATE STATUS
  // ================================================

  const updateStatus =
    async (
      status: OrderStatus,
      reason?: string
    ) => {
      if (
        !order ||
        !approved
      ) {
        return;
      }

      try {
        setUpdating(true);
        setError("");

        /*
         * If your controller uses
         * cancellationReason or reason
         * under a different property,
         * keep the property expected by
         * your backend.
         */
        const payload: {
          status: OrderStatus;
          reason?: string;
        } = {
          status,
        };

        if (reason?.trim()) {
          payload.reason =
            reason.trim();
        }


        const response =
          await api.patch(
            `/orders/farmer/${order._id}/status`,
            payload
          );


        const updated =
          response.data.order ||
          response.data.data ||
          response.data;


        if (
          updated &&
          updated._id
        ) {
          setOrder(updated);
        } else {
          await loadOrder();
        }


        setDeclineOpen(false);
        setDeclineReason("");
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response
            ?.data?.message ||
            "Unable to update order status."
        );
      } finally {
        setUpdating(false);
      }
    };


  // ================================================
  // LOADING
  // ================================================

  if (loading) {
    return (
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="space-y-5">
          <div className="h-10 w-56 animate-pulse rounded bg-[#E5E7EB]" />

          <div className="h-52 animate-pulse rounded-2xl bg-[#E5E7EB]" />

          <div className="h-72 animate-pulse rounded-2xl bg-[#E5E7EB]" />
        </div>
      </div>
    );
  }


  if (!order) {
    return (
      <div className="p-5 sm:p-8 lg:p-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <ShoppingBag
            size={40}
            className="mx-auto text-[#DC2626]"
          />

          <h1 className="mt-4 text-xl font-semibold text-[#1F2937]">
            Order not found
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            {error}
          </p>

          <Link
            href="/farmer/orders"
            className="mt-5 inline-flex font-semibold text-[#166534]"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }


  const customer =
    typeof order.customer ===
    "string"
      ? null
      : order.customer;


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="px-5 py-7 sm:px-8 lg:px-10">
          <Link
            href="/farmer/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            Preorders
          </Link>


          <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-[#1F2937]">
                  Order #
                  {order._id.slice(
                    -8
                  )}
                </h1>

                <StatusBadge
                  status={
                    order.status
                  }
                />
              </div>

              <p className="mt-2 text-[#6B7280]">
                Placed{" "}
                {formatDateTime(
                  order.createdAt
                )}
              </p>
            </div>


            <button
              type="button"
              disabled={
                loading ||
                updating
              }
              onClick={
                loadOrder
              }
              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
            >
              <RefreshCcw
                size={16}
              />

              Refresh
            </button>
          </div>
        </div>
      </header>


      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {!approved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Your farmer account must
            be approved before you can
            process customer orders.
          </div>
        )}


        {/* ============================================
            ACTIONS
        ============================================= */}

        <OrderActions
          status={
            order.status
          }
          disabled={
            updating ||
            !approved
          }
          onAccept={() =>
            updateStatus(
              "accepted"
            )
          }
          onDecline={() =>
            setDeclineOpen(
              true
            )
          }
          onReady={() =>
            updateStatus(
              "ready"
            )
          }
          onComplete={() =>
            updateStatus(
              "completed"
            )
          }
        />


        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            {/* ITEMS */}

            <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] px-6 py-5">
                <h2 className="font-semibold text-[#1F2937]">
                  Order Items
                </h2>
              </div>


              <div className="divide-y divide-[#E5E7EB]">
                {order.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-5 px-6 py-5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1F2937]">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-[#6B7280]">
                          {
                            item.quantity
                          }{" "}
                          × PKR{" "}
                          {item.price.toLocaleString()}{" "}
                          /{" "}
                          {
                            item.unit
                          }
                        </p>
                      </div>

                      <p className="shrink-0 font-semibold text-[#1F2937]">
                        PKR{" "}
                        {item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  )
                )}
              </div>


              <div className="flex justify-between border-t border-[#E5E7EB] bg-[#FAFAF7] px-6 py-5">
                <span className="font-semibold text-[#1F2937]">
                  Total
                </span>

                <span className="text-lg font-bold text-[#166534]">
                  PKR{" "}
                  {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </section>


            {/* CUSTOMER */}

            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <div className="flex items-center gap-2">
                <UserRound
                  size={19}
                  className="text-[#166534]"
                />

                <h2 className="font-semibold text-[#1F2937]">
                  Customer
                </h2>
              </div>


              {customer ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoItem
                    label="Name"
                    value={
                      customer.name
                    }
                  />

                  <InfoItem
                    label="Phone"
                    value={
                      customer.phone ||
                      "Not available"
                    }
                    icon={
                      <Phone
                        size={15}
                      />
                    }
                  />

                  <InfoItem
                    label="Email"
                    value={
                      customer.email ||
                      "Not available"
                    }
                    icon={
                      <Mail
                        size={15}
                      />
                    }
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#6B7280]">
                  Customer details
                  were not populated
                  by the API.
                </p>
              )}
            </section>


            {/* NOTE */}

            {order.customerNote && (
              <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="font-semibold text-[#1F2937]">
                  Customer Note
                </h2>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B7280]">
                  {
                    order.customerNote
                  }
                </p>
              </section>
            )}
          </div>


          {/* ============================================
              PICKUP
          ============================================= */}

          <div className="space-y-6">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="font-semibold text-[#1F2937]">
                Pickup Details
              </h2>


              <div className="mt-5 space-y-5">
                <PickupItem
                  icon={
                    <MapPin
                      size={18}
                    />
                  }
                  label="Market"
                  value={
                    order.market
                      ?.name ||
                    "Unknown market"
                  }
                />

                <PickupItem
                  icon={
                    <CalendarDays
                      size={18}
                    />
                  }
                  label="Pickup Date"
                  value={formatDate(
                    order.pickupDate
                  )}
                />

                <PickupItem
                  icon={
                    <Clock
                      size={18}
                    />
                  }
                  label="Pickup Time"
                  value={`${order.pickupSlot.startTime} – ${order.pickupSlot.endTime}`}
                />
              </div>


              {order.market
                ?.address && (
                <div className="mt-5 rounded-xl bg-[#FAFAF7] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Market Address
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[#1F2937]">
                    {
                      order.market
                        .address
                    }
                  </p>
                </div>
              )}
            </section>


            {/* PAYMENT */}

            <section className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-6">
              <p className="font-semibold text-[#166534]">
                Payment at Pickup
              </p>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                MarketLink does not
                process online
                payments. The customer
                pays the farmer in
                person when collecting
                the order.
              </p>
            </section>
          </div>
        </div>
      </div>


      {/* DECLINE MODAL */}

      {declineOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">
              <X size={20} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
              Decline preorder?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              The customer will be
              informed that this
              preorder cannot be
              fulfilled.
            </p>


            <label className="mt-5 block text-sm font-medium text-[#1F2937]">
              Reason
            </label>

            <textarea
              value={
                declineReason
              }
              onChange={(
                event
              ) =>
                setDeclineReason(
                  event.target
                    .value
                )
              }
              rows={3}
              placeholder="e.g. Required stock is no longer available."
              className="filter-input mt-2 resize-none"
            />


            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() => {
                  setDeclineOpen(
                    false
                  );

                  setDeclineReason(
                    ""
                  );
                }}
                className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#6B7280]"
              >
                Keep Order
              </button>

              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() =>
                  updateStatus(
                    "declined",
                    declineReason
                  )
                }
                className="rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {updating
                  ? "Declining..."
                  : "Decline"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ======================================================
// ACTIONS
// ======================================================

function OrderActions({
  status,
  disabled,
  onAccept,
  onDecline,
  onReady,
  onComplete,
}: {
  status: OrderStatus;

  disabled: boolean;

  onAccept: () => void;

  onDecline: () => void;

  onReady: () => void;

  onComplete: () => void;
}) {
  if (
    status === "cancelled" ||
    status === "declined" ||
    status === "completed"
  ) {
    return (
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <p className="text-sm text-[#6B7280]">
          This order is{" "}
          <strong className="capitalize text-[#1F2937]">
            {status}
          </strong>
          . No further action is
          available.
        </p>
      </section>
    );
  }


  if (status === "placed") {
    return (
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div>
          <p className="font-semibold text-amber-900">
            New preorder
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Review the products and
            either accept or decline
            this order.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={onDecline}
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#DC2626] disabled:opacity-40"
          >
            <X size={16} />
            Decline
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onAccept}
            className="flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            <Check size={16} />
            Accept Order
          </button>
        </div>
      </section>
    );
  }


  if (status === "accepted") {
    return (
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div>
          <p className="font-semibold text-blue-800">
            Order accepted
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Prepare the products and
            mark the order ready when
            the customer can collect
            it.
          </p>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={onReady}
          className="flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <PackageCheck
            size={17}
          />

          Mark Ready
        </button>
      </section>
    );
  }


  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-5">
      <div>
        <p className="font-semibold text-[#166534]">
          Ready for pickup
        </p>

        <p className="mt-1 text-sm text-[#6B7280]">
          After the customer collects
          the products and pays in
          person, complete the order.
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onComplete}
        className="flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        <CheckCircle2
          size={17}
        />

        Complete Order
      </button>
    </section>
  );
}


// ======================================================
// SMALL COMPONENTS
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


function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[#1F2937]">
        {icon && (
          <span className="text-[#166534]">
            {icon}
          </span>
        )}

        {value}
      </div>
    </div>
  );
}


function PickupItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 text-[#166534]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-[#1F2937]">
          {value}
        </p>
      </div>
    </div>
  );
}


function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatDateTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}