"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import api from "@/lib/api";

import MarketForm, {
  MarketFormData,
} from "@/components/admin/MarketForm";

export default function NewMarketPage() {
  const router = useRouter();

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const createMarket = async (
    form: MarketFormData
  ) => {
    try {
      setSubmitting(true);
      setError("");

      await api.post("/markets", {
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
      });

      router.push(
        "/admin/markets"
      );

      router.refresh();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to create market."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            Add Market
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Create a farmers-market
            location on MarketLink.
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
            submitting={submitting}
            submitLabel="Create Market"
            onSubmit={createMarket}
          />
        </div>
      </div>
    </div>
  );
}