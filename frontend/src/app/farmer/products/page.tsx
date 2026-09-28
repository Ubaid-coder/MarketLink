"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  Edit3,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

import {
  FarmerProduct,
  ProductStatus,
} from "@/types/farmerProduct";


type StatusFilter =
  | "all"
  | ProductStatus;


export default function FarmerProductsPage() {
  const { farmerProfile } =
    useAuth();

  const [products, setProducts] =
    useState<FarmerProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [deleteProduct, setDeleteProduct] =
    useState<FarmerProduct | null>(
      null
    );

  const [deleting, setDeleting] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);


  const approved =
    farmerProfile?.approvalStatus ===
    "approved";


  // =========================================
  // LOAD
  // =========================================

  const loadProducts =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/products/mine"
          );

        const raw =
          response.data.products ||
          response.data.data ||
          response.data ||
          [];

        setProducts(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    loadProducts();
  }, [loadProducts]);


  // =========================================
  // FILTER
  // =========================================

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const categoryName =
            typeof product.category ===
            "string"
              ? ""
              : product.category?.name ||
                "";

          const matchesSearch =
            !query ||
            product.name
              .toLowerCase()
              .includes(query) ||
            categoryName
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "all" ||
            product.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      products,
      search,
      statusFilter,
    ]);


  // =========================================
  // STATUS
  // =========================================

  const changeStatus = async (
    product: FarmerProduct,
    status: ProductStatus
  ) => {
    if (!approved) return;

    try {
      setUpdatingId(
        product._id
      );

      await api.patch(
        `/products/${product._id}/status`,
        {
          status,
        }
      );

      await loadProducts();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update product status."
      );
    } finally {
      setUpdatingId(null);
    }
  };


  // =========================================
  // WEEKLY RESET
  // =========================================

  const resetWeeklyStock =
    async (
      product: FarmerProduct
    ) => {
      if (!approved) return;

      try {
        setUpdatingId(
          product._id
        );

        await api.patch(
          `/products/${product._id}/reset-weekly-stock`
        );

        await loadProducts();
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to reset weekly stock."
        );
      } finally {
        setUpdatingId(null);
      }
    };


  // =========================================
  // DELETE
  // =========================================

  const confirmDelete =
    async () => {
      if (
        !deleteProduct ||
        !approved
      ) {
        return;
      }

      try {
        setDeleting(true);

        await api.delete(
          `/products/${deleteProduct._id}`
        );

        setDeleteProduct(null);

        await loadProducts();
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to delete product."
        );
      } finally {
        setDeleting(false);
      }
    };


  const stats = {
    total:
      products.length,

    available:
      products.filter(
        (product) =>
          product.status ===
            "available" &&
          product.quantityAvailable > 0
      ).length,

    soldOut:
      products.filter(
        (product) =>
          product.status ===
          "sold_out"
      ).length,

    unavailable:
      products.filter(
        (product) =>
          product.status ===
          "unavailable"
      ).length,
  };


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Inventory
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Products
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Manage your products,
              availability and weekly
              stock.
            </p>
          </div>


          <Link
            href={
              approved
                ? "/farmer/products/new"
                : "#"
            }
            aria-disabled={!approved}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white ${
              approved
                ? "bg-[#166534] hover:bg-[#14532D]"
                : "pointer-events-none bg-gray-300"
            }`}
          >
            <Plus size={17} />

            Add Product
          </Link>
        </div>
      </header>


      <div className="space-y-7 p-5 sm:p-8 lg:p-10">

        {!approved && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Your farmer account must
            be approved before you can
            create or modify products.
          </div>
        )}


        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            label="Total Products"
            value={stats.total}
          />

          <Stat
            label="Available"
            value={
              stats.available
            }
          />

          <Stat
            label="Sold Out"
            value={
              stats.soldOut
            }
          />

          <Stat
            label="Unavailable"
            value={
              stats.unavailable
            }
          />
        </div>


        {/* FILTERS */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">

            <div className="flex flex-1 items-center rounded-xl border border-[#E5E7EB] px-4">
              <Search
                size={17}
                className="text-[#6B7280]"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>


            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter
                )
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus:border-[#22C55E]"
            >
              <option value="all">
                All statuses
              </option>

              <option value="available">
                Available
              </option>

              <option value="sold_out">
                Sold Out
              </option>

              <option value="unavailable">
                Unavailable
              </option>
            </select>


            <button
              type="button"
              onClick={
                loadProducts
              }
              className="flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
            >
              <RefreshCcw
                size={16}
              />

              Refresh
            </button>

          </div>
        </section>


        {/* PRODUCTS */}

        {loading ? (
          <div className="space-y-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-[#E5E7EB]"
              />
            ))}
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <Package
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Add products to start
              publishing your weekly
              inventory.
            </p>

          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead className="bg-[#FAFAF7] text-left text-xs uppercase tracking-wide text-[#6B7280]">
                  <tr>
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Price
                    </th>

                    <th className="px-5 py-4">
                      Stock
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Weekly
                    </th>

                    <th className="px-5 py-4 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>


                <tbody className="divide-y divide-[#E5E7EB]">

                  {filteredProducts.map(
                    (product) => (
                      <ProductRow
                        key={
                          product._id
                        }
                        product={
                          product
                        }
                        approved={
                          approved
                        }
                        updating={
                          updatingId ===
                          product._id
                        }
                        onStatus={
                          changeStatus
                        }
                        onReset={
                          resetWeeklyStock
                        }
                        onDelete={() =>
                          setDeleteProduct(
                            product
                          )
                        }
                      />
                    )
                  )}

                </tbody>

              </table>

            </div>
          </div>
        )}

      </div>


      {/* DELETE MODAL */}

      {deleteProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">
              <Trash2 size={19} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
              Delete product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Are you sure you want to
              remove{" "}
              <strong>
                {deleteProduct.name}
              </strong>
              ?
            </p>


            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteProduct(
                    null
                  )
                }
                className="rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#6B7280]"
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={deleting}
                onClick={
                  confirmDelete
                }
                className="rounded-xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}


// ===============================================
// PRODUCT ROW
// ===============================================

function ProductRow({
  product,
  approved,
  updating,
  onStatus,
  onReset,
  onDelete,
}: {
  product: FarmerProduct;

  approved: boolean;

  updating: boolean;

  onStatus: (
    product: FarmerProduct,
    status: ProductStatus
  ) => void;

  onReset: (
    product: FarmerProduct
  ) => void;

  onDelete: () => void;
}) {
  const category =
    typeof product.category ===
    "string"
      ? "Category"
      : product.category?.name ||
        "Category";


  return (
    <tr className="hover:bg-[#FAFAF7]">

      <td className="px-5 py-4">

        <div className="flex items-center gap-3">

          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#DCFCE7]">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#166534]">
                <Package
                  size={19}
                />
              </div>
            )}

          </div>


          <div>
            <p className="font-semibold text-[#1F2937]">
              {product.name}
            </p>

            <p className="mt-1 text-xs text-[#6B7280]">
              {category}
            </p>
          </div>

        </div>

      </td>


      <td className="px-5 py-4 text-sm font-medium text-[#1F2937]">
        PKR{" "}
        {product.price.toLocaleString()}{" "}
        / {product.unit}
      </td>


      <td className="px-5 py-4">

        <p className="font-semibold text-[#1F2937]">
          {
            product.quantityAvailable
          }
        </p>

        <p className="text-xs text-[#6B7280]">
          {product.unit}
        </p>

      </td>


      <td className="px-5 py-4">

        <select
          value={
            product.status
          }
          disabled={
            !approved ||
            updating
          }
          onChange={(event) =>
            onStatus(
              product,
              event.target
                .value as ProductStatus
            )
          }
          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="available">
            Available
          </option>

          <option value="sold_out">
            Sold Out
          </option>

          <option value="unavailable">
            Unavailable
          </option>
        </select>

      </td>


      <td className="px-5 py-4">

        {product
          .weeklyStockTemplate
          ?.enabled ? (
          <div>
            <p className="text-sm font-medium text-[#166534]">
              {
                product
                  .weeklyStockTemplate
                  .defaultQuantity
              }{" "}
              {product.unit}
            </p>

            <button
              type="button"
              disabled={
                !approved ||
                updating
              }
              onClick={() =>
                onReset(product)
              }
              className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#166534] disabled:opacity-40"
            >
              <RefreshCcw
                size={12}
              />

              Reset stock
            </button>
          </div>
        ) : (
          <span className="text-sm text-[#9CA3AF]">
            Disabled
          </span>
        )}

      </td>


      <td className="px-5 py-4">

        <div className="flex justify-end gap-2">

          <Link
            href={`/farmer/products/${product._id}/edit`}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#166534] hover:bg-[#DCFCE7] ${
              !approved
                ? "pointer-events-none opacity-40"
                : ""
            }`}
          >
            <Edit3 size={15} />
          </Link>


          <button
            type="button"
            disabled={
              !approved ||
              updating
            }
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-[#DC2626] hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 size={15} />
          </button>

        </div>

      </td>

    </tr>
  );
}


// ===============================================
// STAT
// ===============================================

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

      <p className="text-sm text-[#6B7280]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#1F2937]">
        {value}
      </p>

    </div>
  );
}