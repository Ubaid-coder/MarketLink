"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Leaf,
  MapPin,
  Search,
  ShoppingBasket,
  Store,
} from "lucide-react";

import api from "@/lib/api";

import ProductCard from "@/components/customer/ProductCard";

import {
  Product,
} from "@/types/marketplace";

export default function HomePage() {
  const [
    products,
    setProducts,
  ] = useState<Product[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    const loadProducts =
      async () => {
        try {
          const response =
            await api.get(
              "/marketplace/products"
            );

          setProducts(
            response.data.products ||
              []
          );
        } catch (error) {
          console.error(
            error
          );

          setError(
            "Unable to load products."
          );
        } finally {
          setLoading(false);
        }
      };

    loadProducts();
  }, []);


  return (
    <>
      {/* =============================================
          HERO
      ============================================== */}

      <section className="border-b border-[#E5E7EB] bg-[#F0FDF4]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-medium text-[#166534]">
              <Leaf
                size={16}
              />

              Fresh • Local • Simple
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-[#1F2937] sm:text-5xl lg:text-6xl">
              Fresh produce from{" "}
              <span className="text-[#166534]">
                local farmers.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6B7280]">
              Discover nearby farmers,
              reserve fresh produce
              online, and collect your
              order directly from your
              local market.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg bg-[#166534] px-6 py-3 font-medium text-white transition hover:bg-[#14532D]"
              >
                Browse Produce

                <ArrowRight
                  size={18}
                />
              </Link>

              <Link
                href="/farmers"
                className="inline-flex items-center gap-2 rounded-lg border border-[#166534] bg-white px-6 py-3 font-medium text-[#166534] transition hover:bg-[#DCFCE7]"
              >
                <Store
                  size={18}
                />

                Meet Farmers
              </Link>

            </div>


            <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#6B7280]">

              <div className="flex items-center gap-2">
                <Search
                  size={17}
                  className="text-[#166534]"
                />

                Find local produce
              </div>

              <div className="flex items-center gap-2">
                <ShoppingBasket
                  size={17}
                  className="text-[#166534]"
                />

                Reserve online
              </div>

              <div className="flex items-center gap-2">
                <MapPin
                  size={17}
                  className="text-[#166534]"
                />

                Pick up locally
              </div>

            </div>
          </div>


          {/* HERO VISUAL */}

          <div className="relative hidden lg:block">

            <div className="rounded-[32px] border border-green-200 bg-white p-8 shadow-xl shadow-green-900/5">

              <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-[#DCFCE7]">

                <div className="text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#166534] text-white">
                    <ShoppingBasket
                      size={45}
                    />
                  </div>

                  <h2 className="mt-6 text-2xl font-semibold text-[#166534]">
                    eGreen Basket
                  </h2>

                  <p className="mt-2 text-[#6B7280]">
                    From farm to market.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =============================================
          FEATURED PRODUCTS
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between gap-5">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Fresh this week
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Available Produce
            </h2>

            <p className="mt-2 text-[#6B7280]">
              Reserve fresh products
              directly from local farmers.
            </p>
          </div>

          <Link
            href="/marketplace"
            className="hidden items-center gap-2 text-sm font-semibold text-[#166534] hover:underline sm:flex"
          >
            View Marketplace

            <ArrowRight
              size={16}
            />
          </Link>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={
                    index
                  }
                  className="h-[390px] animate-pulse rounded-2xl border border-[#E5E7EB] bg-white"
                >
                  <div className="h-52 bg-[#F3F4F6]" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 rounded bg-[#F3F4F6]" />
                    <div className="h-4 rounded bg-[#F3F4F6]" />
                    <div className="h-4 w-1/2 rounded bg-[#F3F4F6]" />
                  </div>
                </div>
              )
            )}

          </div>
        )}


        {/* ERROR */}

        {!loading &&
          error && (
            <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-[#DC2626]">
              {error}
            </div>
          )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          products.length ===
            0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-[#E5E7EB] bg-white px-6 py-16 text-center">

              <ShoppingBasket
                size={40}
                className="mx-auto text-[#166534]"
              />

              <h3 className="mt-4 font-semibold text-[#1F2937]">
                No produce available
                yet
              </h3>

              <p className="mt-2 text-sm text-[#6B7280]">
                Farmers haven't
                published their weekly
                stock yet.
              </p>

            </div>
          )}


        {/* PRODUCTS */}

        {!loading &&
          !error &&
          products.length >
            0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {products
                .slice(
                  0,
                  8
                )
                .map(
                  (
                    product
                  ) => (
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
          )}

      </section>


      {/* =============================================
          HOW IT WORKS
      ============================================== */}

      <section className="border-y border-[#E5E7EB] bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Simple pickup
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#1F2937]">
              From farmer to your basket
            </h2>

          </div>


          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <StepCard
              number="01"
              icon={
                <Search
                  size={25}
                />
              }
              title="Discover"
              description="Browse local farmers and see their current weekly produce."
            />

            <StepCard
              number="02"
              icon={
                <ShoppingBasket
                  size={25}
                />
              }
              title="Reserve"
              description="Choose your produce and reserve it before stock runs out."
            />

            <StepCard
              number="03"
              icon={
                <MapPin
                  size={25}
                />
              }
              title="Pick Up"
              description="Visit the selected market, collect your order and pay in person."
            />

          </div>
        </div>
      </section>
    </>
  );
}


function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAF7] p-7">

      <div className="flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>

        <span className="text-3xl font-bold text-[#E5E7EB]">
          {number}
        </span>

      </div>

      <h3 className="mt-6 text-lg font-semibold text-[#1F2937]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#6B7280]">
        {description}
      </p>

    </div>
  );
}