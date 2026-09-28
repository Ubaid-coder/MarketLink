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

import {
  ArrowLeft,
} from "lucide-react";

import api from "@/lib/api";

import ProductForm from "@/components/farmer/ProductForm";

import {
  FarmerProduct,
  FarmerProductFormData,
} from "@/types/farmerProduct";


export default function EditProductPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const id =
    params.id as string;


  const [initialData, setInitialData] =
    useState<FarmerProductFormData | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");


  // ========================================
  // LOAD PRODUCT
  // ========================================

  const loadProduct =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/products/mine/${id}`
          );

        const product: FarmerProduct =
          response.data.product ||
          response.data.data ||
          response.data;


        const categoryId =
          typeof product.category ===
          "string"
            ? product.category
            : product.category?._id ||
              "";


        setInitialData({
          name:
            product.name || "",

          category:
            categoryId,

          description:
            product.description ||
            "",

          price:
            String(
              product.price ?? ""
            ),

          unit:
            product.unit || "",

          quantityAvailable:
            String(
              product.quantityAvailable ??
                ""
            ),

          image:
            product.image || "",

          weeklyStockEnabled:
            product
              .weeklyStockTemplate
              ?.enabled || false,

          weeklyDefaultQuantity:
            String(
              product
                .weeklyStockTemplate
                ?.defaultQuantity ??
                0
            ),
        });
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    }, [id]);


  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [
    id,
    loadProduct,
  ]);


  // ========================================
  // UPDATE
  // ========================================

  const handleSubmit = async (
    form: FarmerProductFormData
  ) => {
    try {
      setSubmitting(true);
      setError("");

      await api.patch(
        `/products/${id}`,
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
          "Unable to update product."
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

        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <h1 className="text-xl font-semibold text-[#1F2937]">
            Product not found
          </h1>

          <p className="mt-2 text-sm text-[#DC2626]">
            {error}
          </p>


          <Link
            href="/farmer/products"
            className="mt-5 inline-block font-semibold text-[#166534]"
          >
            Back to Products
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
            href="/farmer/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft size={16} />

            Products
          </Link>


          <h1 className="mt-5 text-3xl font-bold text-[#1F2937]">
            Edit Product
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Update product information
            and inventory.
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
            initialData={
              initialData
            }
            submitting={
              submitting
            }
            submitLabel="Save Changes"
            onSubmit={
              handleSubmit
            }
          />

        </div>

      </div>
    </div>
  );
}