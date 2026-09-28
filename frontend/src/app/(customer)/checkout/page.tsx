"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBasket,
  Store,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useCart,
} from "@/context/CartContext";

import {
  CartGroup,
  MarketSchedule,
} from "@/types/marketplace";

import {
  CreateOrderPayload,
} from "@/types/order";


// ======================================================
// CHECKOUT SELECTION
// ======================================================

interface CheckoutSelection {
  marketId: string;

  pickupDate: string;

  pickupWindowIndex: string;

  customerNote: string;
}

type CheckoutSelections =
  Record<string, CheckoutSelection>;


// ======================================================
// PAGE
// ======================================================

export default function CheckoutPage() {
  const router =
    useRouter();

  const {
    user,
    loading:
    authLoading,
  } = useAuth();

  const {
    groups,
    cartCount,
    cartTotal,
    clearFarmerItems,
  } = useCart();

  const [
    selections,
    setSelections,
  ] =
    useState<CheckoutSelections>(
      {}
    );

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    completedOrders,
    setCompletedOrders,
  ] = useState<string[]>(
    []
  );


  // ====================================================
  // CUSTOMER PROTECTION
  // ====================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/checkout"
      );

      return;
    }

    if (
      user.role !==
      "customer"
    ) {
      if (
        user.role ===
        "farmer"
      ) {
        router.replace(
          "/farmer"
        );

        return;
      }

      if (
        user.role ===
        "admin"
      ) {
        router.replace(
          "/admin"
        );
      }
    }
  }, [
    user,
    authLoading,
    router,
  ]);


  // ====================================================
  // INITIALIZE SELECTIONS
  // ====================================================

  useEffect(() => {
    setSelections(
      (current) => {
        const next = {
          ...current,
        };

        groups.forEach(
          (group) => {
            if (
              !next[
              group.farmer._id
              ]
            ) {
              next[
                group.farmer._id
              ] = {
                marketId: "",
                pickupDate: "",
                pickupWindowIndex:
                  "",
                customerNote: "",
              };
            }
          }
        );

        return next;
      }
    );
  }, [groups]);


  // ====================================================
  // UPDATE SELECTION
  // ====================================================

  const updateSelection = (
    farmerId: string,
    key:
      keyof CheckoutSelection,
    value: string
  ) => {
    setSelections(
      (current) => ({
        ...current,

        [farmerId]: {
          ...(current[
            farmerId
          ] || {
            marketId: "",
            pickupDate: "",
            pickupWindowIndex:
              "",
            customerNote: "",
          }),

          [key]: value,
        },
      })
    );
  };


  // ====================================================
  // MARKET CHANGE
  // ====================================================

  const handleMarketChange = (
    farmerId: string,
    marketId: string
  ) => {
    setSelections(
      (current) => ({
        ...current,

        [farmerId]: {
          ...(current[
            farmerId
          ] || {
            customerNote: "",
          }),

          marketId,

          pickupDate: "",

          pickupWindowIndex:
            "",
        },
      })
    );
  };


  // ====================================================
  // VALIDATE
  // ====================================================

  const validateCheckout =
    () => {
      if (
        groups.length ===
        0
      ) {
        setError(
          "Your basket is empty."
        );

        return false;
      }

      for (const group of groups) {
        const selection =
          selections[
          group.farmer._id
          ];

        if (
          !selection
            ?.marketId
        ) {
          setError(
            `Please select a market for ${group.farmer.stallName}.`
          );

          return false;
        }

        if (
          !selection
            ?.pickupDate
        ) {
          setError(
            `Please select a pickup date for ${group.farmer.stallName}.`
          );

          return false;
        }

        if (
          selection
            .pickupWindowIndex ===
          ""
        ) {
          setError(
            `Please select a pickup time for ${group.farmer.stallName}.`
          );

          return false;
        }

        const schedule =
          getSelectedSchedule(
            group,
            selection.marketId
          );

        if (!schedule) {
          setError(
            `The selected market is unavailable for ${group.farmer.stallName}.`
          );

          return false;
        }

        if (
          !isValidPickupDay(
            selection.pickupDate,
            schedule.operatingDays
          )
        ) {
          setError(
            `The selected pickup date is not an operating day for ${group.farmer.stallName}.`
          );

          return false;
        }

        const windowIndex =
          Number(
            selection.pickupWindowIndex
          );

        if (
          !schedule
            .pickupWindows[
          windowIndex
          ]
        ) {
          setError(
            `Please select a valid pickup time for ${group.farmer.stallName}.`
          );

          return false;
        }
      }

      return true;
    };


  // ====================================================
  // PLACE ORDERS
  // ====================================================

  const placeOrders =
    async () => {
      setError("");

      if (
        !validateCheckout()
      ) {
        return;
      }

      setSubmitting(true);

      const successfulFarmerIds: string[] =
        [];

      try {
        /*
         * IMPORTANT:
         *
         * We create the orders sequentially.
         *
         * This makes partial-success handling much easier:
         *
         * Farmer A order succeeds
         * Farmer B fails
         *
         * → remove Farmer A from cart
         * → keep Farmer B in cart
         */

        for (const group of groups) {
          const farmerId =
            group.farmer._id;

          const selection =
            selections[
            farmerId
            ];

          const schedule =
            getSelectedSchedule(
              group,
              selection.marketId
            );

          if (!schedule) {
            throw new Error(
              "Invalid market schedule."
            );
          }

          const pickupWindow =
            schedule.pickupWindows[
            Number(
              selection.pickupWindowIndex
            )
            ];

          const payload: CreateOrderPayload =
          {
            farmer:
              farmerId,

            market:
              selection.marketId,

            items:
              group.items.map(
                (item) => ({
                  product:
                    item.product
                      ._id,

                  quantity:
                    item.quantity,
                })
              ),

            pickupDate:
              selection.pickupDate,

            pickupSlot: {
              startTime:
                pickupWindow.startTime,

              endTime:
                pickupWindow.endTime,
            },

            customerNote:
              selection.customerNote.trim() ||
              undefined,
          };

          console.log(
            "🔥 CREATE ORDER PAYLOAD:",
            JSON.stringify(payload, null, 2)
          );

          await api.post(
            "/orders",
            payload
          );

          successfulFarmerIds.push(
            farmerId
          );

          clearFarmerItems(
            farmerId
          );

          setCompletedOrders(
            (current) => [
              ...current,
              farmerId,
            ]
          );
        }

        router.push(
          "/orders?created=true"
        );
      } catch (error: any) {
        console.error(
          "Checkout failed:",
          error
        );

        const backendMessage =
          error?.response
            ?.data?.message;

        if (
          successfulFarmerIds.length >
          0
        ) {
          setError(
            backendMessage
              ? `${successfulFarmerIds.length} preorder(s) were created successfully, but another preorder failed: ${backendMessage}`
              : `${successfulFarmerIds.length} preorder(s) were created successfully, but another preorder failed. The remaining items are still in your basket.`
          );
        } else {
          setError(
            backendMessage ||
            "Unable to place your preorder. Please check your pickup information and try again."
          );
        }
      } finally {
        setSubmitting(
          false
        );
      }
    };


  // ====================================================
  // TOTAL
  // ====================================================

  const activeTotal =
    useMemo(
      () => cartTotal,
      [cartTotal]
    );


  // ====================================================
  // AUTH LOADING
  // ====================================================

  if (authLoading) {
    return (
      <CheckoutLoading />
    );
  }


  // ====================================================
  // WRONG ROLE
  // ====================================================

  if (
    !user ||
    user.role !==
    "customer"
  ) {
    return null;
  }


  // ====================================================
  // EMPTY
  // ====================================================

  if (
    groups.length === 0 &&
    completedOrders.length ===
    0
  ) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-[#D1D5DB] bg-white p-12 text-center">

          <ShoppingBasket
            size={42}
            className="mx-auto text-[#166534]"
          />

          <h1 className="mt-5 text-2xl font-bold text-[#1F2937]">
            Nothing to checkout
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Add some fresh
            produce to your
            basket first.
          </p>

          <Link
            href="/marketplace"
            className="mt-6 inline-flex rounded-xl bg-[#166534] px-6 py-3 font-medium text-white"
          >
            Browse Marketplace
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div>

      {/* =============================================
          HEADER
      ============================================== */}

      <section className="border-b border-[#E5E7EB] bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            Back to Basket
          </Link>


          <h1 className="mt-6 text-3xl font-bold text-[#1F2937]">
            Pickup Details
          </h1>

          <p className="mt-2 max-w-2xl text-[#6B7280]">
            Choose where and
            when you want to
            collect each
            farmer's preorder.
          </p>

        </div>

      </section>


      {/* =============================================
          CHECKOUT
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ERROR */}

        {error && (
          <div className="mb-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-[#DC2626]"
            />

            <p className="text-sm leading-6 text-[#DC2626]">
              {error}
            </p>

          </div>
        )}


        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">


          {/* =========================================
              FARMERS
          ========================================== */}

          <div className="space-y-7">

            {groups.map(
              (
                group,
                groupIndex
              ) => (
                <FarmerCheckoutCard
                  key={
                    group.farmer
                      ._id
                  }
                  group={
                    group
                  }
                  orderNumber={
                    groupIndex +
                    1
                  }
                  selection={
                    selections[
                    group
                      .farmer
                      ._id
                    ]
                  }
                  updateSelection={
                    updateSelection
                  }
                  handleMarketChange={
                    handleMarketChange
                  }
                />
              )
            )}

          </div>


          {/* =========================================
              SUMMARY
          ========================================== */}

          <aside>

            <div className="sticky top-24 rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <h2 className="text-lg font-semibold text-[#1F2937]">
                Preorder Summary
              </h2>


              <div className="mt-6 space-y-4 text-sm">

                <div className="flex justify-between text-[#6B7280]">

                  <span>
                    Items
                  </span>

                  <span>
                    {
                      cartCount
                    }
                  </span>

                </div>


                <div className="flex justify-between text-[#6B7280]">

                  <span>
                    Preorders
                  </span>

                  <span>
                    {
                      groups.length
                    }
                  </span>

                </div>


                <div className="flex justify-between text-[#6B7280]">

                  <span>
                    Payment
                  </span>

                  <span className="font-medium text-[#166534]">
                    At pickup
                  </span>

                </div>

              </div>


              <div className="my-6 border-t border-[#E5E7EB]" />


              <div className="flex items-center justify-between gap-3">

                <span className="font-semibold text-[#1F2937]">
                  Estimated Total
                </span>

                <span className="text-xl font-bold text-[#166534]">
                  PKR{" "}
                  {activeTotal.toLocaleString()}
                </span>

              </div>


              <div className="mt-5 rounded-xl bg-[#F0FDF4] p-4">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-[#166534]"
                  />

                  <p className="text-xs leading-5 text-[#166534]">
                    No payment will
                    be collected
                    online. Pay the
                    farmer when you
                    collect your
                    order.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={
                  placeOrders
                }
                disabled={
                  submitting
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3.5 font-medium text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Placing Preorder..."
                  : groups.length >
                    1
                    ? `Place ${groups.length} Preorders`
                    : "Place Preorder"}
              </button>


              <p className="mt-4 text-center text-xs leading-5 text-[#6B7280]">
                Stock and pricing
                are verified by the
                server when your
                preorder is placed.
              </p>

            </div>

          </aside>

        </div>

      </section>

    </div>
  );
}


// ======================================================
// FARMER CHECKOUT
// ======================================================

function FarmerCheckoutCard({
  group,
  orderNumber,
  selection,
  updateSelection,
  handleMarketChange,
}: {
  group: CartGroup;

  orderNumber: number;

  selection:
  | CheckoutSelection
  | undefined;

  updateSelection: (
    farmerId: string,
    key:
      keyof CheckoutSelection,
    value: string
  ) => void;

  handleMarketChange: (
    farmerId: string,
    marketId: string
  ) => void;
}) {
  const farmerId =
    group.farmer._id;


  const selectedSchedule =
    getSelectedSchedule(
      group,
      selection?.marketId ||
      ""
    );


  const farmerTotal =
    group.items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.product.price *
        item.quantity,
      0
    );


  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">

      {/* HEADER */}

      <div className="border-b border-[#E5E7EB] bg-[#F0FDF4] px-6 py-5">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
              <Store
                size={19}
              />
            </div>

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                Preorder{" "}
                #{orderNumber}
              </p>

              <h2 className="font-semibold text-[#1F2937]">
                {
                  group.farmer
                    .stallName
                }
              </h2>

            </div>

          </div>


          <span className="font-semibold text-[#166534]">
            PKR{" "}
            {farmerTotal.toLocaleString()}
          </span>

        </div>

      </div>


      <div className="p-6">

        {/* PRODUCTS */}

        <div className="space-y-3">

          {group.items.map(
            (item) => (
              <div
                key={
                  item.product
                    ._id
                }
                className="flex items-center justify-between gap-4 text-sm"
              >

                <div className="min-w-0">

                  <span className="font-medium text-[#1F2937]">
                    {
                      item.product
                        .name
                    }
                  </span>

                  <span className="ml-2 text-[#6B7280]">
                    ×{" "}
                    {
                      item.quantity
                    }
                  </span>

                </div>

                <span className="shrink-0 text-[#6B7280]">
                  PKR{" "}
                  {(
                    item.product
                      .price *
                    item.quantity
                  ).toLocaleString()}
                </span>

              </div>
            )
          )}

        </div>


        <div className="my-6 border-t border-[#E5E7EB]" />


        {/* =========================================
            MARKET
        ========================================== */}

        <div>

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F2937]">

            <MapPin
              size={16}
              className="text-[#166534]"
            />

            Pickup Market

          </label>


          <select
            value={
              selection?.marketId ||
              ""
            }
            onChange={(
              event
            ) =>
              handleMarketChange(
                farmerId,
                event.target
                  .value
              )
            }
            className="filter-input"
          >

            <option value="">
              Select a market
            </option>

            {group.farmer
              .marketSchedules
              ?.map(
                (
                  schedule
                ) => (
                  <option
                    key={
                      schedule
                        .market
                        ._id
                    }
                    value={
                      schedule
                        .market
                        ._id
                    }
                  >
                    {
                      schedule
                        .market
                        .name
                    }
                  </option>
                )
              )}

          </select>


          {selectedSchedule
            ?.market
            ?.address && (
              <p className="mt-2 text-xs text-[#6B7280]">
                {
                  selectedSchedule
                    .market
                    .address
                }
              </p>
            )}

        </div>


        {/* =========================================
            DATE
        ========================================== */}

        <div className="mt-5">

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F2937]">

            <CalendarDays
              size={16}
              className="text-[#166534]"
            />

            Pickup Date

          </label>


          <input
            type="date"
            value={
              selection?.pickupDate ||
              ""
            }
            min={
              getTodayDate()
            }
            disabled={
              !selectedSchedule
            }
            onChange={(
              event
            ) =>
              updateSelection(
                farmerId,
                "pickupDate",
                event.target
                  .value
              )
            }
            className="filter-input disabled:cursor-not-allowed disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]"
          />


          {selectedSchedule && (
            <p className="mt-2 text-xs leading-5 text-[#6B7280]">
              Available days:{" "}
              <span className="font-medium text-[#166534]">
                {selectedSchedule.operatingDays.join(
                  ", "
                )}
              </span>
            </p>
          )}

        </div>


        {/* INVALID DAY */}

        {selection
          ?.pickupDate &&
          selectedSchedule &&
          !isValidPickupDay(
            selection.pickupDate,
            selectedSchedule.operatingDays
          ) && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#FFFBEB] p-3 text-xs leading-5 text-[#92400E]">

              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0"
              />

              Please choose a date
              that falls on one of
              this farmer's market
              operating days.

            </div>
          )}


        {/* =========================================
            PICKUP WINDOW
        ========================================== */}

        <div className="mt-5">

          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[#1F2937]">

            <Clock
              size={16}
              className="text-[#166534]"
            />

            Pickup Time

          </label>


          <select
            value={
              selection
                ?.pickupWindowIndex ||
              ""
            }
            disabled={
              !selectedSchedule ||
              !selection
                ?.pickupDate ||
              !isValidPickupDay(
                selection
                  ?.pickupDate ||
                "",
                selectedSchedule
                  ?.operatingDays ||
                []
              )
            }
            onChange={(
              event
            ) =>
              updateSelection(
                farmerId,
                "pickupWindowIndex",
                event.target
                  .value
              )
            }
            className="filter-input disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
          >

            <option value="">
              Select pickup time
            </option>

            {selectedSchedule
              ?.pickupWindows
              ?.map(
                (
                  window,
                  index
                ) => (
                  <option
                    key={
                      `${window.startTime}-${window.endTime}`
                    }
                    value={
                      index
                    }
                  >
                    {
                      window.startTime
                    }{" "}
                    –{" "}
                    {
                      window.endTime
                    }
                  </option>
                )
              )}

          </select>

        </div>


        {/* =========================================
            NOTE
        ========================================== */}

        <div className="mt-5">

          <label className="mb-2 block text-sm font-medium text-[#1F2937]">
            Note to Farmer{" "}
            <span className="font-normal text-[#9CA3AF]">
              (optional)
            </span>
          </label>

          <textarea
            rows={3}
            value={
              selection
                ?.customerNote ||
              ""
            }
            onChange={(
              event
            ) =>
              updateSelection(
                farmerId,
                "customerNote",
                event.target
                  .value
              )
            }
            placeholder="Any pickup note for the farmer..."
            className="filter-input resize-none"
          />

        </div>


        {/* STALL */}

        {selectedSchedule
          ?.stallLocation
          ?.description && (
            <div className="mt-5 rounded-xl bg-[#FAFAF7] p-4">

              <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                Stall Location
              </p>

              <p className="mt-1 text-sm text-[#1F2937]">
                {
                  selectedSchedule
                    .stallLocation
                    .description
                }
              </p>

            </div>
          )}

      </div>

    </div>
  );
}


// ======================================================
// HELPERS
// ======================================================

function getSelectedSchedule(
  group: CartGroup,
  marketId: string
):
  | MarketSchedule
  | undefined {
  return group.farmer
    .marketSchedules
    ?.find(
      (schedule) =>
        schedule.market
          ?._id ===
        marketId
    );
}


function getTodayDate() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() +
      1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function isValidPickupDay(
  dateValue: string,
  operatingDays: string[]
) {
  if (
    !dateValue ||
    operatingDays.length ===
    0
  ) {
    return false;
  }

  /*
   * Add T12:00:00 instead of parsing
   * YYYY-MM-DD directly.
   *
   * This avoids timezone shifting the
   * date to the previous day in some
   * environments.
   */

  const date =
    new Date(
      `${dateValue}T12:00:00`
    );

  const dayName =
    date.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
      }
    );

  return operatingDays.some(
    (day) =>
      day.toLowerCase() ===
      dayName.toLowerCase()
  );
}


// ======================================================
// LOADING
// ======================================================

function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="h-10 w-52 animate-pulse rounded bg-[#E5E7EB]" />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">

        <div className="h-[520px] animate-pulse rounded-2xl bg-[#E5E7EB]" />

        <div className="h-80 animate-pulse rounded-2xl bg-[#E5E7EB]" />

      </div>

    </div>
  );
}