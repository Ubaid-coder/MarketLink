"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Filter,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
  X,
} from "lucide-react";

import api from "@/lib/api";

import ProductCard from "@/components/customer/ProductCard";

import {
  Category,
  Market,
  Product,
} from "@/types/marketplace";


// ======================================================
// FILTER TYPES
// ======================================================

interface Filters {
  search: string;
  category: string;
  market: string;
  day: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
}

const initialFilters: Filters = {
  search: "",
  category: "",
  market: "",
  day: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};


const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];


// ======================================================
// PAGE
// ======================================================

export default function MarketplacePage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [markets, setMarkets] =
    useState<Market[]>([]);

  const [filters, setFilters] =
    useState<Filters>(initialFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);


  // ====================================================
  // LOAD FILTER DATA
  // ====================================================

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [
          categoryResponse,
          marketResponse,
        ] = await Promise.all([
          api.get("/categories"),
          api.get("/markets"),
        ]);

        setCategories(
          categoryResponse.data.categories ||
            categoryResponse.data ||
            []
        );

        setMarkets(
          marketResponse.data.markets ||
            marketResponse.data ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load marketplace filters:",
          error
        );
      }
    };

    loadFilterData();
  }, []);


  // ====================================================
  // LOAD PRODUCTS
  // ====================================================

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const params: Record<string, string> = {};

        if (appliedFilters.search) {
          params.search = appliedFilters.search;
        }

        if (appliedFilters.category) {
          params.category =
            appliedFilters.category;
        }

        if (appliedFilters.market) {
          params.market =
            appliedFilters.market;
        }

        if (appliedFilters.day) {
          params.day =
            appliedFilters.day;
        }

        if (appliedFilters.minPrice) {
          params.minPrice =
            appliedFilters.minPrice;
        }

        if (appliedFilters.maxPrice) {
          params.maxPrice =
            appliedFilters.maxPrice;
        }

        if (appliedFilters.sort) {
          params.sort =
            appliedFilters.sort;
        }

        const response = await api.get(
          "/marketplace/products",
          {
            params,
          }
        );

        setProducts(
          response.data.products || []
        );
      } catch (error) {
        console.error(
          "Failed to load marketplace products:",
          error
        );

        setError(
          "Unable to load marketplace products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [appliedFilters]);


  // ====================================================
  // INPUT CHANGE
  // ====================================================

  const updateFilter = (
    key: keyof Filters,
    value: string
  ) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };


  // ====================================================
  // APPLY FILTERS
  // ====================================================

  const applyFilters = (
    event?: FormEvent
  ) => {
    event?.preventDefault();

    setAppliedFilters(filters);

    setMobileFiltersOpen(false);
  };


  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };


  // ====================================================
  // SORT
  // ====================================================

  const handleSort = (
    value: string
  ) => {
    const next = {
      ...filters,
      sort: value,
    };

    setFilters(next);

    setAppliedFilters((previous) => ({
      ...previous,
      sort: value,
    }));
  };


  // ====================================================
  // ACTIVE FILTER COUNT
  // ====================================================

  const activeFilterCount = [
    appliedFilters.category,
    appliedFilters.market,
    appliedFilters.day,
    appliedFilters.minPrice,
    appliedFilters.maxPrice,
  ].filter(Boolean).length;


  return (
    <div className="min-h-screen">

      {/* =============================================
          PAGE HEADER
      ============================================== */}

      <section className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Local marketplace
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#1F2937] sm:text-4xl">
            Fresh Produce
          </h1>

          <p className="mt-3 max-w-2xl text-[#6B7280]">
            Browse fresh produce from approved local
            farmers and reserve your order for market
            pickup.
          </p>


          {/* SEARCH */}

          <form
            onSubmit={applyFilters}
            className="mt-7 flex max-w-2xl overflow-hidden rounded-xl border border-[#E5E7EB] bg-white focus-within:border-[#166534] focus-within:ring-2 focus-within:ring-green-100"
          >
            <div className="flex flex-1 items-center px-4">
              <Search
                size={19}
                className="shrink-0 text-[#6B7280]"
              />

              <input
                type="text"
                value={filters.search}
                onChange={(event) =>
                  updateFilter(
                    "search",
                    event.target.value
                  )
                }
                placeholder="Search tomatoes, vegetables, fruit..."
                className="w-full bg-transparent px-3 py-3.5 text-sm text-[#1F2937] outline-none"
              />
            </div>

            <button
              type="submit"
              className="bg-[#166534] px-6 text-sm font-medium text-white transition hover:bg-[#14532D]"
            >
              Search
            </button>
          </form>

        </div>
      </section>


      {/* =============================================
          MARKETPLACE
      ============================================== */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* MOBILE FILTER BUTTON */}

        <div className="mb-6 flex items-center justify-between lg:hidden">

          <button
            onClick={() =>
              setMobileFiltersOpen(true)
            }
            className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#1F2937]"
          >
            <Filter size={17} />

            Filters

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#166534] px-1 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <SortSelect
            value={filters.sort}
            onChange={handleSort}
          />

        </div>


        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* =========================================
              DESKTOP FILTER SIDEBAR
          ========================================== */}

          <aside className="hidden lg:block">

            <div className="sticky top-24 rounded-2xl border border-[#E5E7EB] bg-white p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-2 font-semibold text-[#1F2937]">
                  <SlidersHorizontal
                    size={18}
                  />

                  Filters
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-[#166534] hover:underline"
                  >
                    Clear
                  </button>
                )}

              </div>

              <div className="my-5 border-t border-[#E5E7EB]" />

              <FilterContent
                filters={filters}
                categories={categories}
                markets={markets}
                updateFilter={updateFilter}
              />

              <button
                onClick={() => applyFilters()}
                className="mt-6 w-full rounded-lg bg-[#166534] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#14532D]"
              >
                Apply Filters
              </button>

            </div>

          </aside>


          {/* =========================================
              PRODUCTS
          ========================================== */}

          <div>

            {/* RESULT HEADER */}

            <div className="mb-6 flex items-center justify-between gap-4">

              <div>
                <h2 className="font-semibold text-[#1F2937]">
                  Products
                </h2>

                {!loading && (
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {products.length}{" "}
                    {products.length === 1
                      ? "product"
                      : "products"}{" "}
                    found
                  </p>
                )}
              </div>


              <div className="hidden lg:block">
                <SortSelect
                  value={filters.sort}
                  onChange={handleSort}
                />
              </div>

            </div>


            {/* LOADING */}

            {loading && (
              <ProductSkeleton />
            )}


            {/* ERROR */}

            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

                <p className="font-medium text-[#DC2626]">
                  {error}
                </p>

                <button
                  onClick={() =>
                    setAppliedFilters({
                      ...appliedFilters,
                    })
                  }
                  className="mt-4 text-sm font-medium text-[#166534] hover:underline"
                >
                  Try again
                </button>

              </div>
            )}


            {/* EMPTY */}

            {!loading &&
              !error &&
              products.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white px-6 py-20 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#166534]">
                    <ShoppingBasket
                      size={26}
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-[#1F2937]">
                    No products found
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6B7280]">
                    Try changing your search or removing
                    some filters.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-5 rounded-lg border border-[#166534] px-5 py-2.5 text-sm font-medium text-[#166534] transition hover:bg-[#DCFCE7]"
                  >
                    Clear Filters
                  </button>

                </div>
              )}


            {/* PRODUCT GRID */}

            {!loading &&
              !error &&
              products.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                  {products.map(
                    (product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                      />
                    )
                  )}

                </div>
              )}

          </div>
        </div>
      </section>


      {/* =============================================
          MOBILE FILTER DRAWER
      ============================================== */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">

          <button
            aria-label="Close filters"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute bottom-0 right-0 top-0 w-[90%] max-w-sm overflow-y-auto bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1F2937]">
                <SlidersHorizontal
                  size={19}
                />

                Filters
              </h2>

              <button
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="rounded-lg p-2 hover:bg-[#F3F4F6]"
              >
                <X size={20} />
              </button>

            </div>

            <div className="my-5 border-t border-[#E5E7EB]" />

            <FilterContent
              filters={filters}
              categories={categories}
              markets={markets}
              updateFilter={updateFilter}
            />

            <div className="mt-7 grid grid-cols-2 gap-3">

              <button
                onClick={clearFilters}
                className="rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm font-medium text-[#1F2937]"
              >
                Clear
              </button>

              <button
                onClick={() =>
                  applyFilters()
                }
                className="rounded-lg bg-[#166534] px-4 py-3 text-sm font-medium text-white"
              >
                Apply
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}


// ======================================================
// FILTER CONTENT
// ======================================================

function FilterContent({
  filters,
  categories,
  markets,
  updateFilter,
}: {
  filters: Filters;
  categories: Category[];
  markets: Market[];
  updateFilter: (
    key: keyof Filters,
    value: string
  ) => void;
}) {
  return (
    <div className="space-y-6">

      {/* CATEGORY */}

      <FilterGroup label="Category">
        <select
          value={filters.category}
          onChange={(event) =>
            updateFilter(
              "category",
              event.target.value
            )
          }
          className="filter-input"
        >
          <option value="">
            All categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.name}
              </option>
            )
          )}
        </select>
      </FilterGroup>


      {/* MARKET */}

      <FilterGroup label="Market">
        <select
          value={filters.market}
          onChange={(event) =>
            updateFilter(
              "market",
              event.target.value
            )
          }
          className="filter-input"
        >
          <option value="">
            All markets
          </option>

          {markets.map(
            (market) => (
              <option
                key={market._id}
                value={market._id}
              >
                {market.name}
              </option>
            )
          )}
        </select>
      </FilterGroup>


      {/* DAY */}

      <FilterGroup label="Market Day">
        <select
          value={filters.day}
          onChange={(event) =>
            updateFilter(
              "day",
              event.target.value
            )
          }
          className="filter-input"
        >
          <option value="">
            Any day
          </option>

          {DAYS.map(
            (day) => (
              <option
                key={day}
                value={day}
              >
                {day}
              </option>
            )
          )}
        </select>
      </FilterGroup>


      {/* PRICE */}

      <FilterGroup label="Price Range">

        <div className="grid grid-cols-2 gap-2">

          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) =>
              updateFilter(
                "minPrice",
                event.target.value
              )
            }
            placeholder="Min"
            className="filter-input"
          />

          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) =>
              updateFilter(
                "maxPrice",
                event.target.value
              )
            }
            placeholder="Max"
            className="filter-input"
          />

        </div>

      </FilterGroup>

    </div>
  );
}


// ======================================================
// FILTER GROUP
// ======================================================

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-[#1F2937]">
        {label}
      </label>

      {children}

    </div>
  );
}


// ======================================================
// SORT
// ======================================================

function SortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#1F2937] outline-none focus:border-[#166534]"
    >
      <option value="newest">
        Newest
      </option>

      <option value="price_asc">
        Price: Low to High
      </option>

      <option value="price_desc">
        Price: High to Low
      </option>
    </select>
  );
}


// ======================================================
// LOADING SKELETON
// ======================================================

function ProductSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

      {Array.from({
        length: 6,
      }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"
          >
            <div className="h-52 animate-pulse bg-[#E5E7EB]" />

            <div className="space-y-3 p-5">

              <div className="h-5 w-2/3 animate-pulse rounded bg-[#E5E7EB]" />

              <div className="h-4 animate-pulse rounded bg-[#F3F4F6]" />

              <div className="h-4 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />

              <div className="mt-5 h-6 w-1/3 animate-pulse rounded bg-[#DCFCE7]" />

            </div>
          </div>
        )
      )}

    </div>
  );
}