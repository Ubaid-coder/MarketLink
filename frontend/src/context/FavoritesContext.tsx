"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import api from "@/lib/api";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  Farmer,
  Product,
} from "@/types/marketplace";


interface FavoritesContextType {
  favoriteProducts: Product[];

  favoriteFarmers: Farmer[];

  loading: boolean;

  isProductFavorite: (
    productId: string
  ) => boolean;

  isFarmerFavorite: (
    farmerId: string
  ) => boolean;

  toggleProductFavorite: (
    productId: string
  ) => Promise<void>;

  toggleFarmerFavorite: (
    farmerId: string
  ) => Promise<void>;

  refreshFavorites:
    () => Promise<void>;
}


const FavoritesContext =
  createContext<
    FavoritesContextType | undefined
  >(undefined);


export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    favoriteProducts,
    setFavoriteProducts,
  ] = useState<Product[]>([]);

  const [
    favoriteFarmers,
    setFavoriteFarmers,
  ] = useState<Farmer[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ================================================
  // LOAD FAVORITES
  // ================================================

  const refreshFavorites =
    useCallback(async () => {
      if (
        !user ||
        user.role !== "customer"
      ) {
        setFavoriteProducts([]);
        setFavoriteFarmers([]);

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.get(
            "/favorites"
          );

        setFavoriteProducts(
          response.data
            .favoriteProducts ||
            response.data
              .favorites
              ?.products ||
            []
        );

        setFavoriteFarmers(
          response.data
            .favoriteFarmers ||
            response.data
              .favorites
              ?.farmers ||
            []
        );
      } catch (error) {
        console.error(
          "Failed to load favorites:",
          error
        );
      } finally {
        setLoading(false);
      }
    }, [user]);


  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshFavorites();
  }, [
    authLoading,
    refreshFavorites,
  ]);


  // ================================================
  // PRODUCT CHECK
  // ================================================

  const productIds =
    useMemo(
      () =>
        new Set(
          favoriteProducts.map(
            (product) =>
              product._id
          )
        ),
      [favoriteProducts]
    );


  const farmerIds =
    useMemo(
      () =>
        new Set(
          favoriteFarmers.map(
            (farmer) =>
              farmer._id
          )
        ),
      [favoriteFarmers]
    );


  const isProductFavorite = (
    productId: string
  ) => {
    return productIds.has(
      productId
    );
  };


  const isFarmerFavorite = (
    farmerId: string
  ) => {
    return farmerIds.has(
      farmerId
    );
  };


  // ================================================
  // AUTH REQUIREMENT
  // ================================================

  const requireCustomer =
    () => {
      if (
        !user ||
        user.role !== "customer"
      ) {
        router.push(
          "/login"
        );

        return false;
      }

      return true;
    };


  // ================================================
  // TOGGLE PRODUCT
  // ================================================

  const toggleProductFavorite =
    async (
      productId: string
    ) => {
      if (
        !requireCustomer()
      ) {
        return;
      }

      try {
        await api.patch(
          `/favorites/products/${productId}`
        );

        await refreshFavorites();
      } catch (error) {
        console.error(
          "Product favorite failed:",
          error
        );

        throw error;
      }
    };


  // ================================================
  // TOGGLE FARMER
  // ================================================

  const toggleFarmerFavorite =
    async (
      farmerId: string
    ) => {
      if (
        !requireCustomer()
      ) {
        return;
      }

      try {
        await api.patch(
          `/favorites/farmers/${farmerId}`
        );

        await refreshFavorites();
      } catch (error) {
        console.error(
          "Farmer favorite failed:",
          error
        );

        throw error;
      }
    };


  return (
    <FavoritesContext.Provider
      value={{
        favoriteProducts,
        favoriteFarmers,

        loading,

        isProductFavorite,
        isFarmerFavorite,

        toggleProductFavorite,
        toggleFarmerFavorite,

        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}


export function useFavorites() {
  const context =
    useContext(
      FavoritesContext
    );

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider"
    );
  }

  return context;
}