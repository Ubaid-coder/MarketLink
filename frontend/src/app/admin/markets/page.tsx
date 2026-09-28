"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Clock3,
  Edit3,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  Store,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";
import { Market } from "@/types/marketplace";

export default function AdminMarketsPage() {
  const [markets, setMarkets] =
    useState<Market[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [deleting, setDeleting] =
    useState<string | null>(null);

  const loadMarkets =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/markets");

        const raw =
          response.data.markets ||
          response.data.data ||
          response.data ||
          [];

        setMarkets(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to load markets."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadMarkets();
  }, [loadMarkets]);

  const filtered =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return markets;
      }

      return markets.filter(
        (market) =>
          `${market.name} ${market.address}`
            .toLowerCase()
            .includes(query)
      );
    }, [markets, search]);

  const deleteMarket = async (
    market: Market
  ) => {
    const confirmed =
      window.confirm(
        `Remove "${market.name}"?`
      );

    if (!confirmed) return;

    try {
      setDeleting(market._id);

      await api.delete(
        `/markets/${market._id}`
      );

      await loadMarkets();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to remove market."
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Markets
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Manage marketplace locations,
              schedules and map coordinates.
            </p>
          </div>

          <Link
            href="/admin/markets/new"
            className="flex items-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white hover:bg-[#14532D]"
          >
            <Plus size={17} />
            Add Market
          </Link>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <p className="text-sm text-[#6B7280]">
            Total Markets
          </p>

          <p className="mt-2 text-3xl font-bold text-[#1F2937]">
            {markets.length}
          </p>
        </div>

        {/* SEARCH */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center rounded-xl border border-[#E5E7EB] px-4">
              <Search
                size={17}
                className="text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search market or address..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <button
              type="button"
              onClick={loadMarkets}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
            >
              <RefreshCcw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </section>

        {/* LIST */}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-2xl bg-[#E5E7EB]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
            <Store
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No markets found
            </h2>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filtered.map(
              (market) => (
                <article
                  key={market._id}
                  className="rounded-2xl border border-[#E5E7EB] bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
                        <Store
                          size={19}
                        />
                      </div>

                      <div>
                        <h2 className="font-semibold text-[#1F2937]">
                          {market.name}
                        </h2>

                        <p className="mt-2 flex items-start gap-2 text-sm text-[#6B7280]">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0"
                          />

                          {market.address}
                        </p>
                      </div>
                    </div>

                    {market.isActive ===
                      false && (
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                      Operating Days
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {market.operatingDays.map(
                        (day) => (
                          <span
                            key={day}
                            className="rounded-lg bg-[#DCFCE7] px-2.5 py-1 text-xs font-medium text-[#166534]"
                          >
                            {day}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-sm text-[#6B7280]">
                    <Clock3
                      size={15}
                      className="text-[#166534]"
                    />

                    {market.openingTime} –{" "}
                    {market.closingTime}
                  </div>

                  <div className="mt-2 text-xs text-[#9CA3AF]">
                    {market.latitude},{" "}
                    {market.longitude}
                  </div>

                  <div className="mt-6 flex justify-end gap-2 border-t border-[#E5E7EB] pt-5">
                    <Link
                      href={`/admin/markets/${market._id}/edit`}
                      className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
                    >
                      <Edit3 size={15} />
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={
                        deleting ===
                        market._id
                      }
                      onClick={() =>
                        deleteMarket(
                          market
                        )
                      }
                      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-[#DC2626] hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2
                        size={15}
                      />

                      {deleting ===
                      market._id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}