"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import api from "@/lib/api";

import {
  FarmerProfile,
  User,
} from "@/types/auth";


// ======================================================
// TYPES
// ======================================================

interface LoginData {
  email: string;
  password: string;
}

interface CustomerRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

interface FarmerRegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;

  stallName: string;
  contactPerson: string;
  description?: string;
}

interface AuthContextType {
  user: User | null;

  farmerProfile:
    FarmerProfile | null;

  token: string | null;

  loading: boolean;

  login: (
    data: LoginData
  ) => Promise<User>;

  registerCustomer: (
    data: CustomerRegisterData
  ) => Promise<void>;

  registerFarmer: (
    data: FarmerRegisterData
  ) => Promise<void>;

  logout: () => void;

  refreshUser: () => Promise<void>;
}


// ======================================================
// CONTEXT
// ======================================================

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);


// ======================================================
// PROVIDER
// ======================================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [
    farmerProfile,
    setFarmerProfile,
  ] =
    useState<FarmerProfile | null>(
      null
    );

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);


  // ====================================================
  // GET CURRENT USER
  // ====================================================

  const refreshUser =
    async () => {
      try {
        const response =
          await api.get(
            "/auth/me"
          );

        /*
          Adjust these two lines only if your backend
          response uses slightly different property names.
        */

        setUser(
          response.data.user
        );

        setFarmerProfile(
          response.data
            .farmerProfile || null
        );
      } catch (error) {
        console.error(
          "Get current user failed:",
          error
        );

        localStorage.removeItem(
          "marketlink_token"
        );

        setToken(null);
        setUser(null);
        setFarmerProfile(null);
      }
    };


  // ====================================================
  // RESTORE SESSION
  // ====================================================

  useEffect(() => {
    const restoreSession =
      async () => {
        const savedToken =
          localStorage.getItem(
            "marketlink_token"
          );

        if (!savedToken) {
          setLoading(false);
          return;
        }

        setToken(savedToken);

        try {
          await refreshUser();
        } finally {
          setLoading(false);
        }
      };

    restoreSession();
  }, []);


  // ====================================================
  // LOGIN
  // ====================================================

  const login = async (
    data: LoginData
  ): Promise<User> => {
    const response =
      await api.post(
        "/auth/login",
        data
      );

    const receivedToken =
      response.data.token;

    const loggedInUser =
      response.data.user;

    if (
      !receivedToken ||
      !loggedInUser
    ) {
      throw new Error(
        "Invalid login response"
      );
    }

    localStorage.setItem(
      "marketlink_token",
      receivedToken
    );

    setToken(
      receivedToken
    );

    setUser(
      loggedInUser
    );

    setFarmerProfile(
      response.data
        .farmerProfile || null
    );

    return loggedInUser;
  };


  // ====================================================
  // CUSTOMER REGISTRATION
  // ====================================================

  const registerCustomer =
    async (
      data:
        CustomerRegisterData
    ) => {
      await api.post(
        "/auth/register/customer",
        data
      );
    };


  // ====================================================
  // FARMER REGISTRATION
  // ====================================================

  const registerFarmer =
    async (
      data:
        FarmerRegisterData
    ) => {
      await api.post(
        "/auth/register/farmer",
        data
      );
    };


  // ====================================================
  // LOGOUT
  // ====================================================

  const logout = () => {
    localStorage.removeItem(
      "marketlink_token"
    );

    setToken(null);
    setUser(null);
    setFarmerProfile(null);

    router.push("/login");
  };


  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        farmerProfile,
        token,
        loading,

        login,
        registerCustomer,
        registerFarmer,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ======================================================
// HOOK
// ======================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}