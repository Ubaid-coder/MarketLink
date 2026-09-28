"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShoppingBasket,
  Store,
  PackageCheck,
  Clock,
} from "lucide-react";

import {
  useFavorites,
} from "@/context/FavoritesContext";
import ReviewsSection from "@/components/customer/ReviewsSection";

import api from "@/lib/api";

import {
  Product,
} from "@/types/marketplace";
import {
  useCart,
} from "@/context/CartContext";


export default function ProductDetailsPage() {
  const params = useParams();
  const {
    addToCart,
    isInCart,
  } = useCart();

  const [
    added,
    setAdded,
  ] = useState(false);

  const {
    isProductFavorite,
    toggleProductFavorite,
  } = useFavorites();



  const id =
    params.id as string;

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ====================================================
  // LOAD PRODUCT
  // ====================================================

  useEffect(() => {
    if (!id) return;

    const loadProduct =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/marketplace/products/${id}`
            );

          setProduct(
            response.data.product ||
            response.data
          );
        } catch (error) {
          console.error(
            "Product load failed:",
            error
          );

          setError(
            "Product could not be found."
          );
        } finally {
          setLoading(false);
        }
      };

    loadProduct();
  }, [id]);


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <ProductDetailsSkeleton />
    );
  }


  // ====================================================
  // ERROR
  // ====================================================

  if (
    error ||
    !product
  ) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <ShoppingBasket
            size={38}
            className="mx-auto text-[#DC2626]"
          />

          <h1 className="mt-4 text-xl font-semibold text-[#1F2937]">
            Product unavailable
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            {error}
          </p>

          <Link
            href="/marketplace"
            className="mt-6 inline-flex items-center gap-2 font-medium text-[#166534]"
          >
            <ArrowLeft
              size={17}
            />

            Back to Marketplace
          </Link>

        </div>
      </div>
    );
  }


  const farmer =
    product.farmer;

  const maxQuantity =
    product.quantityAvailable;

  const favorite =
    isProductFavorite(
      product._id
    );


  // ====================================================
  // QUANTITY
  // ====================================================

  const increaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.min(
            current + 1,
            maxQuantity
          )
      );
    };

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            current - 1,
            1
          )
      );
    };


  return (
    <div>

      {/* =============================================
          BREADCRUMB
      ============================================== */}

      <div className="border-b border-[#E5E7EB] bg-white">

        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] transition hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            Back to Marketplace
          </Link>

        </div>

      </div>


      {/* =============================================
          PRODUCT
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-10 lg:grid-cols-2">

          {/* IMAGE */}

          <div className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white">

            <div className="aspect-square bg-[#DCFCE7]">

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
                <div className="flex h-full items-center justify-center text-[#166534]">
                  <ShoppingBasket
                    size={80}
                  />
                </div>
              )}

            </div>

          </div>


          {/* DETAILS */}

          <div>

            <span className="inline-flex rounded-full bg-[#DCFCE7] px-3 py-1 text-sm font-medium text-[#166534]">
              {product.category
                ?.name ||
                "Fresh Produce"}
            </span>


            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#1F2937]">
              {product.name}
            </h1>


            <p className="mt-5 text-lg leading-8 text-[#6B7280]">
              {product.description ||
                "Fresh local produce available for pickup from your local market."}
            </p>


            {/* PRICE */}

            <div className="mt-7 flex items-end gap-2">

              <span className="text-3xl font-bold text-[#166534]">
                PKR{" "}
                {product.price.toLocaleString()}
              </span>

              <span className="pb-1 text-[#6B7280]">
                / {product.unit}
              </span>

            </div>


            {/* STOCK */}

            <div className="mt-5 flex items-center gap-2 text-sm">

              <PackageCheck
                size={18}
                className="text-[#22C55E]"
              />

              <span className="font-medium text-[#1F2937]">
                {
                  product.quantityAvailable
                }{" "}
                {product.unit} available
              </span>

            </div>


            {/* FARMER */}

            {farmer && (
              <Link
                href={`/farmers/${farmer._id}`}
                className="mt-7 flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-4 transition hover:border-green-300 hover:shadow-sm"
              >

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">

                  <Store
                    size={22}
                  />

                </div>

                <div className="min-w-0">

                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    Sold by
                  </p>

                  <p className="mt-1 truncate font-semibold text-[#1F2937]">
                    {
                      farmer.stallName
                    }
                  </p>

                </div>

              </Link>
            )}


            {/* QUANTITY */}

            <div className="mt-8 border-t border-[#E5E7EB] pt-7">

              <p className="text-sm font-medium text-[#1F2937]">
                Quantity
              </p>

              <div className="mt-3 flex items-center gap-4">

                <div className="flex items-center overflow-hidden rounded-lg border border-[#E5E7EB]">

                  <button
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-11 w-11 items-center justify-center text-[#1F2937] transition hover:bg-[#F3F4F6] disabled:opacity-30"
                  >
                    <Minus
                      size={17}
                    />
                  </button>

                  <div className="flex h-11 min-w-12 items-center justify-center border-x border-[#E5E7EB] px-4 font-semibold">
                    {quantity}
                  </div>

                  <button
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      maxQuantity
                    }
                    className="flex h-11 w-11 items-center justify-center text-[#1F2937] transition hover:bg-[#F3F4F6] disabled:opacity-30"
                  >
                    <Plus
                      size={17}
                    />
                  </button>

                </div>


                <span className="text-sm text-[#6B7280]">
                  PKR{" "}
                  {(
                    product.price *
                    quantity
                  ).toLocaleString()}
                </span>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="mt-7 flex gap-3">
              <Link href={'/cart'}>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(
                      product,
                      quantity
                    );

                    setAdded(true);

                    setTimeout(() => {
                      setAdded(false);
                    }, 1500);
                  }}
                  disabled={
                    product.quantityAvailable <= 0
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166534] px-6 py-3.5 font-medium text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShoppingBasket
                    size={19}
                  />

                  {added
                    ? "Added to Cart"
                    : isInCart(
                      product._id
                    )
                      ? "Add More"
                      : "Add to Cart"}
                </button>
              </Link>
              <button
                type="button"
                title={
                  favorite
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                onClick={() =>
                  toggleProductFavorite(
                    product._id
                  )
                }
                className={`flex h-[52px] w-[52px] items-center justify-center rounded-xl border bg-white transition ${favorite
                  ? "border-red-200 bg-red-50 text-[#DC2626]"
                  : "border-[#E5E7EB] text-[#6B7280] hover:border-red-200 hover:text-[#DC2626]"
                  }`}
              >
                <Heart
                  size={20}
                  fill={
                    favorite
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>

            </div>


            <p className="mt-4 text-xs leading-5 text-[#6B7280]">
              No online payment is required.
              Reserve your products and pay
              directly when you collect them
              from the market.
            </p>

          </div>
        </div>


        {/* ===========================================
            PICKUP / MARKET INFO
        ============================================ */}

        {farmer?.marketSchedules &&
          farmer.marketSchedules.length >
          0 && (
            <div className="mt-16">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                  Pickup locations
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#1F2937]">
                  Where can I collect this?
                </h2>
              </div>


              <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                {farmer.marketSchedules.map(
                  (
                    schedule,
                    index
                  ) => (
                    <div
                      key={
                        schedule
                          .market
                          ?._id ||
                        index
                      }
                      className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
                    >

                      <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#166534]">
                          <MapPin
                            size={19}
                          />
                        </div>

                        <div>
                          <h3 className="font-semibold text-[#1F2937]">
                            {schedule
                              .market
                              ?.name ||
                              "Local Market"}
                          </h3>

                          <p className="mt-1 text-sm text-[#6B7280]">
                            {schedule
                              .market
                              ?.address}
                          </p>
                        </div>

                      </div>


                      <div className="mt-5 space-y-3 border-t border-[#E5E7EB] pt-5">

                        <div className="flex items-start gap-3 text-sm">

                          <CalendarDays
                            size={17}
                            className="mt-0.5 shrink-0 text-[#166534]"
                          />

                          <span className="text-[#6B7280]">
                            {schedule.operatingDays.join(
                              ", "
                            )}
                          </span>

                        </div>


                        <div className="flex items-start gap-3 text-sm">

                          <Clock
                            size={17}
                            className="mt-0.5 shrink-0 text-[#166534]"
                          />

                          <div className="text-[#6B7280]">

                            {schedule.pickupWindows?.length >
                              0 ? (
                              schedule.pickupWindows.map(
                                (
                                  window,
                                  windowIndex
                                ) => (
                                  <p
                                    key={
                                      windowIndex
                                    }
                                  >
                                    {
                                      window.startTime
                                    }{" "}
                                    –{" "}
                                    {
                                      window.endTime
                                    }
                                  </p>
                                )
                              )
                            ) : (
                              <p>
                                Pickup time
                                not specified
                              </p>
                            )}

                          </div>

                        </div>


                        {schedule
                          .stallLocation
                          ?.description && (
                            <div className="flex items-start gap-3 text-sm">

                              <Store
                                size={17}
                                className="mt-0.5 shrink-0 text-[#166534]"
                              />

                              <span className="text-[#6B7280]">
                                {
                                  schedule
                                    .stallLocation
                                    .description
                                }
                              </span>

                            </div>
                          )}

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>
          )}

      </section>

      <section className="mt-16 border-t border-[#E5E7EB] pt-12">

        <ReviewsSection
          type="product"
          id={product._id}
        />

      </section>

    </div>
  );
}


// ======================================================
// SKELETON
// ======================================================

function ProductDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="grid gap-10 lg:grid-cols-2">

        <div className="aspect-square animate-pulse rounded-3xl bg-[#E5E7EB]" />

        <div className="space-y-5">

          <div className="h-6 w-28 animate-pulse rounded bg-[#DCFCE7]" />

          <div className="h-12 w-3/4 animate-pulse rounded bg-[#E5E7EB]" />

          <div className="h-5 animate-pulse rounded bg-[#F3F4F6]" />

          <div className="h-5 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />

          <div className="mt-8 h-10 w-40 animate-pulse rounded bg-[#DCFCE7]" />

        </div>

      </div>

    </div>
  );
}