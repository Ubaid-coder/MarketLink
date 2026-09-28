"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CartGroup,
  CartItem,
  Product,
} from "@/types/marketplace";

interface CartContextType {
  items: CartItem[];

  cartCount: number;
  cartTotal: number;

  groups: CartGroup[];

  addToCart: (
    product: Product,
    quantity?: number
  ) => void;

  removeFromCart: (
    productId: string
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  clearFarmerItems: (
    farmerId: string
  ) => void;

  isInCart: (
    productId: string
  ) => boolean;
}

const CartContext =
  createContext<CartContextType | undefined>(
    undefined
  );

const STORAGE_KEY =
  "marketlink_cart";

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  // ====================================================
  // RESTORE CART
  // ====================================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to restore cart:",
        error
      );

      localStorage.removeItem(
        STORAGE_KEY
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  // ====================================================
  // SAVE CART
  // ====================================================

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items, hydrated]);

  // ====================================================
  // ADD
  // ====================================================

  const addToCart = (
    product: Product,
    quantity = 1
  ) => {
    if (
      quantity < 1 ||
      product.quantityAvailable < 1
    ) {
      return;
    }

    setItems((currentItems) => {
      const existing =
        currentItems.find(
          (item) =>
            item.product._id ===
            product._id
        );

      if (existing) {
        return currentItems.map(
          (item) => {
            if (
              item.product._id !==
              product._id
            ) {
              return item;
            }

            const nextQuantity =
              Math.min(
                item.quantity +
                  quantity,
                product.quantityAvailable
              );

            return {
              ...item,
              quantity:
                nextQuantity,
            };
          }
        );
      }

      return [
        ...currentItems,
        {
          product,
          quantity: Math.min(
            quantity,
            product.quantityAvailable
          ),
        },
      ];
    });
  };

  // ====================================================
  // REMOVE
  // ====================================================

  const removeFromCart = (
    productId: string
  ) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.product._id !==
          productId
      )
    );
  };

  // ====================================================
  // UPDATE QUANTITY
  // ====================================================

  const updateQuantity = (
    productId: string,
    quantity: number
  ) => {
    setItems((current) =>
      current.map((item) => {
        if (
          item.product._id !==
          productId
        ) {
          return item;
        }

        const safeQuantity =
          Math.max(
            1,
            Math.min(
              quantity,
              item.product
                .quantityAvailable
            )
          );

        return {
          ...item,
          quantity:
            safeQuantity,
        };
      })
    );
  };

  // ====================================================
  // CLEAR EVERYTHING
  // ====================================================

  const clearCart = () => {
    setItems([]);
  };

  // ====================================================
  // CLEAR ONE FARMER
  // ====================================================

  const clearFarmerItems = (
    farmerId: string
  ) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.product.farmer
            ?._id !== farmerId
      )
    );
  };

  // ====================================================
  // CHECK PRODUCT
  // ====================================================

  const isInCart = (
    productId: string
  ) => {
    return items.some(
      (item) =>
        item.product._id ===
        productId
    );
  };

  // ====================================================
  // TOTAL QUANTITY
  // ====================================================

  const cartCount =
    useMemo(() => {
      return items.reduce(
        (total, item) =>
          total +
          item.quantity,
        0
      );
    }, [items]);

  // ====================================================
  // TOTAL PRICE
  // ====================================================

  const cartTotal =
    useMemo(() => {
      return items.reduce(
        (total, item) =>
          total +
          item.product.price *
            item.quantity,
        0
      );
    }, [items]);

  // ====================================================
  // GROUP BY FARMER
  // ====================================================

  const groups =
    useMemo<CartGroup[]>(
      () => {
        const map =
          new Map<
            string,
            CartGroup
          >();

        for (const item of items) {
          const farmer =
            item.product.farmer;

          if (!farmer?._id) {
            continue;
          }

          const existing =
            map.get(
              farmer._id
            );

          if (existing) {
            existing.items.push(
              item
            );
          } else {
            map.set(
              farmer._id,
              {
                farmer,
                items: [item],
              }
            );
          }
        }

        return Array.from(
          map.values()
        );
      },
      [items]
    );

  return (
    <CartContext.Provider
      value={{
        items,

        cartCount,
        cartTotal,

        groups,

        addToCart,
        removeFromCart,
        updateQuantity,

        clearCart,
        clearFarmerItems,

        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}