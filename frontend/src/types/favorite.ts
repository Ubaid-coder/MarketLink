import {
  Farmer,
  Product,
} from "@/types/marketplace";

export interface FavoritesResponse {
  favoriteProducts: Product[];
  favoriteFarmers: Farmer[];
}