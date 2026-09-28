"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { ArrowLeft } from "lucide-react";

import api from "@/lib/api";

import MarketForm, {
  MarketFormData,
} from "@/components/admin/MarketForm";

import { Market } from "@/types/marketplace";

export default function EditMarketPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [
    initialData,
    setInitialData,
  ] =
    useState<MarketFormData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadMarket =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/markets/${id}`
          );

        const market: Market =
          response.data.market ||
          response.data.data ||
          response.data;

        setInitialData({
          name: market.name || "",

          address:
            market.address || "",

          operatingDays:
            market.operatingDays ||
            [],

          openingTime:
            market.openingTime ||
            "",

          closingTime:
            market.closingTime ||
            "",

          latitude: String(
            market.latitude ?? ""
          ),

          longitude: String(
            market.longitude ?? ""
          ),
        });
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to load market."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    if (id) {
      loadMarket();
    }
  }, [id, loadMarket]);

  const updateMarket = async (
    form: MarketFormData
  ) => {
    try {
      setSubmitting(true);
      setError("");

      await api.patch(
        `/markets/${id}`,
        {
          name: form.name.trim(),

          address:
            form.address.trim(),

          operatingDays:
            form.operatingDays,

          openingTime:
            form.openingTime,

          closingTime:
            form.closingTime,

          latitude:
            Number(form.latitude),

          longitude:
            Number(form.longitude),
        }
      );

      router.push(
        "/admin/markets"
      );

      router.refresh();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update market."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto h-96 max-w-4xl animate-pulse rounded-2xl bg-[#E5E7EB]" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-[#1F2937]">
            Market not found
          </h1>

          <p className="mt-2 text-sm text-[#DC2626]">
            {error}
          </p>

          <Link
            href="/admin/markets"
            className="mt-5 inline-block font-semibold text-[#166534]"
          >
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="px-5 py-7 sm:px-8 lg:px-10">
          <Link
            href="/admin/markets"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft size={16} />
            Markets
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-[#1F2937]">
            Edit Market
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Update market location and
            operating information.
          </p>
        </div>
      </header>

      <div className="p-5 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          <MarketForm
            initialData={initialData}
            submitting={submitting}
            submitLabel="Save Changes"
            onSubmit={updateMarket}
          />
        </div>
      </div>
    </div>
  );
}