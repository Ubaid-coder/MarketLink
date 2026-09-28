"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  Clock,
  Map,
  MapPin,
  Search,
} from "lucide-react";

import api from "@/lib/api";

import {
  Market,
} from "@/types/marketplace";


export default function MarketsPage() {
  const [
    markets,
    setMarkets,
  ] = useState<Market[]>([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    day,
    setDay,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ================================================
  // LOAD MARKETS
  // ================================================

  useEffect(() => {
    const loadMarkets =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              "/markets"
            );

          setMarkets(
            response.data.markets ||
              response.data ||
              []
          );
        } catch (error) {
          console.error(
            error
          );

          setError(
            "Unable to load markets."
          );
        } finally {
          setLoading(false);
        }
      };

    loadMarkets();
  }, []);


  // ================================================
  // CLIENT FILTER
  // ================================================

  const filteredMarkets =
    useMemo(() => {
      return markets.filter(
        (market) => {
          const matchesSearch =
            !search ||
            market.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            market.address
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesDay =
            !day ||
            market.operatingDays.some(
              (
                operatingDay
              ) =>
                operatingDay.toLowerCase() ===
                day.toLowerCase()
            );

          return (
            matchesSearch &&
            matchesDay
          );
        }
      );
    }, [
      markets,
      search,
      day,
    ]);


  return (
    <div>

      {/* =============================================
          HEADER
      ============================================== */}

      <section className="border-b border-[#E5E7EB] bg-[#F0FDF4]">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Pickup locations
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#1F2937]">
            Local Markets
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#6B7280]">
            Find local markets,
            discover their operating
            days and see which
            MarketLink farmers sell
            there.
          </p>


          {/* FILTER */}

          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-[1fr_200px]">

            <div className="flex items-center rounded-xl border border-[#E5E7EB] bg-white px-4">

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
                placeholder="Search market or address..."
                className="w-full bg-transparent px-3 py-3 outline-none"
              />

            </div>


            <select
              value={day}
              onChange={(
                event
              ) =>
                setDay(
                  event.target
                    .value
                )
              }
              className="filter-input"
            >
              <option value="">
                Any day
              </option>

              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map(
                (
                  dayName
                ) => (
                  <option
                    key={
                      dayName
                    }
                    value={
                      dayName
                    }
                  >
                    {
                      dayName
                    }
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </section>


      {/* =============================================
          RESULTS
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {Array.from({
              length: 6,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl bg-[#E5E7EB]"
                />
              )
            )}

          </div>
        ) : filteredMarkets.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <MapPin
              size={40}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No markets found
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Try another search or
              operating day.
            </p>

          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-[#6B7280]">
              {
                filteredMarkets.length
              }{" "}
              {filteredMarkets.length ===
              1
                ? "market"
                : "markets"}{" "}
              found
            </div>


            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {filteredMarkets.map(
                (market) => (
                  <MarketCard
                    key={
                      market._id
                    }
                    market={
                      market
                    }
                  />
                )
              )}

            </div>
          </>
        )}

      </section>

    </div>
  );
}


// ======================================================
// MARKET CARD
// ======================================================

function MarketCard({
  market,
}: {
  market: Market;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition hover:-translate-y-1 hover:shadow-lg">

      {/* MAP PREVIEW */}

      <div className="flex h-36 items-center justify-center bg-[#DCFCE7]">

        <div className="text-center text-[#166534]">

          <Map
            size={36}
            className="mx-auto"
          />

          <p className="mt-2 text-xs font-medium">
            Market Location
          </p>

        </div>

      </div>


      <div className="p-6">

        <h2 className="text-lg font-semibold text-[#1F2937]">
          {market.name}
        </h2>


        <div className="mt-4 flex items-start gap-2 text-sm text-[#6B7280]">

          <MapPin
            size={17}
            className="mt-0.5 shrink-0 text-[#166534]"
          />

          <span>
            {market.address}
          </span>

        </div>


        <div className="mt-3 flex items-start gap-2 text-sm text-[#6B7280]">

          <CalendarDays
            size={17}
            className="mt-0.5 shrink-0 text-[#166534]"
          />

          <span>
            {market.operatingDays.join(
              ", "
            )}
          </span>

        </div>


        <div className="mt-3 flex items-center gap-2 text-sm text-[#6B7280]">

          <Clock
            size={17}
            className="shrink-0 text-[#166534]"
          />

          <span>
            {market.openingTime}
            {" – "}
            {market.closingTime}
          </span>

        </div>


        <Link
          href={`/markets/${market._id}`}
          className="mt-6 flex items-center justify-between border-t border-[#E5E7EB] pt-5 text-sm font-semibold text-[#166534]"
        >
          View Market

          <ArrowRight
            size={17}
          />
        </Link>

      </div>

    </article>
  );
}