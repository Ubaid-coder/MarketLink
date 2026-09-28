"use client";

import { useState } from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
} from "lucide-react";

import api from "@/lib/api";

import { useAuth } from "@/context/AuthContext";

import ProductForm from "@/components/farmer/ProductForm";

import { FarmerProductFormData } from "@/types/farmerProduct";


export default function NewProductPage() {
  const router =
    useRouter();

  const {
    farmerProfile,
  } = useAuth();

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleSubmit = async (
    form: FarmerProductFormData
  ) => {
    if (
      farmerProfile?.approvalStatus !==
      "approved"
    ) {
      setError(
        "Your farmer account must be approved first."
      );

      return;
    }


    try {
      setSubmitting(true);
      setError("");

      await api.post(
        "/products",
        {
          name:
            form.name.trim(),

          category:
            form.category,

          description:
            form.description.trim(),

          price:
            Number(form.price),

          unit:
            form.unit.trim(),

          quantityAvailable:
            Number(
              form.quantityAvailable
            ),

          image:
            form.image.trim(),

          weeklyStockTemplate: {
            enabled:
              form.weeklyStockEnabled,

            defaultQuantity:
              Number(
                form.weeklyDefaultQuantity ||
                  0
              ),
          },
        }
      );


      router.push(
        "/farmer/products"
      );

      router.refresh();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to create product."
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
            href="/farmer/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft size={16} />

            Products
          </Link>


          <h1 className="mt-5 text-3xl font-bold text-[#1F2937]">
            Add Product
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Publish a product to your
            MarketLink inventory.
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


          <ProductForm
            submitting={
              submitting
            }
            submitLabel="Create Product"
            onSubmit={
              handleSubmit
            }
          />

        </div>

      </div>
    </div>
  );
}