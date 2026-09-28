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
  ExternalLink,
  Navigation,
  // existing icons
} from "lucide-react";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Heart,
  MapPin,
  ShoppingBasket,
  Store,
  UserRound,
} from "lucide-react";

import {
  useFavorites,
} from "@/context/FavoritesContext";
import ReviewsSection from "@/components/customer/ReviewsSection";

import api from "@/lib/api";

import ProductCard from "@/components/customer/ProductCard";

import {
  Farmer,
  Product,
} from "@/types/marketplace";


interface FarmerDetailsResponse {
  farmer: Farmer;
  products: Product[];
}


export default function FarmerDetailsPage() {
  const params =
    useParams();

  const {
    isFarmerFavorite,
    toggleFarmerFavorite,
  } = useFavorites();



  const id =
    params.id as string;

  const [
    farmer,
    setFarmer,
  ] =
    useState<Farmer | null>(
      null
    );


  const [
    products,
    setProducts,
  ] =
    useState<Product[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");
  const favorite = null;


  // ====================================================
  // LOAD FARMER
  // ====================================================

  useEffect(() => {
    if (!id) return;

    const loadFarmer =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              `/marketplace/farmers/${id}`
            );

          const data =
            response.data as FarmerDetailsResponse;

          setFarmer(
            data.farmer
          );

          setProducts(
            data.products || []
          );

        } catch (error) {
          console.error(
            "Farmer load failed:",
            error
          );

          setError(
            "Farmer could not be found."
          );
        } finally {
          setLoading(false);
        }
      };

    loadFarmer();


  }, [id]);


  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="h-64 animate-pulse rounded-3xl bg-[#DCFCE7]" />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {Array.from({
            length: 3,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-2xl bg-[#E5E7EB]"
              />
            )
          )}

        </div>

      </div>
    );
  }


  // ====================================================
  // ERROR
  // ====================================================

  if (
    error ||
    !farmer
  ) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <Store
            size={40}
            className="mx-auto text-[#DC2626]"
          />

          <h1 className="mt-4 text-xl font-semibold">
            Farmer unavailable
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            {error}
          </p>

          <Link
            href="/farmers"
            className="mt-6 inline-flex items-center gap-2 font-medium text-[#166534]"
          >
            <ArrowLeft
              size={17}
            />

            Browse Farmers
          </Link>

        </div>

      </div>
    );
  }


  return (
    <div>

      {/* =============================================
          FARMER HEADER
      ============================================== */}

      <section className="border-b border-green-200 bg-[#F0FDF4]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <Link
            href="/farmers"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            All Farmers
          </Link>


          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">

            {/* FARMER IMAGE */}

            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-[#DCFCE7] text-[#166534] shadow-sm">

              {farmer.image ? (
                <img
                  src={
                    farmer.image
                  }
                  alt={
                    farmer.stallName
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store
                  size={45}
                />
              )}

            </div>


            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl font-bold text-[#1F2937] sm:text-4xl">
                  {
                    farmer.stallName
                  }
                </h1>

                <span className="rounded-full bg-[#166534] px-3 py-1 text-xs font-medium text-white">
                  Approved Farmer
                </span>

              </div>


              <div className="mt-3 flex items-center gap-2 text-[#6B7280]">

                <UserRound
                  size={17}
                />

                {
                  farmer.contactPerson
                }

              </div>


              <p className="mt-4 max-w-2xl leading-7 text-[#6B7280]">
                {farmer.description ||
                  "Local farmer providing fresh produce through MarketLink."}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                toggleFarmerFavorite(
                  farmer._id
                )
              }
              className={`flex items-center justify-center gap-2 self-start rounded-xl border px-5 py-3 font-medium transition md:self-center ${favorite
                ? "border-red-200 bg-red-50 text-[#DC2626]"
                : "border-[#166534] bg-white text-[#166534] hover:bg-[#DCFCE7]"
                }`}
            >
              <Heart
                size={18}
                fill={
                  favorite
                    ? "currentColor"
                    : "none"
                }
              />

              {favorite
                ? "Favorited"
                : "Favorite Farmer"}
            </button>

          </div>

        </div>

      </section>


      {/* =============================================
          MARKET SCHEDULES
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Find this farmer
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#1F2937]">
            Markets & Pickup Times
          </h2>

        </div>


        {farmer.marketSchedules?.length >
          0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {farmer.marketSchedules.map(
              (
                schedule,
                index
              ) => (
                <div
                  key={
                    schedule.market
                      ?._id ||
                    index
                  }
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
                >

                  <div className="flex gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                      <MapPin
                        size={20}
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#1F2937]">
                        {schedule
                          .market
                          ?.name ||
                          "Local Market"}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-[#6B7280]">
                        {schedule
                          .market
                          ?.address}
                      </p>
                    </div>

                  </div>


                  <div className="mt-5 space-y-4 border-t border-[#E5E7EB] pt-5">

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

                        {schedule.pickupWindows?.map(
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

                  {schedule.stallLocation
                    ?.latitude !== undefined &&
                    schedule.stallLocation
                      ?.longitude !== undefined && (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${schedule.stallLocation.latitude}&mlon=${schedule.stallLocation.longitude}#map=17/${schedule.stallLocation.latitude}/${schedule.stallLocation.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#166534] hover:underline"
                      >
                        <Navigation
                          size={15}
                        />

                        View Stall Location

                        <ExternalLink
                          size={13}
                        />
                      </a>
                    )}

                </div>
              )
            )}

          </div>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-8 text-sm text-[#6B7280]">
            No market schedule is currently available.
          </div>
        )}


      </section>


      {/* =============================================
          FARMER PRODUCTS
      ============================================== */}

      <section className="border-t border-[#E5E7EB] bg-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                Current stock
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#1F2937]">
                Available from{" "}
                {
                  farmer.stallName
                }
              </h2>

            </div>

            <span className="text-sm text-[#6B7280]">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </span>

          </div>


          {products.length >
            0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {products.map(
                (product, key) => (
                  <div key={key} >
                    <ProductCard
                      key={
                        product._id
                      }
                      product={
                        product
                      }
                    />
                    <section className="mt-16 border-t border-[#E5E7EB] pt-12">

                      <ReviewsSection
                        type="product"
                        id={product._id}
                      />

                    </section>
                  </div >

                )
              )}

            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FAFAF7] py-16 text-center">

              <ShoppingBasket
                size={38}
                className="mx-auto text-[#166534]"
              />

              <h3 className="mt-4 font-semibold text-[#1F2937]">
                No current stock
              </h3>

              <p className="mt-2 text-sm text-[#6B7280]">
                This farmer has no produce available right now.
              </p>

            </div>
          )}

        </div>

      </section>

      <section className="border-t border-[#E5E7EB] bg-[#FAFAF7]">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <ReviewsSection
            type="farmer"
            id={farmer._id}
          />

        </div>

      </section>


    </div>
  );
}