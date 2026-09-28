"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

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

  const {
    farmerProfile,
  } = useAuth();

  const [
    product,
    setProduct,
  ] =
    useState<FarmerProduct | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ================================================
  // APPROVAL
  // ================================================

  useEffect(() => {
    if (
      farmerProfile &&
      farmerProfile.approvalStatus !==
        "approved"
    ) {
      router.replace(
        "/farmer/products"
      );
    }
  }, [
    farmerProfile,
    router,
  ]);


  // ================================================
  // LOAD
  // ================================================

  useEffect(() => {
    if (!id) {
      return;
    }


    const loadProduct =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              `/products/mine/${id}`
            );

          setProduct(
            response.data.product ||
              response.data
          );
        } catch (error: any) {
          console.error(
            error
          );

          setError(
            error?.response
              ?.data?.message ||
              "Unable to load product."
          );
        } finally {
          setLoading(false);
        }
      };


    loadProduct();
  }, [id]);


  // ================================================
  // UPDATE
  // ================================================

  const updateProduct =
    async (
      form:
        FarmerProductFormData
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
              form.description.trim() ||
              undefined,

            price:
              Number(
                form.price
              ),

            unit:
              form.unit.trim(),

            quantityAvailable:
              Number(
                form.quantityAvailable
              ),

            image:
              form.image.trim() ||
              undefined,

            weeklyStockTemplate: {
              enabled:
                form.weeklyStockEnabled,

              defaultQuantity:
                form.weeklyStockEnabled
                  ? Number(
                      form.weeklyDefaultQuantity
                    )
                  : 0,
            },
          }
        );


        router.push(
          "/farmer/products"
        );

        router.refresh();
      } catch (error: any) {
        console.error(
          error
        );

        setError(
          error?.response
            ?.data?.message ||
            "Unable to update product."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };


  // ================================================
  // LOADING
  // ================================================

  if (loading) {
    return (
      <div className="p-10">

        <div className="mx-auto max-w-4xl space-y-6">

          <div className="h-10 w-52 animate-pulse rounded bg-[#E5E7EB]" />

          <div className="h-80 animate-pulse rounded-2xl bg-[#E5E7EB]" />

          <div className="h-52 animate-pulse rounded-2xl bg-[#E5E7EB]" />

        </div>

      </div>
    );
  }


  if (!product) {
    return (
      <div className="p-10">

        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <p className="font-semibold text-[#DC2626]">
            {error ||
              "Product not found."}
          </p>

          <Link
            href="/farmer/products"
            className="mt-5 inline-flex text-sm font-semibold text-[#166534]"
          >
            Back to Products
          </Link>

        </div>

      </div>
    );
  }


  const categoryId =
    typeof product.category ===
    "string"
      ? product.category
      : product.category
          ?._id ||
        "";


  const initialData:
    FarmerProductFormData = {
    name:
      product.name,

    category:
      categoryId,

    description:
      product.description ||
      "",

    price:
      String(
        product.price
      ),

    unit:
      product.unit,

    quantityAvailable:
      String(
        product.quantityAvailable
      ),

    image:
      product.image ||
      "",

    weeklyStockEnabled:
      product
        .weeklyStockTemplate
        ?.enabled ||
      false,

    weeklyDefaultQuantity:
      String(
        product
          .weeklyStockTemplate
          ?.defaultQuantity ??
          0
      ),
  };


  return (
    <div>

      <header className="border-b border-[#E5E7EB] bg-white">

        <div className="px-5 py-7 sm:px-8 lg:px-10">

          <Link
            href="/farmer/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B7280] hover:text-[#166534]"
          >
            <ArrowLeft
              size={16}
            />

            Products
          </Link>


          <h1 className="mt-6 text-3xl font-bold text-[#1F2937]">
            Edit Product
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Update{" "}
            <span className="font-medium text-[#1F2937]">
              {product.name}
            </span>
            .
          </p>

        </div>

      </header>


      <div className="mx-auto max-w-4xl p-5 sm:p-8 lg:p-10">

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
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
            updateProduct
          }
        />

      </div>

    </div>
  );
}