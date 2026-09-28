"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowRight,
  Heart,
  MapPin,
  Store,
} from "lucide-react";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useFavorites,
} from "@/context/FavoritesContext";

import ProductCard from "@/components/customer/ProductCard";


export default function FavoritesPage() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    favoriteProducts,
    favoriteFarmers,
    loading,
    toggleFarmerFavorite,
  } = useFavorites();


  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/favorites"
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


  if (
    authLoading ||
    loading
  ) {
    return (
      <FavoritesLoading />
    );
  }


  if (
    !user ||
    user.role !==
      "customer"
  ) {
    return null;
  }


  const empty =
    favoriteProducts.length ===
      0 &&
    favoriteFarmers.length ===
      0;


  return (
    <div>

      {/* HEADER */}

      <section className="border-b border-[#E5E7EB] bg-[#F0FDF4]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Saved for later
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
            My Favorites
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Quickly return to
            farmers and fresh
            produce you like.
          </p>

        </div>

      </section>


      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* EMPTY */}

        {empty && (
          <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">

              <Heart
                size={29}
              />

            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
              No favorites yet
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Save products and
              farmers to find them
              quickly later.
            </p>

            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#166534] px-6 py-3 font-medium text-white"
            >
              Browse Marketplace

              <ArrowRight
                size={17}
              />
            </Link>

          </div>
        )}


        {/* PRODUCTS */}

        {favoriteProducts.length >
          0 && (
          <section>

            <div className="flex items-end justify-between">

              <div>

                <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                  Products
                </p>

                <h2 className="mt-1 text-2xl font-bold text-[#1F2937]">
                  Favorite Products
                </h2>

              </div>

              <span className="text-sm text-[#6B7280]">
                {
                  favoriteProducts.length
                }
              </span>

            </div>


            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {favoriteProducts.map(
                (product) => (
                  <ProductCard
                    key={
                      product._id
                    }
                    product={
                      product
                    }
                  />
                )
              )}

            </div>

          </section>
        )}


        {/* FARMERS */}

        {favoriteFarmers.length >
          0 && (
          <section
            className={
              favoriteProducts.length >
              0
                ? "mt-16 border-t border-[#E5E7EB] pt-12"
                : ""
            }
          >

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                Farmers
              </p>

              <h2 className="mt-1 text-2xl font-bold text-[#1F2937]">
                Favorite Farmers
              </h2>

            </div>


            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {favoriteFarmers.map(
                (farmer) => (
                  <article
                    key={
                      farmer._id
                    }
                    className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-[#DCFCE7] text-[#166534]">

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
                              size={22}
                            />
                          )}

                        </div>

                        <div>

                          <h3 className="font-semibold text-[#1F2937]">
                            {
                              farmer.stallName
                            }
                          </h3>

                          <p className="mt-1 text-sm text-[#6B7280]">
                            {
                              farmer.contactPerson
                            }
                          </p>

                        </div>

                      </div>


                      <button
                        onClick={() =>
                          toggleFarmerFavorite(
                            farmer._id
                          )
                        }
                        title="Remove favorite"
                        className="text-[#DC2626]"
                      >
                        <Heart
                          size={20}
                          fill="currentColor"
                        />
                      </button>

                    </div>


                    {farmer
                      .marketSchedules
                      ?.length >
                      0 && (
                      <div className="mt-5 flex items-start gap-2 text-sm text-[#6B7280]">

                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-[#166534]"
                        />

                        <span>
                          {farmer
                            .marketSchedules
                            .slice(
                              0,
                              2
                            )
                            .map(
                              (
                                schedule
                              ) =>
                                schedule
                                  .market
                                  ?.name
                            )
                            .filter(
                              Boolean
                            )
                            .join(
                              ", "
                            )}
                        </span>

                      </div>
                    )}


                    <Link
                      href={`/farmers/${farmer._id}`}
                      className="mt-6 flex items-center justify-between border-t border-[#E5E7EB] pt-5 text-sm font-semibold text-[#166534]"
                    >
                      View Farmer

                      <ArrowRight
                        size={17}
                      />
                    </Link>

                  </article>
                )
              )}

            </div>

          </section>
        )}

      </section>

    </div>
  );
}


function FavoritesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="h-10 w-48 animate-pulse rounded bg-[#E5E7EB]" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {Array.from({
          length: 4,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl bg-[#E5E7EB]"
            />
          )
        )}

      </div>

    </div>
  );
}