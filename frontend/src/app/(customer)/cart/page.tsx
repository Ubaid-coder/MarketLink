"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBasket,
  Store,
  Trash2,
} from "lucide-react";

import {
  useCart,
} from "@/context/CartContext";


export default function CartPage() {
  const {
    items,
    groups,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();


  // ====================================================
  // EMPTY CART
  // ====================================================

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-[#D1D5DB] bg-white px-8 py-16 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]">
            <ShoppingBasket
              size={30}
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#1F2937]">
            Your basket is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#6B7280]">
            Browse fresh produce from
            local farmers and add some
            products to your basket.
          </p>

          <Link
            href="/marketplace"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3 font-medium text-white transition hover:bg-[#14532D]"
          >
            Browse Marketplace

            <ArrowRight
              size={18}
            />
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
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            Continue Shopping
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-[#1F2937]">
                Your Basket
              </h1>

              <p className="mt-2 text-[#6B7280]">
                {cartCount}{" "}
                {cartCount === 1
                  ? "item"
                  : "items"}{" "}
                from{" "}
                {groups.length}{" "}
                {groups.length === 1
                  ? "farmer"
                  : "farmers"}
              </p>
            </div>

            <button
              onClick={clearCart}
              className="flex items-center gap-2 text-sm font-medium text-[#DC2626] hover:underline"
            >
              <Trash2
                size={16}
              />

              Clear Basket
            </button>

          </div>

        </div>

      </section>


      {/* =============================================
          CART
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">


          {/* =========================================
              FARMER GROUPS
          ========================================== */}

          <div className="space-y-7">

            {groups.map(
              (group) => {

                const farmerTotal =
                  group.items.reduce(
                    (
                      total,
                      item
                    ) =>
                      total +
                      item.product
                        .price *
                        item.quantity,
                    0
                  );

                return (
                  <div
                    key={
                      group.farmer
                        ._id
                    }
                    className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
                  >

                    {/* FARMER HEADER */}

                    <div className="flex items-center justify-between border-b border-[#E5E7EB] bg-[#F0FDF4] px-5 py-4">

                      <Link
                        href={`/farmers/${group.farmer._id}`}
                        className="flex items-center gap-3"
                      >

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#166534]">
                          <Store
                            size={18}
                          />
                        </div>

                        <div>
                          <p className="text-xs text-[#6B7280]">
                            Sold by
                          </p>

                          <p className="font-semibold text-[#1F2937]">
                            {
                              group
                                .farmer
                                .stallName
                            }
                          </p>
                        </div>

                      </Link>


                      <span className="text-sm font-semibold text-[#166534]">
                        PKR{" "}
                        {farmerTotal.toLocaleString()}
                      </span>

                    </div>


                    {/* ITEMS */}

                    <div className="divide-y divide-[#E5E7EB]">

                      {group.items.map(
                        ({
                          product,
                          quantity,
                        }) => (
                          <div
                            key={
                              product._id
                            }
                            className="flex gap-4 p-5"
                          >

                            {/* IMAGE */}

                            <Link
                              href={`/marketplace/products/${product._id}`}
                              className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#DCFCE7] text-[#166534]"
                            >

                              {product.image ? (
                                <img
                                  src={
                                    product.image
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ShoppingBasket
                                  size={28}
                                />
                              )}

                            </Link>


                            {/* PRODUCT */}

                            <div className="min-w-0 flex-1">

                              <div className="flex justify-between gap-4">

                                <div>

                                  <Link
                                    href={`/marketplace/products/${product._id}`}
                                    className="font-semibold text-[#1F2937] hover:text-[#166534]"
                                  >
                                    {
                                      product.name
                                    }
                                  </Link>

                                  <p className="mt-1 text-sm text-[#6B7280]">
                                    PKR{" "}
                                    {product.price.toLocaleString()}{" "}
                                    /{" "}
                                    {
                                      product.unit
                                    }
                                  </p>

                                </div>


                                <button
                                  onClick={() =>
                                    removeFromCart(
                                      product._id
                                    )
                                  }
                                  title="Remove item"
                                  className="self-start rounded-lg p-2 text-[#9CA3AF] transition hover:bg-red-50 hover:text-[#DC2626]"
                                >
                                  <Trash2
                                    size={17}
                                  />
                                </button>

                              </div>


                              {/* QUANTITY */}

                              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                                <div className="flex overflow-hidden rounded-lg border border-[#E5E7EB]">

                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        product._id,
                                        quantity -
                                          1
                                      )
                                    }
                                    disabled={
                                      quantity <=
                                      1
                                    }
                                    className="flex h-9 w-9 items-center justify-center hover:bg-[#F3F4F6] disabled:opacity-30"
                                  >
                                    <Minus
                                      size={15}
                                    />
                                  </button>

                                  <span className="flex h-9 min-w-10 items-center justify-center border-x border-[#E5E7EB] px-3 text-sm font-semibold">
                                    {
                                      quantity
                                    }
                                  </span>

                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        product._id,
                                        quantity +
                                          1
                                      )
                                    }
                                    disabled={
                                      quantity >=
                                      product.quantityAvailable
                                    }
                                    className="flex h-9 w-9 items-center justify-center hover:bg-[#F3F4F6] disabled:opacity-30"
                                  >
                                    <Plus
                                      size={15}
                                    />
                                  </button>

                                </div>


                                <span className="font-semibold text-[#1F2937]">
                                  PKR{" "}
                                  {(
                                    product.price *
                                    quantity
                                  ).toLocaleString()}
                                </span>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>


          {/* =========================================
              SUMMARY
          ========================================== */}

          <aside>

            <div className="sticky top-24 rounded-2xl border border-[#E5E7EB] bg-white p-6">

              <h2 className="text-lg font-semibold text-[#1F2937]">
                Basket Summary
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
                    Farmers
                  </span>

                  <span>
                    {
                      groups.length
                    }
                  </span>
                </div>

                <div className="flex justify-between text-[#6B7280]">
                  <span>
                    Online payment
                  </span>

                  <span className="font-medium text-[#166534]">
                    None
                  </span>
                </div>

              </div>


              <div className="my-6 border-t border-[#E5E7EB]" />


              <div className="flex items-center justify-between">

                <span className="font-semibold text-[#1F2937]">
                  Estimated Total
                </span>

                <span className="text-xl font-bold text-[#166534]">
                  PKR{" "}
                  {cartTotal.toLocaleString()}
                </span>

              </div>


              <p className="mt-3 text-xs leading-5 text-[#6B7280]">
                Final stock and prices are
                validated by MarketLink when
                your preorder is submitted.
                Payment is made in person at
                pickup.
              </p>


              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3.5 font-medium text-white transition hover:bg-[#14532D]"
              >
                Continue to Pickup

                <ArrowRight
                  size={18}
                />
              </Link>


              {groups.length >
                1 && (
                <div className="mt-4 rounded-lg bg-[#FFFBEB] p-3 text-xs leading-5 text-[#92400E]">
                  Your basket contains
                  products from multiple
                  farmers. MarketLink will
                  create a separate preorder
                  for each farmer.
                </div>
              )}

            </div>

          </aside>

        </div>

      </section>

    </div>
  );
}