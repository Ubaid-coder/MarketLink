import type {
  Metadata,
} from "next";

import "./globals.css";

import {
  AuthProvider,
} from "@/context/AuthContext";

import {
  CartProvider,
} from "@/context/CartContext";

import {
  FavoritesProvider,
} from "@/context/FavoritesContext";


export const metadata: Metadata = {
  title: "MarketLink",
  description:
    "Fresh produce from local farmers",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body>

        <AuthProvider>

          <CartProvider>

            <FavoritesProvider>

              {children}

            </FavoritesProvider>

          </CartProvider>

        </AuthProvider>

      </body>

    </html>
  );
}