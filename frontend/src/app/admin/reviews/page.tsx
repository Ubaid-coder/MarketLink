"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  MessageSquareWarning,
  RefreshCcw,
  Search,
  Star,
  Store,
  UserRound,
} from "lucide-react";

import api from "@/lib/api";

interface ReviewCustomer {
  _id: string;
  name: string;
  email?: string;
}

interface ReviewFarmer {
  _id: string;
  stallName: string;
  contactPerson?: string;
}

interface ReviewProduct {
  _id: string;
  name: string;
  image?: string;
}

interface AdminReview {
  _id: string;

  customer:
    | ReviewCustomer
    | string;

  farmer?:
    | ReviewFarmer
    | string;

  product?:
    | ReviewProduct
    | string;

  order:
    | {
        _id: string;
        status?: string;
        totalAmount?: number;
      }
    | string;

  rating: number;
  comment?: string;
  farmerResponse?: string;
  isVisible: boolean;
  createdAt: string;
}

type ReviewFilter =
  | "all"
  | "visible"
  | "hidden";

export default function AdminReviewsPage() {
  const [reviews, setReviews] =
    useState<AdminReview[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<ReviewFilter>("all");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  // ==========================================
  // LOAD
  // ==========================================

  const loadReviews =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/admin/reviews"
          );

        const raw =
          response.data.reviews ||
          response.data.data ||
          response.data ||
          [];

        setReviews(
          Array.isArray(raw)
            ? raw
            : []
        );
      } catch (error: any) {
        setError(
          error?.response?.data?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ==========================================
  // VISIBILITY
  // ==========================================

  const updateVisibility = async (
    review: AdminReview
  ) => {
    try {
      setUpdatingId(review._id);
      setError("");

      await api.patch(
        `/reviews/${review._id}/visibility`,
        {
          isVisible:
            !review.isVisible,
        }
      );

      setReviews((current) =>
        current.map((item) =>
          item._id === review._id
            ? {
                ...item,
                isVisible:
                  !item.isVisible,
              }
            : item
        )
      );
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update review visibility."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredReviews =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reviews.filter(
        (review) => {
          const customer =
            typeof review.customer ===
            "string"
              ? ""
              : review.customer.name;

          const farmer =
            !review.farmer ||
            typeof review.farmer ===
              "string"
              ? ""
              : review.farmer
                  .stallName;

          const product =
            !review.product ||
            typeof review.product ===
              "string"
              ? ""
              : review.product.name;

          const text = [
            customer,
            farmer,
            product,
            review.comment,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesFilter =
            filter === "all" ||
            (filter ===
              "visible" &&
              review.isVisible) ||
            (filter ===
              "hidden" &&
              !review.isVisible);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      reviews,
      search,
      filter,
    ]);

  const visibleCount =
    reviews.filter(
      (review) =>
        review.isVisible
    ).length;

  const hiddenCount =
    reviews.length -
    visibleCount;

  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Moderation
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Reviews
            </h1>

            <p className="mt-2 text-[#6B7280]">
              Moderate customer reviews
              across MarketLink.
            </p>
          </div>

          <button
            onClick={loadReviews}
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

        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Reviews"
            value={reviews.length}
          />

          <StatCard
            title="Visible"
            value={visibleCount}
          />

          <StatCard
            title="Hidden"
            value={hiddenCount}
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
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search reviews, customers, farmers..."
                className="w-full bg-transparent px-3 py-3 text-sm outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target
                    .value as ReviewFilter
                )
              }
              className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="all">
                All Reviews
              </option>

              <option value="visible">
                Visible
              </option>

              <option value="hidden">
                Hidden
              </option>
            </select>
          </div>
        </section>

        {/* REVIEWS */}

        {loading ? (
          <div className="space-y-4">
            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-56 animate-pulse rounded-2xl bg-[#E5E7EB]"
                />
              )
            )}
          </div>
        ) : filteredReviews.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">
            <MessageSquareWarning
              size={44}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-4 text-xl font-semibold text-[#1F2937]">
              No reviews found
            </h2>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map(
              (review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  updating={
                    updatingId ===
                    review._id
                  }
                  onVisibility={() =>
                    updateVisibility(
                      review
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  updating,
  onVisibility,
}: {
  review: AdminReview;
  updating: boolean;
  onVisibility: () => void;
}) {
  const customer =
    typeof review.customer ===
    "string"
      ? null
      : review.customer;

  const farmer =
    !review.farmer ||
    typeof review.farmer ===
      "string"
      ? null
      : review.farmer;

  const product =
    !review.product ||
    typeof review.product ===
      "string"
      ? null
      : review.product;

  return (
    <article
      className={`rounded-2xl border bg-white p-6 ${
        review.isVisible
          ? "border-[#E5E7EB]"
          : "border-red-100 opacity-75"
      }`}
    >
      <div className="flex flex-col justify-between gap-5 md:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 font-semibold text-[#1F2937]">
              <UserRound
                size={17}
                className="text-[#166534]"
              />

              {customer?.name ||
                "Customer"}
            </div>

            <div className="flex">
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <Star
                    key={index}
                    size={15}
                    className={
                      index <
                      review.rating
                        ? "fill-[#F59E0B] text-[#F59E0B]"
                        : "text-[#D1D5DB]"
                    }
                  />
                )
              )}
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                review.isVisible
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : "bg-red-100 text-[#DC2626]"
              }`}
            >
              {review.isVisible
                ? "Visible"
                : "Hidden"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#6B7280]">
            {farmer && (
              <span className="flex items-center gap-1">
                <Store size={13} />
                {farmer.stallName}
              </span>
            )}

            {product && (
              <span>
                Product:{" "}
                {product.name}
              </span>
            )}

            <span>
              {new Date(
                review.createdAt
              ).toLocaleDateString()}
            </span>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#1F2937]">
            {review.comment ||
              "No written comment."}
          </p>

          {review.farmerResponse && (
            <div className="mt-5 rounded-xl bg-[#FAFAF7] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
                Farmer Response
              </p>

              <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                {
                  review.farmerResponse
                }
              </p>
            </div>
          )}
        </div>

        <div>
          <button
            type="button"
            disabled={updating}
            onClick={onVisibility}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
              review.isVisible
                ? "border border-red-200 text-[#DC2626] hover:bg-red-50"
                : "bg-[#166534] text-white hover:bg-[#14532D]"
            }`}
          >
            {review.isVisible ? (
              <>
                <EyeOff size={16} />
                Hide
              </>
            ) : (
              <>
                <Eye size={16} />
                Restore
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-sm text-[#6B7280]">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#1F2937]">
        {value}
      </p>
    </div>
  );
}