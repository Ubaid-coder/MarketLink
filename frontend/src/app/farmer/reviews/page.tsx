"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MessageSquare,
  RefreshCcw,
  Send,
  Star,
} from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Review } from "@/types/review";

export default function FarmerReviewsPage() {
  const { farmerProfile } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [respondingTo, setRespondingTo] =
    useState<string | null>(null);

  const [responseText, setResponseText] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);


  // =============================================
  // LOAD REVIEWS
  // =============================================

  const loadReviews = useCallback(async () => {
    if (!farmerProfile?._id) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/reviews/farmer/${farmerProfile._id}`
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
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Unable to load reviews."
      );
    } finally {
      setLoading(false);
    }
  }, [farmerProfile?._id]);


  useEffect(() => {
    loadReviews();
  }, [loadReviews]);


  // =============================================
  // STATS
  // =============================================

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        responded: 0,
      };
    }

    const totalRating = reviews.reduce(
      (sum, review) =>
        sum + review.rating,
      0
    );

    return {
      average:
        totalRating /
        reviews.length,

      total:
        reviews.length,

      responded:
        reviews.filter(
          (review) =>
            Boolean(
              review.farmerResponse
            )
        ).length,
    };
  }, [reviews]);


  // =============================================
  // RESPOND
  // =============================================

  const submitResponse = async (
    reviewId: string
  ) => {
    if (!responseText.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await api.patch(
        `/reviews/${reviewId}/respond`,
        {
          response:
            responseText.trim(),
        }
      );

      setRespondingTo(null);
      setResponseText("");

      await loadReviews();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to submit response."
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div>
      {/* HEADER */}

      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-5 px-5 py-7 sm:px-8 lg:px-10">

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
              Customer Feedback
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#1F2937]">
              Reviews
            </h1>

            <p className="mt-2 text-[#6B7280]">
              See customer feedback and
              respond to reviews about
              your stall and products.
            </p>
          </div>


          <button
            type="button"
            onClick={loadReviews}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#166534] hover:bg-[#DCFCE7] disabled:opacity-50"
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


      <div className="space-y-7 p-5 sm:p-8 lg:p-10">

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]">
            {error}
          </div>
        )}


        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            label="Average Rating"
            value={
              stats.total
                ? stats.average.toFixed(1)
                : "—"
            }
            icon={<Star size={20} />}
          />

          <StatCard
            label="Total Reviews"
            value={stats.total}
            icon={
              <MessageSquare size={20} />
            }
          />

          <StatCard
            label="Responded"
            value={stats.responded}
            icon={<Send size={20} />}
          />

        </div>


        {/* REVIEWS */}

        {loading ? (
          <ReviewsLoading />
        ) : reviews.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white py-20 text-center">

            <MessageSquare
              size={42}
              className="mx-auto text-[#166534]"
            />

            <h2 className="mt-5 text-xl font-semibold text-[#1F2937]">
              No reviews yet
            </h2>

            <p className="mt-2 text-sm text-[#6B7280]">
              Reviews from completed
              customer orders will appear here.
            </p>

          </section>
        ) : (
          <div className="space-y-5">

            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}

                responding={
                  respondingTo ===
                  review._id
                }

                responseText={
                  responseText
                }

                submitting={
                  submitting
                }

                onStartResponse={() => {
                  setRespondingTo(
                    review._id
                  );

                  setResponseText(
                    review.farmerResponse ||
                      ""
                  );
                }}

                onCancel={() => {
                  setRespondingTo(null);
                  setResponseText("");
                }}

                onChange={
                  setResponseText
                }

                onSubmit={() =>
                  submitResponse(
                    review._id
                  )
                }
              />
            ))}

          </div>
        )}

      </div>
    </div>
  );
}


// =============================================
// REVIEW CARD
// =============================================

function ReviewCard({
  review,
  responding,
  responseText,
  submitting,
  onStartResponse,
  onCancel,
  onChange,
  onSubmit,
}: {
  review: Review;

  responding: boolean;

  responseText: string;

  submitting: boolean;

  onStartResponse: () => void;

  onCancel: () => void;

  onChange: (
    value: string
  ) => void;

  onSubmit: () => void;
}) {
  const customerName =
    typeof review.customer === "string"
      ? "Customer"
      : review.customer?.name ||
        "Customer";


  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

      {/* TOP */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <p className="font-semibold text-[#1F2937]">
            {customerName}
          </p>

          <p className="mt-1 text-xs text-[#9CA3AF]">
            {formatDate(
              review.createdAt
            )}
          </p>
        </div>


        <div className="flex items-center gap-1">

          {Array.from({
            length: 5,
          }).map((_, index) => (
            <Star
              key={index}
              size={17}
              className={
                index <
                review.rating
                  ? "fill-[#F59E0B] text-[#F59E0B]"
                  : "text-[#D1D5DB]"
              }
            />
          ))}

          <span className="ml-2 text-sm font-semibold text-[#1F2937]">
            {review.rating}/5
          </span>

        </div>
      </div>


      {/* COMMENT */}

      {review.comment ? (
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#6B7280]">
          {review.comment}
        </p>
      ) : (
        <p className="mt-5 text-sm italic text-[#9CA3AF]">
          No written comment.
        </p>
      )}


      {/* EXISTING FARMER RESPONSE */}

      {review.farmerResponse &&
        !responding && (
          <div className="mt-5 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
              Your Response
            </p>

            <p className="mt-2 text-sm leading-6 text-[#1F2937]">
              {
                review.farmerResponse
              }
            </p>

          </div>
        )}


      {/* RESPONSE FORM */}

      {responding ? (
        <div className="mt-5 border-t border-[#E5E7EB] pt-5">

          <label className="text-sm font-semibold text-[#1F2937]">
            Your Response
          </label>

          <textarea
            rows={3}
            value={
              responseText
            }
            onChange={(event) =>
              onChange(
                event.target.value
              )
            }
            placeholder="Thank the customer or respond to their feedback..."
            className="filter-input mt-2 resize-none"
          />


          <div className="mt-3 flex justify-end gap-3">

            <button
              type="button"
              disabled={submitting}
              onClick={onCancel}
              className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-semibold text-[#6B7280]"
            >
              Cancel
            </button>


            <button
              type="button"
              disabled={
                submitting ||
                !responseText.trim()
              }
              onClick={onSubmit}
              className="flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send size={15} />

              {submitting
                ? "Saving..."
                : "Post Response"}
            </button>

          </div>

        </div>
      ) : (
        <div className="mt-5 flex justify-end">

          <button
            type="button"
            onClick={
              onStartResponse
            }
            className="flex items-center gap-2 rounded-xl border border-[#166534] px-4 py-2.5 text-sm font-semibold text-[#166534] transition hover:bg-[#DCFCE7]"
          >
            <MessageSquare
              size={15}
            />

            {review.farmerResponse
              ? "Edit Response"
              : "Respond"}
          </button>

        </div>
      )}

    </article>
  );
}


// =============================================
// STAT CARD
// =============================================

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-[#6B7280]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[#1F2937]">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#166534]">
          {icon}
        </div>

      </div>
    </div>
  );
}


// =============================================
// DATE
// =============================================

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


// =============================================
// LOADING
// =============================================

function ReviewsLoading() {
  return (
    <div className="space-y-5">

      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-52 animate-pulse rounded-2xl bg-[#E5E7EB]"
        />
      ))}

    </div>
  );
}