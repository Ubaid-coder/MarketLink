"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Ban,
  CheckCircle2,
  PackageSearch,
  RefreshCcw,
  Search,
  Store,
} from "lucide-react";

import api from "@/lib/api";

interface AdminProduct {
  _id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  quantityAvailable: number;
  image?: string;

  status:
    | "available"
    | "sold_out"
    | "unavailable";

  isActive: boolean;

  category:
    | {
        _id: string;
        name: string;
      }
    | string;

  farmer:
    | {
        _id: string;
        stallName: string;
        contactPerson?: string;
      }
    | string;

  createdAt?: string;
}

type ProductFilter =
  | "all"
  | "available"
  | "sold_out"
  | "unavailable";

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState<AdminProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<ProductFilter>("all");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const loadProducts =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/products"
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

  const changeStatus = async (
    product: AdminProduct,
    status:
      | "available"
      | "unavailable"
  ) => {
    try {
      setUpdatingId(product._id);
      setError("");

      await api.patch(
        `/admin/products/${product._id}/status`,
        {
          status,
        }
      );

      await loadProducts();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update product."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const farmer =
            typeof product.farmer ===
            "string"
              ? ""
              : product.farmer
                  .stallName;

          const category =
            typeof product.category ===
            "string"
              ? ""
              : product.category.name;

          const text = [
            product.name,
            farmer,
            category,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesStatus =
            filter === "all" ||
            product.status ===
              filter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      products,
      search,
      filter,
    ]);

  return (
    <div>
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Moderation
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Products
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Review products published
              by MarketLink farmers.
            </p>
          </div>

          <button
            onClick={loadProducts}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7]"
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
      </header>

      <div className="space-y-6 p-5 sm:p-8 lg:p-10">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}

        {/* FILTER */}

        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row">
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
                placeholder="Search product, farmer or category..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target
                    .value as ProductFilter
                )
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">
                All Products
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
          </div>
        </section>

        {/* TABLE */}

        {loading ? (
          <div className="h-80 animate-pulse rounded-2xl bg-[#E5E7EB]" />
        ) : filteredProducts.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
            <PackageSearch
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No products found
            </h2>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead className="bg-[#FAFAF7] text-left text-xs uppercase text-[#6B7280]">
                  <tr>
                    <th className="px-5 py-4">
                      Product
                    </th>

                    <th className="px-5 py-4">
                      Farmer
                    </th>

                    <th className="px-5 py-4">
                      Category
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

                    <th className="px-5 py-4 text-right">
                      Moderation
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredProducts.map(
                    (product) => {
                      const farmer =
                        typeof product.farmer ===
                        "string"
                          ? null
                          : product.farmer;

                      const category =
                        typeof product.category ===
                        "string"
                          ? null
                          : product.category;

                      return (
                        <tr
                          key={
                            product._id
                          }
                          className="hover:bg-[#FAFAF7]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 overflow-hidden rounded-xl bg-[#DCFCE7]">
                                {product.image ? (
                                  <img
                                    src={
                                      product.image
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[#166534]">
                                    <PackageSearch
                                      size={
                                        18
                                      }
                                    />
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="font-semibold text-[#1F2937]">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[#6B7280]">
                                  ID:{" "}
                                  {product._id.slice(
                                    -6
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Store
                                size={14}
                                className="text-[#166534]"
                              />

                              {farmer?.stallName ||
                                "Farmer"}
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-[#6B7280]">
                            {category?.name ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            PKR{" "}
                            {product.price.toLocaleString()}
                            <span className="text-xs font-normal text-[#6B7280]">
                              {" "}
                              /{" "}
                              {
                                product.unit
                              }
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {
                              product.quantityAvailable
                            }
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                product.status
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-right">
                            {product.status ===
                            "unavailable" ? (
                              <button
                                disabled={
                                  updatingId ===
                                  product._id
                                }
                                onClick={() =>
                                  changeStatus(
                                    product,
                                    "available"
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                <CheckCircle2
                                  size={
                                    14
                                  }
                                />

                                Restore
                              </button>
                            ) : (
                              <button
                                disabled={
                                  updatingId ===
                                  product._id
                                }
                                onClick={() =>
                                  changeStatus(
                                    product,
                                    "unavailable"
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-[#DC2626] hover:bg-red-50 disabled:opacity-50"
                              >
                                <Ban
                                  size={
                                    14
                                  }
                                />

                                Hide
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AdminProduct["status"];
}) {
  const styles = {
    available:
      "bg-[#DCFCE7] text-[#166534]",

    sold_out:
      "bg-amber-100 text-amber-800",

    unavailable:
      "bg-red-100 text-[#DC2626]",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}