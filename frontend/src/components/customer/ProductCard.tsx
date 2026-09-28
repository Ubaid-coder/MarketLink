"use client";
import Link from "next/link";

import {
  Heart,
  ShoppingBasket,
  Store,
} from "lucide-react";

import {
  Product,
} from "@/types/marketplace";
import {
  useCart,
} from "@/context/CartContext";

import {
  useFavorites,
} from "@/context/FavoritesContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {

  const {
    isProductFavorite,
    toggleProductFavorite,
  } = useFavorites();

  const favorite =
    isProductFavorite(
      product._id
    );

  const {
    addToCart,
  } = useCart();
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* IMAGE */}

      <Link
        href={`/marketplace/products/${product._id}`}
        className="relative block h-52 overflow-hidden bg-[#F3F4F6]"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#DCFCE7] text-[#166534]">
            <ShoppingBasket
              size={42}
            />
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#166534] shadow-sm">
          {product.category?.name ||
            "Produce"}
        </span>

        <button
          type="button"
          title={
            favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
          onClick={async (event) => {
            event.preventDefault();
            event.stopPropagation();

            try {
              await toggleProductFavorite(
                product._id
              );
            } catch {
              // Context already handles/logs failure.
            }
          }}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition ${favorite
            ? "border-red-200 text-[#DC2626]"
            : "border-[#E5E7EB] text-[#6B7280] hover:text-[#DC2626]"
            }`}
        >
          <Heart
            size={18}
            fill={
              favorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </Link>


      {/* CONTENT */}

      <div className="p-5">

        <Link
          href={`/marketplace/products/${product._id}`}
        >
          <h3 className="line-clamp-1 text-lg font-semibold text-[#1F2937] transition group-hover:text-[#166534]">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#6B7280]">
          {product.description ||
            "Fresh local produce available for market pickup."}
        </p>


        {/* FARMER */}

        <Link
          href={`/farmers/${product.farmer?._id}`}
          className="mt-4 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#166534]"
        >
          <Store
            size={15}
          />

          {product.farmer
            ?.stallName ||
            "Local Farmer"}
        </Link>


        {/* PRICE */}

        <div className="mt-5 flex items-end justify-between">

          <div>
            <span className="text-xl font-bold text-[#166534]">
              PKR{" "}
              {product.price.toLocaleString()}
            </span>

            <span className="ml-1 text-sm text-[#6B7280]">
              / {product.unit}
            </span>
          </div>

          <span className="text-xs text-[#6B7280]">
            {product.quantityAvailable}{" "}
            available
          </span>

        </div>
        <Link href={'/cart'}>

          <button
            type="button"

            onClick={() =>
              addToCart(
                product,
                1
              )
            }
            disabled={
              product.quantityAvailable <= 0
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#166534] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShoppingBasket
              size={17}
            />

            Add to Cart
          </button>

        </Link>
      </div>
    </article>
  );
}