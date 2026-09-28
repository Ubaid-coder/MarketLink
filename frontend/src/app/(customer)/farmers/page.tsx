"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Search,
  Store,
} from "lucide-react";

import api from "@/lib/api";

import {
  Farmer,
} from "@/types/marketplace";


export default function FarmersPage() {
  const [
    farmers,
    setFarmers,
  ] =
    useState<Farmer[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);


  const loadFarmers =
    async (
      searchValue = ""
    ) => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/marketplace/farmers",
            {
              params:
                searchValue
                  ? {
                      search:
                        searchValue,
                    }
                  : {},
            }
          );

        setFarmers(
          response.data.farmers ||
            []
        );
      } catch (error) {
        console.error(
          error
        );

        setFarmers([]);
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadFarmers();
  }, []);


  return (
    <div>

      <section className="border-b border-[#E5E7EB] bg-[#F0FDF4]">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Local producers
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#1F2937]">
            Meet Our Farmers
          </h1>

          <p className="mt-3 max-w-2xl text-[#6B7280]">
            Discover approved local farmers,
            their stalls, market schedules and
            fresh weekly stock.
          </p>


          <form
            onSubmit={(event) => {
              event.preventDefault();

              loadFarmers(
                search
              );
            }}
            className="mt-7 flex max-w-xl overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
          >

            <div className="flex flex-1 items-center px-4">

              <Search
                size={18}
                className="text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Search farmers or stalls..."
                className="w-full px-3 py-3 outline-none"
              />

            </div>

            <button
              type="submit"
              className="bg-[#166534] px-5 text-sm font-medium text-white"
            >
              Search
            </button>

          </form>

        </div>

      </section>


      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl bg-[#E5E7EB]"
                />
              )
            )}

          </div>
        ) : farmers.length >
          0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {farmers.map(
              (farmer) => (
                <FarmerCard
                  key={
                    farmer._id
                  }
                  farmer={
                    farmer
                  }
                />
              )
            )}

          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white py-20 text-center">

            <Store
              size={40}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 font-semibold text-[#1F2937]">
              No farmers found
            </h2>

          </div>
        )}

      </section>

    </div>
  );
}


function FarmerCard({
  farmer,
}: {
  farmer: Farmer;
}) {
  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-start gap-4">

        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#DCFCE7] text-[#166534]">

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
              size={25}
            />
          )}

        </div>


        <div className="min-w-0">

          <h2 className="truncate text-lg font-semibold text-[#1F2937]">
            {
              farmer.stallName
            }
          </h2>

          <p className="mt-1 text-sm text-[#6B7280]">
            {
              farmer.contactPerson
            }
          </p>

        </div>

      </div>


      <p className="mt-5 line-clamp-2 min-h-12 text-sm leading-6 text-[#6B7280]">
        {farmer.description ||
          "Fresh local produce available through MarketLink."}
      </p>


      {farmer
        .marketSchedules
        ?.length > 0 && (
        <div className="mt-5 flex items-start gap-2 text-sm text-[#6B7280]">

          <MapPin
            size={16}
            className="mt-0.5 shrink-0 text-[#166534]"
          />

          <span>
            {farmer
              .marketSchedules
              .slice(0, 2)
              .map(
                (schedule) =>
                  schedule
                    .market
                    ?.name
              )
              .filter(Boolean)
              .join(", ")}
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
  );
}