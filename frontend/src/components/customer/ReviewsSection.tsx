"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  MessageSquare,
  Star,
} from "lucide-react";

import api from "@/lib/api";

import {
  Review,
} from "@/types/review";


interface ReviewsSectionProps {
  type:
    | "product"
    | "farmer";

  id: string;
}


export default function ReviewsSection({
  type,
  id,
}: ReviewsSectionProps) {
  const [
    reviews,
    setReviews,
  ] = useState<Review[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // ================================================
  // LOAD REVIEWS
  // ================================================

  useEffect(() => {
    if (!id) return;

    const loadReviews =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.get(
              `/reviews/${type}/${id}`
            );

          setReviews(
            response.data.reviews ||
              []
          );
        } catch (error) {
          console.error(
            "Failed to load reviews:",
            error
          );

          setReviews([]);
        } finally {
          setLoading(false);
        }
      };

    loadReviews();
  }, [
    type,
    id,
  ]);


  // ================================================
  // AVERAGE
  // ================================================

  const averageRating =
    useMemo(() => {
      if (
        reviews.length === 0
      ) {
        return 0;
      }

      const total =
        reviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            review.rating,
          0
        );

      return (
        total /
        reviews.length
      );
    }, [reviews]);


  // ================================================
  // LOADING
  // ================================================

  if (loading) {
    return (
      <div className="mt-8 space-y-4">

        {Array.from({
          length: 2,
        }).map(
          (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-[#E5E7EB]"
            />
          )
        )}

      </div>
    );
  }


  return (
    <section>

      {/* SUMMARY */}

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider text-[#22C55E]">
            Customer feedback
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[#1F2937]">
            Reviews
          </h2>

        </div>


        {reviews.length >
          0 && (
          <div className="flex items-center gap-3">

            <div className="flex items-center gap-1 text-[#F59E0B]">

              <Star
                size={21}
                fill="currentColor"
              />

              <span className="text-lg font-bold text-[#1F2937]">
                {averageRating.toFixed(
                  1
                )}
              </span>

            </div>

            <span className="text-sm text-[#6B7280]">
              {reviews.length}{" "}
              {reviews.length ===
              1
                ? "review"
                : "reviews"}
            </span>

          </div>
        )}

      </div>


      {/* EMPTY */}

      {reviews.length ===
      0 ? (
        <div className="mt-7 rounded-2xl border border-dashed border-[#D1D5DB] bg-[#FAFAF7] py-12 text-center">

          <MessageSquare
            size={34}
            className="mx-auto text-[#166534]"
          />

          <h3 className="mt-4 font-semibold text-[#1F2937]">
            No reviews yet
          </h3>

          <p className="mt-2 text-sm text-[#6B7280]">
            Customer reviews will
            appear here after
            completed orders.
          </p>

        </div>
      ) : (
        <div className="mt-7 space-y-4">

          {reviews.map(
            (review) => (
              <ReviewCard
                key={
                  review._id
                }
                review={
                  review
                }
              />
            )
          )}

        </div>
      )}

    </section>
  );
}


// ======================================================
// REVIEW CARD
// ======================================================

function ReviewCard({
  review,
}: {
  review: Review;
}) {
  const customerName =
    typeof review.customer ===
    "string"
      ? "MarketLink Customer"
      : review.customer
          ?.name ||
        "MarketLink Customer";


  return (
    <article className="rounded-2xl border border-[#E5E7EB] bg-white p-6">

      <div className="flex flex-wrap items-start justify-between gap-3">

        <div>

          <p className="font-semibold text-[#1F2937]">
            {customerName}
          </p>

          <p className="mt-1 text-xs text-[#9CA3AF]">
            {new Date(
              review.createdAt
            ).toLocaleDateString()}
          </p>

        </div>


        <div className="flex gap-0.5">

          {[
            1,
            2,
            3,
            4,
            5,
          ].map(
            (star) => (
              <Star
                key={
                  star
                }
                size={17}
                fill={
                  star <=
                  review.rating
                    ? "currentColor"
                    : "none"
                }
                className={
                  star <=
                  review.rating
                    ? "text-[#F59E0B]"
                    : "text-[#D1D5DB]"
                }
              />
            )
          )}

        </div>

      </div>


      {review.comment && (
        <p className="mt-4 text-sm leading-6 text-[#6B7280]">
          {review.comment}
        </p>
      )}


      {/* FARMER RESPONSE */}

      {review.farmerResponse && (
        <div className="mt-5 rounded-xl border-l-4 border-[#166534] bg-[#F0FDF4] p-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
            Farmer Response
          </p>

          <p className="mt-2 text-sm leading-6 text-[#4B5563]">
            {
              review.farmerResponse
            }
          </p>

        </div>
      )}

    </article>
  );
}