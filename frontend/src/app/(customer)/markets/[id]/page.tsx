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
  ArrowRight,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Store,
} from "lucide-react";

import api from "@/lib/api";

import {
  Farmer,
  Market,
} from "@/types/marketplace";


export default function MarketDetailsPage() {
  const params =
    useParams();

  const id =
    params.id as string;

  const [
    market,
    setMarket,
  ] =
    useState<Market | null>(
      null
    );

  const [
    farmers,
    setFarmers,
  ] =
    useState<Farmer[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ================================================
  // LOAD MARKET + FARMERS
  // ================================================

  useEffect(() => {
    if (!id) return;

    const loadData =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            marketResponse,
            farmerResponse,
          ] =
            await Promise.all([
              api.get(
                `/markets/${id}`
              ),

              api.get(
                `/marketplace/markets/${id}/farmers`
              ),
            ]);


          setMarket(
            marketResponse.data
              .market ||
              marketResponse.data
          );


          setFarmers(
            farmerResponse.data
              .farmers ||
              []
          );
        } catch (error) {
          console.error(
            error
          );

          setError(
            "Unable to load this market."
          );
        } finally {
          setLoading(false);
        }
      };

    loadData();
  }, [id]);


  if (loading) {
    return (
      <MarketDetailsLoading />
    );
  }


  if (
    error ||
    !market
  ) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20">

        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <MapPin
            size={38}
            className="mx-auto text-[#DC2626]"
          />

          <h1 className="mt-4 text-xl font-semibold text-[#1F2937]">
            Market unavailable
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            {error}
          </p>

        </div>

      </div>
    );
  }


  const mapUrl =
    createMapUrl(
      market.latitude,
      market.longitude
    );


  return (
    <div>

      {/* HEADER */}

      <section className="border-b border-[#E5E7EB] bg-[#F0FDF4]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            All Markets
          </Link>


          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
                Market location
              </p>

              <h1 className="mt-2 text-4xl font-bold text-[#1F2937]">
                {market.name}
              </h1>


              <div className="mt-6 space-y-4">

                <MarketInfo
                  icon={
                    <MapPin
                      size={19}
                    />
                  }
                  value={
                    market.address
                  }
                />

                <MarketInfo
                  icon={
                    <CalendarDays
                      size={19}
                    />
                  }
                  value={market.operatingDays.join(
                    ", "
                  )}
                />

                <MarketInfo
                  icon={
                    <Clock
                      size={19}
                    />
                  }
                  value={`${market.openingTime} – ${market.closingTime}`}
                />

              </div>


              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#14532D]"
              >
                <Navigation
                  size={17}
                />

                Open in Maps

                <ExternalLink
                  size={14}
                />
              </a>

            </div>


            {/* MAP */}

            <MarketMap
              market={
                market
              }
            />

          </div>

        </div>

      </section>


      {/* FARMERS */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Shop locally
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#1F2937]">
            Farmers at{" "}
            {market.name}
          </h2>

          <p className="mt-2 text-[#6B7280]">
            {farmers.length}{" "}
            {farmers.length ===
            1
              ? "farmer"
              : "farmers"}{" "}
            currently listed at
            this market.
          </p>

        </div>


        {farmers.length >
        0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {farmers.map(
              (farmer) => (
                <FarmerMarketCard
                  key={
                    farmer._id
                  }
                  farmer={
                    farmer
                  }
                  marketId={
                    market._id
                  }
                />
              )
            )}

          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-16 text-center">

            <Store
              size={38}
              className="mx-auto text-[#166534]"
            />

            <h3 className="mt-4 font-semibold text-[#1F2937]">
              No farmers listed
            </h3>

            <p className="mt-2 text-sm text-[#6B7280]">
              There are currently
              no approved farmers
              listed at this market.
            </p>

          </div>
        )}

      </section>

    </div>
  );
}


// ======================================================
// MAP
// ======================================================

function MarketMap({
  market,
}: {
  market: Market;
}) {
  const latitude =
    Number(
      market.latitude
    );

  const longitude =
    Number(
      market.longitude
    );

  if (
    !Number.isFinite(
      latitude
    ) ||
    !Number.isFinite(
      longitude
    )
  ) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white">

        <div className="text-center">

          <MapPin
            size={35}
            className="mx-auto text-[#166534]"
          />

          <p className="mt-3 text-sm text-[#6B7280]">
            Map coordinates unavailable
          </p>

        </div>

      </div>
    );
  }


  /*
   * OpenStreetMap embed.
   *
   * No API key is required for this
   * simple iframe implementation.
   */

  const delta =
    0.008;

  const bbox = [
    longitude - delta,
    latitude - delta,
    longitude + delta,
    latitude + delta,
  ].join(",");


  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
      bbox
    )}&layer=mapnik&marker=${encodeURIComponent(
      `${latitude},${longitude}`
    )}`;


  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">

      <iframe
        title={`${market.name} map`}
        src={embedUrl}
        className="h-80 w-full border-0"
        loading="lazy"
      />

    </div>
  );
}


// ======================================================
// FARMER CARD
// ======================================================

function FarmerMarketCard({
  farmer,
  marketId,
}: {
  farmer: Farmer;
  marketId: string;
}) {
  const schedule =
    farmer.marketSchedules
      ?.find(
        (item) =>
          item.market
            ?._id ===
          marketId
      );


  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

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


      {schedule && (
        <div className="mt-5 space-y-3 border-t border-[#E5E7EB] pt-5">

          <div className="flex items-start gap-2 text-sm text-[#6B7280]">

            <CalendarDays
              size={16}
              className="mt-0.5 shrink-0 text-[#166534]"
            />

            <span>
              {schedule.operatingDays.join(
                ", "
              )}
            </span>

          </div>


          {schedule
            .stallLocation
            ?.description && (
            <div className="flex items-start gap-2 text-sm text-[#6B7280]">

              <MapPin
                size={16}
                className="mt-0.5 shrink-0 text-[#166534]"
              />

              <span>
                {
                  schedule
                    .stallLocation
                    .description
                }
              </span>

            </div>
          )}

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


// ======================================================
// MARKET INFO
// ======================================================

function MarketInfo({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="mt-0.5 text-[#166534]">
        {icon}
      </div>

      <span className="text-[#6B7280]">
        {value}
      </span>

    </div>
  );
}


// ======================================================
// MAP URL
// ======================================================

function createMapUrl(
  latitude: number,
  longitude: number
) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}


// ======================================================
// LOADING
// ======================================================

function MarketDetailsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="h-12 w-72 animate-pulse rounded bg-[#E5E7EB]" />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">

        <div className="h-72 animate-pulse rounded-2xl bg-[#E5E7EB]" />

        <div className="h-72 animate-pulse rounded-2xl bg-[#E5E7EB]" />

      </div>

    </div>
  );
}